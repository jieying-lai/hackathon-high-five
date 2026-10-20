import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
import questionnaire_engine as engine
from main import app


def basics():
    return {**{key: values[0] for key, values in engine.CATALOG['choices'].items()},
            'cField': 'Finance & Accounting', 'c2': 'Accountant', 'cState': 'Selangor', 'c4': 'Petaling'}


CV = {'structured_cv': {'review_status': 'reviewed', 'industry': 'Finance & Accounting', 'skills': ['Excel', 'SQL'],
                         'current_role': 'Accounts Executive', 'executive_summary': 'Financial reporting experience.'}}


class QuestionnaireContracts(unittest.TestCase):
    @patch.dict(os.environ, {'QUESTIONNAIRE_PROVIDER': 'gemini', 'GEMINI_API_KEY': 'test-only'})
    @patch('questionnaire_engine.requests.post')
    def test_external_processing_requires_explicit_consent_and_review(self, post):
        for consent, cv, expected in [(False, CV, 403), (True, {'structured_cv': {'skills': ['SQL']}}, 409)]:
            with self.assertRaises(engine.QuestionnaireError) as exc:
                engine.generate(cv, basics()['cField'], basics(), external_ai_consent=consent)
            self.assertEqual(exc.exception.status, expected)
        post.assert_not_called()

    @patch.dict(os.environ, {'QUESTIONNAIRE_PROVIDER': 'local', 'GEMINI_API_KEY': '', 'GOOGLE_API_KEY': ''})
    @patch('questionnaire_engine.requests.post', side_effect=AssertionError('Offline mode must not use network'))
    def test_no_key_clone_flow_for_every_field(self, post):
        client = app.test_client()
        client.environ_base["HTTP_X_CSRF_TOKEN"] = client.get("/api/auth/csrf").json["csrf_token"]
        with client.session_transaction() as session:
            session['user'] = {'role': 'job_seeker', 'unique_uid': 'offline-demo'}
        with patch('main.cv_engine.get_user_cv', return_value=CV):
            for field, roles in engine.CATALOG['roles'].items():
                chosen = {**basics(), 'cField': field, 'c2': roles[0]}
                result = client.post('/api/questionnaire/recommendations', json={'field': field})
                self.assertEqual(result.status_code, 200)
                self.assertEqual(result.json['mode'], 'local')
                self.assertEqual(len(result.json['recommendations']), 1)
                self.assertTrue(all(item['role'] in roles for item in result.json['recommendations']))
                result = client.post('/api/questionnaire/questions', json={'field': field, 'answers': chosen})
                self.assertEqual(result.status_code, 200)
                self.assertEqual(len(result.json['questions']), 4)
                self.assertIn(roles[0], result.json['questions'][0]['question'])
        post.assert_not_called()

    @patch.dict(os.environ, {'QUESTIONNAIRE_PROVIDER': 'local'})
    def test_local_recommendations_depend_on_cv_evidence(self):
        frontend = {'structured_cv': {'skills': ['React', 'JavaScript', 'HTML', 'CSS']}}
        analyst = {'structured_cv': {'skills': ['SQL', 'Excel', 'Power BI', 'Python']}}
        first = engine.generate(frontend, 'IT & Software', action='recommendations')
        second = engine.generate(analyst, 'IT & Software', action='recommendations')
        self.assertEqual(first['recommendations'][0]['role'], 'Frontend Developer')
        self.assertEqual(first['recommendations'][0]['skill_coverage_pct'], 100)
        empty = engine.generate({'structured_cv': {'skills': ['Unrelated skill']}}, 'IT & Software', action='recommendations')
        self.assertEqual(empty['recommendations'][0]['skill_coverage_pct'], 0)
        self.assertEqual(second['recommendations'][0]['role'], 'Data Analyst')
        for language, expected in [('zh', '本地'), ('ms', 'setempat')]:
            result = engine.generate(CV, basics()['cField'], basics(), language)
            self.assertIn(expected, result['notice'])

    def test_field_and_region_dependencies(self):
        engine.validate_basics(basics())
        for invalid in [{**basics(), 'c2': 'Software Engineer'}, {**basics(), 'c4': 'Kuching'},
                        {**basics(), 'c5': ''}, {**basics(), 'cField': []}, {**basics(), 'cState': []}]:
            with self.assertRaises(engine.QuestionnaireError):
                engine.validate_basics(invalid)
        self.assertEqual(len(engine.CATALOG['regions']), 16)

    def test_other_area_requires_details(self):
        with self.assertRaises(engine.QuestionnaireError):
            engine.validate_basics({**basics(), 'c4': 'Other area'})
        engine.validate_basics({**basics(), 'c4': 'Other area', 'cAreaOther': 'Subang Jaya'})

    def test_cv_and_configuration_required(self):
        with self.assertRaises(engine.QuestionnaireError) as exc:
            engine.generate(None, basics()['cField'], basics())
        self.assertEqual(exc.exception.status, 409)
        with patch.dict(os.environ, {'QUESTIONNAIRE_PROVIDER': 'gemini'}, clear=True), patch('questionnaire_engine.dotenv_values', return_value={}), self.assertRaises(engine.QuestionnaireError) as exc:
            engine.generate(CV, basics()['cField'], basics(), external_ai_consent=True)
        self.assertEqual(exc.exception.status, 503)

    def test_project_env_is_read_and_environment_takes_precedence(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / '.env'
            path.write_text('GEMINI_API_KEY="test-file-key"\nQUESTIONNAIRE_GEMINI_MODEL=gemini-test\n', encoding='utf-8')
            with patch.object(engine, 'ENV_FILE', path), patch.dict(os.environ, {}, clear=True):
                self.assertEqual(engine.ai_configuration(), ('test-file-key', 'gemini-test'))
                path.write_text('GEMINI_API_KEY=test-updated-key\n', encoding='utf-8')
                self.assertEqual(engine.ai_configuration()[0], 'test-updated-key')
                with patch.dict(os.environ, {'GEMINI_API_KEY': 'test-server-key'}):
                    self.assertEqual(engine.ai_configuration()[0], 'test-server-key')

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-only', 'QUESTIONNAIRE_PROVIDER': 'gemini'})
    @patch('questionnaire_engine.requests.post')
    def test_real_provider_contract_and_output_validation(self, post):
        questions = [{'skill_tested': 'Excel', 'question': 'How did you validate a financial report in Excel?'} for _ in range(4)]
        post.return_value = Mock(json=lambda: {'candidates': [{'content': {'parts': [{'text': json.dumps({'questions': questions})}]}}]})
        result = engine.generate(CV, basics()['cField'], basics(), external_ai_consent=True)
        self.assertEqual(len(result['questions']), 4)
        kwargs = post.call_args.kwargs
        self.assertEqual(kwargs['headers']['x-goog-api-key'], 'test-only')
        prompt = kwargs['json']['contents'][0]['parts'][0]['text']
        self.assertIn('Accountant', prompt)
        self.assertIn('Financial reporting', prompt)
        post.return_value = Mock(json=lambda: {'candidates': [{'content': {'parts': [{'text': '{"questions": []}'}]}}]})
        with self.assertRaises(engine.QuestionnaireError) as exc:
            engine.generate(CV, basics()['cField'], basics(), external_ai_consent=True)
        self.assertEqual(exc.exception.status, 502)

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-only', 'QUESTIONNAIRE_PROVIDER': 'gemini'})
    @patch('questionnaire_engine.requests.post', side_effect=requests.Timeout)
    def test_timeout_is_retryable(self, post):
        with self.assertRaises(engine.QuestionnaireError) as exc:
            engine.generate(CV, basics()['cField'], basics(), external_ai_consent=True)
        self.assertEqual(exc.exception.status, 504)

    def test_authorization_and_cv_ownership(self):
        client = app.test_client()
        client.environ_base["HTTP_X_CSRF_TOKEN"] = client.get("/api/auth/csrf").json["csrf_token"]
        self.assertEqual(client.get('/api/questionnaire/catalog').status_code, 401)
        with client.session_transaction() as session:
            session['user'] = {'role': 'hr_company', 'unique_uid': 'hr-test'}
        self.assertEqual(client.post('/api/questionnaire/questions', json={}).status_code, 403)
        with client.session_transaction() as session:
            session['user'] = {'role': 'job_seeker', 'unique_uid': 'candidate-test'}
        self.assertEqual(client.get('/api/questionnaire/catalog').status_code, 200)
        with patch('main.cv_engine.get_user_cv', return_value=None) as get_cv:
            response = client.post('/api/questionnaire/questions', json={'field': basics()['cField'], 'owner_uid': 'someone-else'})
        self.assertEqual(response.status_code, 409)
        get_cv.assert_called_once_with('candidate-test')


if __name__ == '__main__':
    unittest.main()
