"""Unit tests for Career Pathways Engine (O*NET 29.0 Integration)."""

import unittest
from src.career_pathways import find_occupation_pathways, get_pathways_summary, load_pathways_data
from src.main import app


class TestCareerPathways(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_load_pathways_data(self):
        data = load_pathways_data()
        self.assertIn("occupations", data)
        self.assertIn("title_index", data)
        self.assertGreater(len(data["occupations"]), 800)

    def test_demo_persona_career_pathway_mappings(self):
        test_cases = [
            ("Digital Copywriter", "Copy Writers"),
            ("Accountant", "Accountants"),
            ("Junior Financial Auditor", "Auditors"),
            ("Software Engineer", "Software Developers, Applications"),
            ("Graphic Designer", "Graphic Designers"),
            ("HR Executive", "Human Resources Managers"),
        ]
        for query, expected_title in test_cases:
            with self.subTest(query=query):
                occ = find_occupation_pathways(query)
                self.assertIsNotNone(occ, f"Failed to match: {query}")
                self.assertEqual(occ["title"], expected_title)

    def test_get_pathways_summary_structure(self):
        summary = get_pathways_summary("Junior Financial Auditor")
        self.assertEqual(summary["current_role"], "Auditors")
        self.assertIn("job_zone", summary)
        self.assertIn("advancements", summary)
        self.assertIn("lateral_transitions", summary)
        self.assertIsInstance(summary["advancements"], list)
        self.assertIsInstance(summary["lateral_transitions"], list)

    def test_api_career_pathways_endpoint(self):
        with self.client.session_transaction() as sess:
            sess["user"] = {"uid": "test_seeker", "role": "job_seeker", "email": "test@seeker.com"}
        resp = self.client.get("/api/career-pathways?role=Digital+Copywriter")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data.get("ok"))
        self.assertIn("pathways", data)
        self.assertEqual(data["pathways"]["current_role"], "Copy Writers")

    def test_empty_or_fallback_query(self):
        summary = get_pathways_summary("")
        self.assertIn("current_role", summary)
        self.assertIn("job_zone", summary)


if __name__ == "__main__":
    unittest.main()
