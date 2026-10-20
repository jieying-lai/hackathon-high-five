"""Build isolated localization fixtures from the real rule engines and catalogs."""
import json
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'src'))
import auth_db
import hr_engine
from ai_matcher import load_json, match_user_to_roles
from trend_signals import get_trend_radar

(root / 'work').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(dir=root / 'work') as temp:
    auth_db.DB_PATH = str(Path(temp) / 'locale-test.db')
    hr_engine.init_hr_tables()
    personas = load_json('sample_cvs.json')
    vacancies = hr_engine.list_vacancies('CL-HR-2026-8801')
    with patch('trend_signals.fetch_live_arxiv_signal', return_value={
        'source_name': 'Illustrative demo signals (offline); not verified research citations',
        'last_updated': 'Undated demo fixture', 'live_status': 'CACHED_FALLBACK', 'recent_signals': []
    }):
        trend = get_trend_radar()
    print(json.dumps({
        'personas': personas,
        'analyses': [match_user_to_roles(persona, scenario)
                     for persona in personas for scenario in ('moderate', 'fast')],
        'trend': trend,
        'heat': hr_engine.get_heatmap(), 'vacancies': vacancies,
        'screen': hr_engine.screen_candidates('CL-HR-2026-8801', vacancies[0]['id']),
    }))
