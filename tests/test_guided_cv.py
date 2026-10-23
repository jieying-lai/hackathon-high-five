"""The guided conversation never invents experience or replaces a CV silently."""
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from guided_cv import build_guided_spec
import main

USER = {"unique_uid": "GUIDED-TEST", "role": "job_seeker", "display_name": "Test Candidate", "email": "candidate@example.test"}


def answers(**changes):
    return {
        "role": "Data analyst", "years": "Just starting", "work_mode": "Hybrid",
        "skills": ["Excel", "Communication"], "experience_highlight": "Built a class spreadsheet project.",
        "education": "", **changes,
    }


class GuidedSpecTests(unittest.TestCase):
    def test_only_self_reported_facts_are_included(self):
        spec = build_guided_spec(answers(), USER)
        self.assertEqual(spec["skills"], ["Excel", "Communication"])
        self.assertEqual(spec["projects"], ["Built a class spreadsheet project."])
        for key in ("education", "experience", "certifications"):
            self.assertEqual(spec[key], [])
        self.assertEqual(spec["phone"], "")
        self.assertEqual(spec["location"], "")
        with patch.object(main.cv_engine, "_build_pdf_bytes", return_value=b"pdf") as build:
            main.cv_engine.build_interactive_profile_pdf(spec)
        cleaned = build.call_args.args[0]
        self.assertEqual(cleaned["education"], [])
        self.assertEqual(cleaned["certifications"], [])
        self.assertEqual(cleaned["experience"], [])
        self.assertTrue(cleaned["source_grounded"])

    def test_optional_answers_can_be_skipped(self):
        spec = build_guided_spec(answers(experience_highlight="", education=""), USER)
        self.assertEqual(spec["projects"], [])
        self.assertTrue(main.cv_engine.build_interactive_profile_pdf(spec).startswith(b"%PDF"))

    def test_invalid_answers_do_not_become_cv_facts(self):
        for change in ({"role": ""}, {"skills": []}, {"skills": "Python"},
                       {"skills": ["x" * 81]}, {"skills": ["a"] * 21},
                       {"years": "100 years"}, {"work_mode": "Anywhere"},
                       {"experience_highlight": "x" * 2001}, {"education": {"unexpected": 1}}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                build_guided_spec(answers(**change), USER)


class GuidedApiTests(unittest.TestCase):
    def setUp(self):
        main.app.config["TESTING"] = True
        self.client = main.app.test_client()
        with self.client.session_transaction() as session:
            session["csrf_token"] = "test-csrf"

    def sign_in(self, role="job_seeker"):
        with self.client.session_transaction() as session:
            session["user"] = {**USER, "role": role}

    def post(self, **changes):
        return self.client.post("/api/cv/guided-build", json=answers(**changes),
                                headers={"X-CSRF-Token": "test-csrf"})

    def test_auth_role_and_csrf_are_required(self):
        self.assertEqual(self.post().status_code, 401)
        self.sign_in("hr_company")
        self.assertEqual(self.post().status_code, 403)
        self.sign_in()
        self.assertEqual(self.client.post("/api/cv/guided-build", json=answers()).status_code, 403)

    def test_existing_cv_requires_explicit_replacement(self):
        self.sign_in()
        with patch.object(main.cv_engine, "get_user_cv", return_value={"id": 1}), \
             patch.object(main.cv_engine, "save_user_pdf_cv") as save:
            self.assertEqual(self.post().status_code, 409)
            self.assertEqual(self.post(replace_existing="yes").status_code, 409)
            save.assert_not_called()

    def test_new_draft_is_saved_privately_for_the_signed_in_owner(self):
        self.sign_in()
        with patch.object(main.cv_engine, "get_user_cv", return_value=None), \
             patch.object(main.cv_engine, "build_interactive_profile_pdf", return_value=b"%PDF-test"), \
             patch.object(main.cv_engine, "save_user_pdf_cv", return_value=(True, "Saved", {"id": 1})) as save:
            response = self.post()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["download_url"], "/api/cv/me/pdf")
        self.assertEqual(save.call_args.kwargs["owner_uid"], USER["unique_uid"])
        self.assertIs(save.call_args.kwargs["allow_anon_stats"], False)

    def test_confirmed_replacement_is_allowed(self):
        self.sign_in()
        with patch.object(main.cv_engine, "get_user_cv", return_value={"id": 1}), \
             patch.object(main.cv_engine, "build_interactive_profile_pdf", return_value=b"%PDF-test"), \
             patch.object(main.cv_engine, "save_user_pdf_cv", return_value=(True, "Saved", {"id": 2})):
            self.assertEqual(self.post(replace_existing=True).status_code, 200)

    def test_invalid_draft_is_rejected_before_reading_or_writing_cv(self):
        self.sign_in()
        with patch.object(main.cv_engine, "get_user_cv") as get:
            self.assertEqual(self.post(skills=[]).status_code, 400)
            get.assert_not_called()


if __name__ == "__main__":
    unittest.main()
