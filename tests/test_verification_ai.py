import unittest
import sys
from pathlib import Path

_SRC_DIR = Path(__file__).resolve().parents[1] / "src"
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

import verification_ai


class TestVerificationAI(unittest.TestCase):
    def test_generate_verification_questions_finance(self):
        role = "Junior Financial Auditor"
        skills = ["Audit Standards", "MFRS", "Reconciliation"]
        questions, provider = verification_ai.generate_verification_questions(role, skills)
        self.assertEqual(len(questions), 3)
        self.assertEqual(questions[0]["id"], "q1")
        self.assertEqual(questions[1]["id"], "q2")
        self.assertEqual(questions[2]["id"], "q3")
        all_text = (questions[0]["question_text"] + questions[1]["question_text"] + questions[2]["question_text"]).lower()
        self.assertTrue("audit" in all_text or "financial" in all_text or "mfrs" in all_text)

    def test_generate_verification_questions_tech(self):
        role = "Senior Backend Engineer"
        skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
        questions, provider = verification_ai.generate_verification_questions(role, skills)
        self.assertEqual(len(questions), 3)
        self.assertIn("q1", [q["id"] for q in questions])
        all_text = " ".join(q["question_text"] for q in questions).lower()
        self.assertTrue("backend" in all_text or "python" in all_text or "engineer" in all_text)

    def test_evaluate_verification_answers(self):
        answers = [
            {"id": "q1", "answer": "I would investigate the root cause by analyzing log traces and mitigating the immediate impact with circuit breakers."},
            {"id": "q2", "answer": "Using FastAPI and PostgreSQL, I optimized the database connection pool and added redis caching to reduce query latency by 45%."},
            {"id": "q3", "answer": "We strictly adhere to the Malaysian Personal Data Protection Act (PDPA) by encrypting PII at rest and in transit."}
        ]
        result = verification_ai.evaluate_verification_answers(answers, "Backend Engineer", ["Python", "FastAPI"])
        self.assertTrue(result["verification_score"] >= 75)
        self.assertEqual(result["answered_count"], 3)
        self.assertIn("competency_breakdown", result)


if __name__ == "__main__":
    unittest.main()
