"""The trend layer must be driven by dated posting data, not typed-in numbers."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
import trend_signals
from ai_matcher import load_json, match_user_to_roles

META = {'source_name': 'arXiv test', 'last_updated': 'x', 'live_status': 'TEST', 'recent_signals': []}


def entry(base, recent, confidence='measured'):
    return {'baseline_count': base, 'recent_count': recent, 'baseline_per_1k': base / 10, 'recent_per_1k': recent / 10,
            'change_pct': round((recent / base - 1) * 100) if base else None, 'confidence': confidence}


class DemandFile(unittest.TestCase):
    def test_built_file_is_dated_and_sourced(self):
        d = trend_signals.load_skill_demand()
        m = d['metadata']
        for key in ('source', 'baseline_window', 'recent_window', 'data_through', 'generated_at', 'caveats'):
            self.assertTrue(m.get(key), key)
        for name, e in d['skills'].items():
            if e['confidence'] == 'measured':
                self.assertGreaterEqual(min(e['baseline_count'], e['recent_count']), m['min_count_for_measured'], name)


class RadarFollowsData(unittest.TestCase):
    def use(self, skills):
        tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8')
        json.dump({'metadata': {'source': 'test', 'baseline_window': {'start': 'a', 'end': 'b', 'postings': 1},
                                'recent_window': {'start': 'c', 'end': 'd', 'postings': 1}, 'data_through': 'd'},
                   'skills': skills}, tmp)
        tmp.close()
        return patch.object(trend_signals, 'DEMAND_PATH', tmp.name)

    def test_changing_the_data_changes_the_radar(self):
        python = trend_signals.tracked_skills()[0]
        with self.use({python: entry(100, 200)}):
            up = trend_signals.get_trend_radar('moderate', META)
        with self.use({python: entry(100, 50)}):
            down = trend_signals.get_trend_radar('moderate', META)
        self.assertEqual([s['skill'] for s in up['emerging_skills']], [python])
        self.assertEqual(up['emerging_skills'][0]['growth_pct'], 100)
        self.assertEqual(down['emerging_skills'], [])
        self.assertEqual(down['declining_skills'][0]['decline_pct'], 50)

    def test_low_sample_skills_are_never_ranked(self):
        python = trend_signals.tracked_skills()[0]
        with self.use({python: entry(3, 40, 'low_sample')}):
            radar = trend_signals.get_trend_radar('moderate', META)
        self.assertEqual(radar['emerging_skills'], [])
        self.assertIn(python, [w['skill'] for w in radar['emerging_watchlist']])

    def test_fast_scenario_multiplier_is_labelled_not_hidden(self):
        python = trend_signals.tracked_skills()[0]
        with self.use({python: entry(100, 200)}):
            fast = trend_signals.get_trend_radar('fast', META)
        row = fast['emerging_skills'][0]
        self.assertEqual(row['measured_change_pct'], 100)
        self.assertEqual(row['growth_pct'], round(100 * trend_signals.FAST_MULTIPLIER))
        self.assertIn('Estimates', fast['scenario_note'])

    def test_metadata_is_not_composed_twice(self):
        first = trend_signals.get_trend_radar('moderate', META)
        second = trend_signals.get_trend_radar('fast', first['signal_metadata'])
        self.assertEqual(first['signal_metadata']['source_name'], second['signal_metadata']['source_name'])


class MatchFollowsData(unittest.TestCase):
    def test_market_data_changes_role_scores_within_bounds(self):
        profile = load_json('sample_cvs.json')[0]
        roles = load_json('future_roles.json')
        every = {s for r in roles for s in r['core_skills'] + r['transferable_from']}
        def run(growth):
            skills = {s: entry(100, growth) for s in every}
            tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8')
            json.dump({'metadata': {}, 'skills': skills}, tmp)
            tmp.close()
            with patch.object(trend_signals, 'DEMAND_PATH', tmp.name):
                return {r['role_id']: r for r in match_user_to_roles(profile)['recommended_roles']}
        up, down = run(300), run(25)
        for rid in up:
            self.assertEqual(up[rid]['explainable_breakdown']['market_demand_pct'], trend_signals.MAX_MARKET_ADJUSTMENT)
            self.assertEqual(down[rid]['explainable_breakdown']['market_demand_pct'], -trend_signals.MAX_MARKET_ADJUSTMENT)
            self.assertGreater(up[rid]['match_score'], down[rid]['match_score'])
            self.assertGreater(up[rid]['demand_outlook'], down[rid]['demand_outlook'])

    def test_no_data_means_no_adjustment(self):
        with patch.object(trend_signals, 'DEMAND_PATH', '/nonexistent/skill_demand.json'):
            for role in match_user_to_roles(load_json('sample_cvs.json')[0])['recommended_roles']:
                self.assertEqual(role['explainable_breakdown']['market_demand_pct'], 0)


if __name__ == '__main__':
    unittest.main()
