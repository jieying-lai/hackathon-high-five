import os
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
import hr_interview_ai as engine
from questionnaire_engine import QuestionnaireError


class LightweightInterviewTests(unittest.TestCase):
    def setUp(self):
        self.vacancy = {'title': 'Carbon Compliance Specialist', 'required_skills': ['GHG accounting', 'Reporting']}
        self.candidate = {'id': 'candidate-1', 'name': 'Private Name', 'skills': ['GHG accounting'],
                          'projects': ['Emissions inventory review']}
        self.payload = {'vacancy_id': 1, 'candidate_id': 'candidate-1'}

    def generate(self, **changes):
        with patch.dict(os.environ, {'HR_INTERVIEW_PROVIDER': 'rules'}), \
             patch.object(engine, 'candidate_context', return_value=(self.vacancy, self.candidate)), \
             patch.object(engine.requests, 'post', side_effect=AssertionError('Must not use network')), \
             patch('interview_runtime.ensure_local_runtime', side_effect=AssertionError('Must not load a model')):
            return engine.generate('owner', {**self.payload, **changes})

    def test_default_without_server_config_is_lightweight(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(engine, 'dotenv_values', return_value={}), \
             patch.object(engine, 'candidate_context', return_value=(self.vacancy, self.candidate)), \
             patch.object(engine.requests, 'post', side_effect=AssertionError('Unexpected cloud call')):
            result = engine.generate('owner', self.payload)
        self.assertEqual(result['mode'], 'rules')
        self.assertEqual(len(set(result['questions'])), 4)

    def test_evidence_languages_and_regeneration_without_runtime(self):
        for language in ('en', 'ms', 'zh'):
            first = self.generate(language=language)
            second = self.generate(language=language, previous_questions=first['questions'])
            self.assertEqual(len(first['questions']), 4)
            self.assertFalse(set(first['questions']) & set(second['questions']))
            joined = ' '.join(first['questions'])
            self.assertIn('GHG accounting', joined)
            self.assertIn('Emissions inventory review', joined)
            self.assertNotIn('Private Name', joined)

    def test_empty_cv_does_not_invent_project_or_skill_claim(self):
        self.candidate = {'id': 'candidate-1'}
        self.vacancy['required_skills'] = []
        result = self.generate()
        self.assertEqual(len(result['questions']), 4)
        self.assertNotIn('Your CV mentions', ' '.join(result['questions']))
        self.assertNotIn('Your CV lists', ' '.join(result['questions']))

    def test_access_revocation_is_not_bypassed(self):
        with patch.object(engine, 'candidate_context', side_effect=QuestionnaireError('Access denied', 403)):
            with self.assertRaises(QuestionnaireError) as denied:
                engine.generate('other-owner', self.payload)
        self.assertEqual(denied.exception.status, 403)

    def test_rechecks_access_before_returning_questions(self):
        with patch.dict(os.environ, {'HR_INTERVIEW_PROVIDER': 'rules'}), \
             patch.object(engine, 'candidate_context', side_effect=[(self.vacancy, self.candidate), QuestionnaireError('Revoked', 403)]):
            with self.assertRaises(QuestionnaireError):
                engine.generate('owner', self.payload)

    def test_invalid_input_stays_rejected(self):
        for changes in ({'language': 'invalid'}, {'previous_questions': 'text'}, {'vacancy_id': 'bad'}):
            with self.assertRaises(QuestionnaireError):
                self.generate(**changes)


if __name__ == '__main__':
    unittest.main()
