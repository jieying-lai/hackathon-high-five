"""Evidence must remain dated, sourced, refreshable and separate from scenarios."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import market_signals as market
from main import app


def posting(i, title="Python and AI engineer", **overrides):
    return {"id": i, "url": f"https://remotive.com/remote-jobs/software/job-{i}",
            "title": title, "description": "<p>Python, Python. Communication and SQL.</p>",
            "company_name": "Example", "publication_date": "2026-10-20T12:00:00",
            "candidate_required_location": "Worldwide", **overrides}


class MarketEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.patches = [
            patch.object(market, "CACHE_PATH", Path(self.temp.name) / "public-snapshot.json"),
            patch.object(market, "_loaded", False), patch.object(market, "_snapshot", None),
            patch.object(market, "_last_attempt", 0), patch.object(market, "_last_error", None),
        ]
        for p in self.patches:
            p.start()
        self.addCleanup(self.temp.cleanup)
        for p in self.patches:
            self.addCleanup(p.stop)

    def test_mentions_deduplicate_per_job_and_ignore_unsafe_links(self):
        result = market._normalize_jobs({"jobs": [posting(1), posting(1), posting(2, url="javascript:alert(1)")]})
        self.assertEqual(result["sample_size"], 1)
        python = next(r for r in result["rows"] if r["skill"] == "Python")
        self.assertEqual((python["count"], python["share_pct"]), (1, 100))
        self.assertEqual(python["evidence"], "small_sample")
        self.assertNotIn("description", python["examples"][0])

    def test_source_refresh_is_throttled_and_new_observations_replace_old(self):
        one = market._normalize_jobs({"jobs": [posting(1)]})
        two = market._normalize_jobs({"jobs": [posting(2), posting(3)]})
        with patch.object(market, "_fetch_snapshot", side_effect=[one, two]) as fetch:
            with patch.object(market.time, "time", return_value=100000):
                a = market.live_snapshot()
                b = market.live_snapshot()
            self.assertEqual(fetch.call_count, 1)
            self.assertEqual(a["fetched_at"], b["fetched_at"])
            with patch.object(market.time, "time", return_value=100000 + market.REFRESH_SECONDS + 1):
                c = market.live_snapshot()
            self.assertEqual(fetch.call_count, 2)
            self.assertEqual(c["sample_size"], 2)
            self.assertNotEqual(c["fetched_at"], a["fetched_at"])

    def test_failed_refresh_keeps_original_date_not_fake_fresh_data(self):
        snapshot = market._normalize_jobs({"jobs": [posting(1)]})
        with patch.object(market, "_fetch_snapshot", side_effect=[snapshot, TimeoutError("offline")]):
            with patch.object(market.time, "time", return_value=100000):
                first = market.live_snapshot()
            with patch.object(market.time, "time", return_value=130000):
                stale = market.live_snapshot()
        self.assertEqual(stale["status"], "stale")
        self.assertEqual(first["fetched_at"], stale["fetched_at"])
        self.assertEqual(first["rows"], stale["rows"])
        self.assertTrue(stale["error"])

    def test_unavailable_source_has_no_placeholder_jobs_and_caches_failure(self):
        with patch.object(market, "_fetch_snapshot", side_effect=OSError("offline")) as fetch:
            with patch.object(market.time, "time", return_value=100000):
                first = market.live_snapshot()
                second = market.live_snapshot()
        self.assertEqual(first["status"], "unavailable")
        self.assertEqual(first["rows"], [])
        self.assertIsNone(first["fetched_at"])
        self.assertEqual(fetch.call_count, 1)
        self.assertEqual(second["sample_size"], 0)

    def test_cache_survives_process_reload_without_fetching_again(self):
        with patch.object(market, "_fetch_snapshot", return_value=market._normalize_jobs({"jobs": [posting(1)]})) as fetch:
            with patch.object(market.time, "time", return_value=100000):
                first = market.live_snapshot()
                market._loaded = False
                market._snapshot = None
                market._last_attempt = 0
                second = market.live_snapshot()
        self.assertEqual(first["rows"], second["rows"])
        self.assertEqual(fetch.call_count, 1)

    def test_historical_updates_are_measured_not_scenario_percentages(self):
        skill = market.tracked_skills()[0]
        demand = {"metadata": {"data_through": "2025-05-08"}, "skills": {
            skill: {"confidence": "measured", "change_pct": -23, "baseline_count": 100, "recent_count": 77,
                    "baseline_per_1k": 10, "recent_per_1k": 7.7},
            market.tracked_skills()[1]: {"confidence": "low_sample", "change_pct": 100}
        }}
        with patch.object(market, "load_skill_demand", return_value=demand):
            first = market.historical_snapshot()
            self.assertEqual(len(first["rows"]), 1)
            self.assertEqual(first["rows"][0]["change_pct"], -23)
            demand["skills"][skill]["change_pct"] = 12
            second = market.historical_snapshot()
        self.assertEqual(second["rows"][0]["change_pct"], 12)
        self.assertNotIn("automation_risk_pct", first["rows"][0])

    def test_public_endpoint_exposes_sources_not_profile_information(self):
        evidence = {"ok": True, "remote": {"rows": []}, "malaysia": {"rows": []}, "scenarios": copy.deepcopy(market.SCENARIOS)}
        with app.test_client() as client, patch("main.get_market_signals", return_value=evidence):
            response = client.get("/api/market/signals")
        self.assertEqual(response.status_code, 200)  # No signup required to see source evidence.
        self.assertEqual(response.get_json(), evidence)
        self.assertNotIn("user", response.get_json())
        self.assertEqual(len(evidence["scenarios"]), 3)
        self.assertTrue(all("probability" not in s for s in evidence["scenarios"]))

    def test_empty_source_is_explicit_failure(self):
        for payload in ({"jobs": []}, {"jobs": None}, {}):
            with self.assertRaises(ValueError):
                market._normalize_jobs(payload)


if __name__ == "__main__":
    unittest.main()
