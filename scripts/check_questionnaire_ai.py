import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
import questionnaire_engine as engine

cv = {'structured_cv': {
    'industry': 'Finance & Accounting',
    'current_role': 'Accounts Executive',
    'skills': ['Excel', 'Financial Reporting', 'SQL'],
    'years_experience': 2,
    'executive_summary': 'Synthetic test CV: prepared monthly financial reports and reconciled accounts using Excel.',
}}
answers = {
    **{key: values[0] for key, values in engine.CATALOG['choices'].items()},
    'cField': 'Finance & Accounting', 'c2': 'Accountant',
    'cState': 'Selangor', 'c4': 'Petaling',
}

if not engine.ai_configuration()[0]:
    print('NOT READY: Configure GEMINI_API_KEY in the project .env or server environment.')
    sys.exit(1)
os.environ['QUESTIONNAIRE_PROVIDER'] = 'gemini'
try:
    roles = engine.generate(cv, answers['cField'], action='recommendations')
    print(f"LIVE PASS: {len(roles['recommendations'])} role recommendations received.")
    questions = engine.generate(cv, answers['cField'], answers)
    print(f"LIVE PASS: {len(questions['questions'])} CV questions received.")
except engine.QuestionnaireError as exc:
    print(f'LIVE CHECK FAILED: {exc}')
    sys.exit(1)
