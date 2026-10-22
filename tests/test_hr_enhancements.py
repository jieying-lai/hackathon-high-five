import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

import chatbot_engine
import hr_engine


class TestHrEnhancements(unittest.TestCase):
    def setUp(self):
        self.hr_user = {
            "unique_uid": "CL-HR-2026-8801",
            "email": "hr@nexusdigital.com",
            "full_name": "Marcus Tan",
            "role": "hr_company",
            "role_details": {
                "company_name": "Nexus Digital Sdn Bhd",
                "company_location": "Level 18, Menara Nexus, Bangsar South, Kuala Lumpur",
            },
        }

    def test_lumi_hr_candidate_evaluation(self):
        resp = chatbot_engine.generate_lumi_response(
            "How should I evaluate Aisha Rahman?",
            user=self.hr_user,
        )
        self.assertTrue(resp.get("ok"))
        reply = resp.get("reply", "")
        self.assertIn("Aisha Rahman", reply)
        self.assertIn("Match Score", reply)
        self.assertIn("HR Decision Recommendation", reply)

    def test_lumi_hr_company_expansion_advisory(self):
        resp = chatbot_engine.generate_lumi_response(
            "How should our company expand and is hiring beneficial to growth?",
            user=self.hr_user,
        )
        self.assertTrue(resp.get("ok"))
        reply = resp.get("reply", "")
        self.assertIn("AI Strategic Growth & Workforce Advisory", reply)
        self.assertIn("Is Current Hiring Beneficial to Growth?", reply)
        self.assertIn("AI-Powered Financial Auditing", reply)
        self.assertIn("ASEAN ESG", reply)

    def test_hr_template_features(self):
        template_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "src", "templates", "hr.html")
        )
        with open(template_path, "r", encoding="utf-8") as f:
            html = f.read()

        # 1. No dropdown in navigation
        self.assertNotIn("Candidate Screening', ids: ['screening', 'heatmap', 'shortlisting'], dropdown: true", html)
        self.assertIn("primaryId: 'screening'", html)

        # 2. Secondary screening sub-navigation
        self.assertIn("data-screening-navigation", html)
        self.assertIn("renderScreeningNavigation", html)

        # 3. Decision Status Legend with 4 color badges
        self.assertIn("HR Decision Status Legend", html)
        self.assertIn("🟡 Pending", html)
        self.assertIn("🟢 Shortlist", html)
        self.assertIn("🔵 Needs Review", html)
        self.assertIn("⚪ Hold", html)

        # 4. Chart.js & Analytics
        self.assertIn("chart.js", html.lower())
        self.assertIn("chartVacancyInflow", html)
        self.assertIn("chartSkillClusters", html)
        self.assertIn("chartExperienceMix", html)

        # 5. Trained AI Strategic Expansion Advisory
        self.assertIn("Trained AI Strategic Workforce", html)
        self.assertIn("ASEAN ESG", html)

        # 6. Executive Report Generation & Print
        self.assertIn("reportModalWrap", html)
        self.assertIn("printReport", html)

        # 7. Safe CV rendering helper
        self.assertIn("renderCvItem", html)

        # 8. Meeting interview format options
        self.assertIn("Online Video Meeting", html)
        self.assertIn("Face-to-Face Meeting", html)


if __name__ == "__main__":
    unittest.main()
