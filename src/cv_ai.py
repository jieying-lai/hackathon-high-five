"""Opt-in RunPod CV organisation. Uploads are never used as training examples."""
import hashlib
import json
import os
from pathlib import Path
import re
import threading
import time
import uuid

import requests
from dotenv import dotenv_values
from cv_model_contract import CONTRACT_VERSION, MODEL_ID, validate_output, validate_pages

_slots = threading.BoundedSemaphore(1)


class CVAIError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def settings():
    local = dotenv_values(Path(__file__).resolve().parents[1] / '.env')
    def get(key, default=''):
        return os.environ.get(key, local.get(key) or default).strip()
    return {'enabled': get('CV_AI_PROVIDER', 'local') == 'runpod',
            'endpoint': get('CV_RUNPOD_ENDPOINT_ID'), 'key': get('RUNPOD_API_KEY'),
            'model': get('CV_MODEL_ID', MODEL_ID)}


def status():
    cfg = settings()
    ready = bool(cfg['enabled'] and re.fullmatch(r'[A-Za-z0-9_-]{4,100}', cfg['endpoint']) and cfg['key'])
    return {'available': ready, 'model': cfg['model'], 'provider': 'RunPod',
            'message': 'RunPod configured; model quality still requires evaluation.' if ready else
            'AI organisation is not connected yet. Local PDF extraction is available.',
            'training_status': 'Pretrained model integration; no CV fine-tuning or quality certification claimed.'}


def request_draft(pages):
    cfg = settings()
    if not status()['available']:
        raise CVAIError('RunPod CV model is not configured. Your local CV draft is unchanged.', 503)
    validate_pages(pages)
    base = 'https://api.runpod.ai/v2/' + cfg['endpoint']
    headers = {'Authorization': 'Bearer ' + cfg['key']}
    job_id = None
    completed = False
    with requests.Session() as client:
        try:
            # Submit once. Retrying a timed-out submission could create a second billed job.
            response = client.post(base + '/runsync', headers=headers, json={
                'input': {'task': CONTRACT_VERSION, 'pages': pages},
                'policy': {'executionTimeout': 120000, 'ttl': 180000}}, timeout=(10, 65))
            response.raise_for_status()
            result = response.json()
            if not isinstance(result, dict):
                raise ValueError('Invalid response')
            job_id = result.get('id')
            if job_id is not None and not re.fullmatch(r'[A-Za-z0-9_-]{1,150}', str(job_id)):
                job_id = None
                raise ValueError('Invalid job ID')
            deadline = time.monotonic() + 65
            while result.get('status') in ('IN_QUEUE', 'IN_PROGRESS'):
                if not job_id or time.monotonic() >= deadline:
                    raise CVAIError('The model is still starting or took too long. Your draft is unchanged. Try again later.', 504)
                time.sleep(2)
                response = client.get(base + '/status/' + job_id, headers=headers, timeout=(5, 15))
                response.raise_for_status()
                result = response.json()
                if not isinstance(result, dict):
                    raise ValueError('Invalid response')
            completed = result.get('status') == 'COMPLETED'
            output = result.get('output')
            if not completed or not isinstance(output, dict) or output.get('contract') != CONTRACT_VERSION:
                raise CVAIError('The RunPod worker could not organise this CV. Your existing draft is unchanged.', 502)
            if output.get('model_id') != cfg['model']:
                raise CVAIError('The endpoint is running a different model than configured. Your draft is unchanged.', 502)
            draft = validate_output(output.get('draft'), pages)
            metadata = {key: str(output.get(key) or '')[:200] for key in ('model_id', 'model_revision', 'adapter_version')}
            return draft, metadata
        except CVAIError:
            raise
        except (requests.RequestException, ValueError, TypeError, KeyError):
            raise CVAIError('The AI service returned an unavailable or unsupported result. Your draft is unchanged.', 502) from None
        finally:
            if job_id and not completed:
                try:
                    client.post(base + '/cancel/' + job_id, headers=headers, timeout=(5, 10))
                except requests.RequestException:
                    pass


def organise(owner_uid, payload):
    import cv_engine
    from candidate_comparison import structured_dimensions
    from skills_taxonomy import expand_for_matching
    if payload.get('external_ai_consent') is not True:
        raise CVAIError('Confirm that RunPod may process your PDF text before using AI organisation.')
    if not status()['available']:
        raise CVAIError('The RunPod CV model is not connected yet. Local extraction remains available.', 503)
    if not _slots.acquire(blocking=False):
        raise CVAIError('Another CV is being processed. Please try again shortly.', 429)
    try:
        conn = cv_engine.get_db_connection()
        try:
            row = conn.execute('SELECT * FROM user_cvs WHERE owner_uid=?', (owner_uid,)).fetchone()
            row = dict(row) if row else None
        finally:
            conn.close()
        if not row:
            raise CVAIError('Upload your PDF first.', 404)
        prior = json.loads(row['structured_cv_json'])
        if (payload.get('expected_file_sha256') != row['file_sha256'] or
                payload.get('expected_vault_version') != prior.get('vault_version_id')):
            raise CVAIError('Your CV changed. Reload the vault and try again.', 409)
        path = row['stored_pdf_path']
        if not cv_engine._upload_path_is_private(path):
            raise CVAIError('The stored PDF is unavailable.', 404)
        try:
            with open(path, 'rb') as stream:
                pdf = stream.read(cv_engine.MAX_PDF_BYTES + 1)
        except OSError:
            raise CVAIError('The stored PDF is unavailable.', 404) from None
        if hashlib.sha256(pdf).hexdigest() != row['file_sha256']:
            raise CVAIError('The stored PDF changed. Upload it again.', 409)
        ok, message, parsed = cv_engine.parse_and_summarize_pdf_cv(pdf, row['original_filename'])
        if not ok:
            raise CVAIError(message)
        try:
            validate_pages(parsed['page_texts'])
        except ValueError as exc:
            raise CVAIError(str(exc)) from None
        draft, metadata = request_draft(parsed['page_texts'])
        # Validate again at the persistence boundary, including when using a future provider.
        try:
            draft = validate_output(draft, parsed['page_texts'])
        except (ValueError, TypeError):
            raise CVAIError('The model draft did not pass source validation. Your existing draft is unchanged.', 502) from None
        structured = parsed['structured_cv']
        for key, item in draft['fields'].items():
            if item:
                structured[key] = item['value']
                structured['field_evidence'][key] = {'source': 'model-selected PDF evidence', 'page': item['page'], 'quote': item['quote']}
        mapping = {'summary': 'executive_summary', 'experience': 'work_experience',
                   'education': 'education_history', 'projects': 'projects', 'certifications': 'certifications'}
        for section, field in mapping.items():
            items = draft['sections'][section]
            # Missing model sections retain the conservative local extraction.
            if items:
                structured[field] = ' '.join(i['text'] for i in items) if section == 'summary' else [i['text'] for i in items]
                structured['field_evidence'][field] = {'source': 'model-selected PDF evidence',
                    'page': items[0]['page'], 'quote': items[0]['text'][:600]}
        # Existing skill rules remain conservative; proposed extra mentions require explicit owner review.
        structured['ai_suggested_skills'] = draft['sections']['skills']
        structured['ai_section_evidence'] = draft['sections']
        structured['expanded_skills'] = expand_for_matching(structured['skills'])
        structured.update(structured_dimensions(structured))
        structured.pop('parser_analytics', None)
        structured['ai_highlights'] = []
        structured['model_provenance'] = {**metadata, 'contract': CONTRACT_VERSION,
            'provider': 'RunPod', 'consented_at': cv_engine._now(), 'custom_training_verified': False}
        structured['extraction_method'] = 'Local PDF extraction + ' + metadata['model_id'] + ' on RunPod; source-checked draft'
        structured['review_warnings'] = ['AI can omit or misclassify details even when quotes match. Check every section against the original PDF.',
            'AI-suggested skills are not added to matching automatically; review and add only those you actually have.']
        structured['review_status'] = 'needs_review'
        structured['vault_version_id'] = prior['vault_version_id']
        structured['profile_revision_id'] = uuid.uuid4().hex
        structured['privacy_notice'] = 'PDF text was sent to your configured RunPod worker with consent. It is not added to a training dataset by this app.'
        conn = cv_engine.get_db_connection()
        try:
            conn.execute('BEGIN IMMEDIATE')
            current = conn.execute('SELECT * FROM user_cvs WHERE owner_uid=?', (owner_uid,)).fetchone()
            if (not current or current['file_sha256'] != row['file_sha256'] or
                    current['structured_cv_json'] != row['structured_cv_json']):
                raise CVAIError('Your profile changed while AI was working. Its result was discarded; reload before trying again.', 409)
            conn.execute('DELETE FROM job_applications WHERE candidate_uid=?', (owner_uid,))
            conn.execute('UPDATE user_cvs SET structured_cv_json=?,updated_at=? WHERE owner_uid=?',
                         (json.dumps(structured), cv_engine._now(), owner_uid))
            conn.commit()
        finally:
            conn.close()
        return cv_engine.get_user_cv(owner_uid)
    finally:
        _slots.release()
