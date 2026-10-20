"""Privacy regressions use only a disposable database and generated synthetic PDFs."""
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import auth_db
import cv_engine
import hr_engine


class VaultPrivacyTests(unittest.TestCase):
    def test_comparison_requires_review_and_summary_permission(self):
        from candidate_comparison import comparison
        self.apply(summary=False, pdf=True)
        self.assertEqual(comparison("employer-a")["candidates"], [])
        self.apply(summary=True, pdf=False)
        rows = comparison("employer-a")["candidates"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(comparison("employer-b")["candidates"], [])
        self.assertTrue(any("comparison" in log["access_type"] for log in cv_engine.get_user_cv("candidate-a")["access_logs"]))
        db = auth_db.get_db_connection()
        structured = cv_engine.get_user_cv("candidate-a")["structured_cv"]
        structured["review_status"] = "needs_review"
        db.execute("UPDATE user_cvs SET structured_cv_json=? WHERE owner_uid=?", (json.dumps(structured), "candidate-a"))
        db.commit(); db.close()
        self.assertEqual(comparison("employer-a")["candidates"], [])

    def test_imported_listing_cannot_receive_cv(self):
        self.review()
        db = auth_db.get_db_connection()
        db.execute("UPDATE vacancies SET owner_uid='JS-import',vacancy_uid='JS-import' WHERE id=?", (self.vid,))
        db.commit(); db.close()
        ok, msg, _ = cv_engine.apply_to_vacancy("candidate-a", "Account A", self.vid, {"share_organised_cv": True})
        self.assertFalse(ok)
        self.assertIn("not been sent", msg)
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["applications"], [])

    def test_chat_context_does_not_read_candidates_for_unrelated_messages(self):
        import chatbot_engine
        with patch.object(hr_engine, "screen_candidates") as screen, patch.object(hr_engine, "get_heatmap") as heat:
            chatbot_engine._build_live_context({"role": "hr_company", "unique_uid": "employer-a"})
        screen.assert_not_called()
        heat.assert_not_called()

    def test_chat_never_sends_recruiter_data_to_external_ai(self):
        import chatbot_engine
        with patch.object(chatbot_engine, "_generate_lumi_core", return_value={"ok": True, "in_range": True, "reply": "Private applicant"}), patch.object(chatbot_engine, "_enhance_with_gemini") as external:
            chatbot_engine.generate_lumi_response("applicants", {"role": "hr_company", "unique_uid": "employer-a"}, external_ai_consent=True)
            chatbot_engine.generate_lumi_response("my cv", {"role": "job_seeker", "unique_uid": "candidate-a"})
        external.assert_not_called()

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.patches = [
            patch.object(auth_db, "DATA_DIR", self.temp.name),
            patch.object(auth_db, "DB_PATH", os.path.join(self.temp.name, "test.db")),
            patch.object(cv_engine, "UPLOADS_DIR", os.path.join(self.temp.name, "uploads")),
            patch.object(cv_engine, "SAMPLE_PDF_DIR", os.path.join(self.temp.name, "samples")),
            patch.object(cv_engine, "ensure_sample_pdfs", return_value=[]),
            patch.dict(os.environ, {"CAREERLENS_DEMO": "0"}),
        ]
        for p in self.patches:
            p.start()
            self.addCleanup(p.stop)
        db = auth_db.get_db_connection()
        db.execute("CREATE TABLE users (unique_uid TEXT PRIMARY KEY, full_name TEXT, role_details_json TEXT, role TEXT)")
        db.executemany("INSERT INTO users VALUES (?, ?, ?, ?)", [
            ("candidate-a", "Account A", "{}", "job_seeker"), ("candidate-b", "Account B", "{}", "job_seeker"),
            ("employer-a", "Recruiter A", '{"company_name":"Company A"}', 'hr_company'),
            ("employer-b", "Recruiter B", '{"company_name":"Company B"}', 'hr_company'),
        ])
        db.commit()
        db.close()
        hr_engine.init_hr_tables()
        cv_engine.init_cv_tables()
        ok, _, vacancy = hr_engine.create_vacancy("employer-a", {
            "title": "Synthetic Engineer", "salary_min": 4000, "salary_max": 6000, "min_years": 1,
            "work_mode": "Hybrid", "education_level": "Bachelor's Degree", "required_skills": ["Python"],
        })
        self.assertTrue(ok)
        self.vid = vacancy["id"]
        self.hr = {"unique_uid": "employer-a", "role_details": {"company_name": "Company A"}}
        self.pdf = cv_engine._build_pdf_bytes(cv_engine.SAMPLE_CV_SPECS[1])
        self.upload()

    def upload(self, owner="candidate-a", pdf=None):
        ok, msg, record = cv_engine.save_user_pdf_cv(owner, "synthetic.pdf", pdf or self.pdf)
        self.assertTrue(ok, msg)
        return record

    def review(self, owner="candidate-a"):
        record = cv_engine.get_user_cv(owner)
        ok, msg, record = cv_engine.update_user_structured_cv(owner, {
            "expected_file_sha256": record["file_sha256"], "review_confirmed": True,
        })
        self.assertTrue(ok, msg)
        return record

    def apply(self, summary=True, pdf=False, owner="candidate-a"):
        self.review(owner)
        ok, msg, _ = cv_engine.apply_to_vacancy(owner, "Account A", self.vid, {
            "share_organised_cv": summary, "share_original_pdf": pdf,
        })
        self.assertTrue(ok, msg)
        db = auth_db.get_db_connection()
        row = db.execute("SELECT id FROM job_applications WHERE candidate_uid = ?", (owner,)).fetchone()
        db.close()
        return row["id"]

    def test_upload_private_until_review_and_explicit_consent(self):
        record = cv_engine.get_user_cv("candidate-a")
        self.assertFalse(record["allow_anon_stats"])
        self.assertEqual(record["structured_cv"]["review_status"], "needs_review")
        self.assertEqual(len(record["file_sha256"]), 64)
        self.assertFalse(cv_engine.apply_to_vacancy("candidate-a", "A", self.vid,
                         {"share_organised_cv": True})[0])
        self.review()
        self.assertFalse(cv_engine.apply_to_vacancy("candidate-a", "A", self.vid, {})[0])
        self.assertFalse(cv_engine.apply_to_vacancy("candidate-a", "A", self.vid,
                         {"share_organised_cv": "false"})[0])

    def test_all_resource_permission_combinations(self):
        for share_summary, share_pdf in ((True, False), (False, True), (True, True)):
            with self.subTest(summary=share_summary, pdf=share_pdf):
                app_id = self.apply(share_summary, share_pdf)
                ok_summary, _, summary = cv_engine.get_application_cv_for_hr(self.hr, app_id, resource="summary")
                ok_pdf, _, pdf = cv_engine.get_application_cv_for_hr(self.hr, app_id, resource="pdf")
                self.assertEqual(ok_summary, share_summary)
                self.assertEqual(ok_pdf, share_pdf)
                if summary:
                    self.assertNotIn("stored_pdf_path", summary)
                    self.assertNotIn("original_filename", summary)
                    self.assertNotIn("raw_text", summary["structured_cv"])
                    if not share_pdf:
                        self.assertNotIn("pdf_url", summary)
                if pdf:
                    self.assertNotIn("structured_cv", pdf)
                    self.assertTrue(os.path.isfile(pdf["stored_pdf_path"]))

    def test_pdf_only_screening_has_no_summary_or_derived_score(self):
        self.apply(False, True)
        screen = hr_engine.screen_candidates("employer-a", self.vid)
        self.assertEqual(screen["results"], [])
        restricted = screen["restricted_applications"][0]
        self.assertNotIn("score", restricted)
        self.assertNotIn("executive_summary", restricted)
        self.assertNotIn("skills", restricted)
        self.assertEqual(restricted["candidate_name"], "Account A")
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["access_logs_total"], 0)

    def test_authorized_screening_is_logged_and_zero_years_preserved(self):
        record = self.review()
        cv_engine.update_user_structured_cv("candidate-a", {
            "years_experience": 0, "expected_file_sha256": record["file_sha256"], "review_confirmed": True,
        })
        self.apply(True, False)
        screen = hr_engine.screen_candidates("employer-a", self.vid)
        self.assertEqual(screen["results"][0]["years"], 0)
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["access_logs_total"], 1)

    def test_wrong_employer_and_denied_resource_are_not_successful_views(self):
        app_id = self.apply(True, False)
        self.assertFalse(cv_engine.get_application_cv_for_hr({"unique_uid": "employer-b"}, app_id)[0])
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id, resource="pdf")[0])
        self.assertIsNone(hr_engine.screen_candidates("employer-b", self.vid))
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["access_logs_total"], 0)
        self.assertTrue(cv_engine.get_application_cv_for_hr(self.hr, app_id, resource="summary")[0])
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["access_logs_total"], 1)

    def test_replacement_revokes_existing_application_and_old_pdf(self):
        app_id = self.apply(True, True)
        old_path, _ = cv_engine.get_user_pdf_path("candidate-a")
        replacement = cv_engine._build_pdf_bytes(cv_engine.SAMPLE_CV_SPECS[0])
        new = self.upload(pdf=replacement)
        self.assertEqual(new["revoked_applications_count"], 1)
        self.assertEqual(new["applications"], [])
        self.assertEqual(new["structured_cv"]["review_status"], "needs_review")
        self.assertFalse(os.path.exists(old_path))
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id)[0])

    def test_stale_update_rejected_and_content_edit_revokes_but_stats_do_not(self):
        app_id = self.apply(True, False)
        record = cv_engine.get_user_cv("candidate-a")
        self.assertFalse(cv_engine.update_user_structured_cv("candidate-a", {
            "full_name": "Changed", "expected_file_sha256": "stale",
        })[0])
        ok, _, same = cv_engine.update_user_structured_cv("candidate-a", {"allow_anon_stats": True})
        self.assertTrue(ok)
        self.assertEqual(same["applications_count"], 1)
        ok, _, edited = cv_engine.update_user_structured_cv("candidate-a", {
            "full_name": "Owner correction", "work_experience": ["Owner confirmed work"],
            "expected_file_sha256": record["file_sha256"], "review_confirmed": True,
        })
        self.assertTrue(ok)
        self.assertEqual(edited["revoked_applications_count"], 1)
        self.assertEqual(edited["structured_cv"]["review_status"], "reviewed")
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id)[0])

    def test_closed_vacancy_permissions_stay_manageable(self):
        app_id = self.apply(True, True)
        hr_engine.set_vacancy_status("employer-a", self.vid, "Closed")
        self.assertEqual(cv_engine.get_user_cv("candidate-a")["applications"][0]["vacancy_status"], "Closed")
        ok, _, _ = cv_engine.apply_to_vacancy("candidate-a", "Account A", self.vid, {
            "share_organised_cv": True, "share_original_pdf": False,
        })
        self.assertTrue(ok)
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id, resource="pdf")[0])
        self.assertTrue(cv_engine.withdraw_application("candidate-a", self.vid)[0])
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id)[0])

    def test_export_delete_and_other_owner_isolation(self):
        self.upload("candidate-b")
        app_id = self.apply(True, True)
        cv_engine.get_application_cv_for_hr(self.hr, app_id)
        export = cv_engine.export_user_cv("candidate-a")
        self.assertIn("raw_text", export)
        self.assertNotIn("stored_pdf_path", json.dumps(export))
        path, _ = cv_engine.get_user_pdf_path("candidate-a")
        self.assertTrue(cv_engine.delete_user_cv("candidate-a")[0])
        self.assertIsNone(cv_engine.get_user_cv("candidate-a"))
        self.assertFalse(os.path.exists(path))
        self.assertIsNotNone(cv_engine.get_user_cv("candidate-b"))
        self.assertFalse(cv_engine.get_application_cv_for_hr(self.hr, app_id)[0])
        cv_engine.init_cv_tables()
        self.assertIsNone(cv_engine.get_user_cv("candidate-a"))

    def test_statistics_publish_no_rare_or_free_text_cv_details(self):
        cv_engine.update_user_structured_cv("candidate-a", {"allow_anon_stats": True})
        stats = cv_engine.get_anonymized_cv_statistics()
        self.assertEqual(stats["status"], "disabled_pending_privacy_review")
        self.assertEqual(stats["top_extracted_skills"], [])
        self.assertEqual(stats["industry_distribution"], {})

    def test_update_rejects_bad_types_and_excessive_fields(self):
        digest = cv_engine.get_user_cv("candidate-a")["file_sha256"]
        for payload in ({"allow_anon_stats": "false"}, {"review_confirmed": "true"},
                        {"years_experience": True}, {"skills": ["x" * 101]},
                        {"executive_summary": "x" * 3001}):
            self.assertFalse(cv_engine.update_user_structured_cv("candidate-a", {
                "expected_file_sha256": digest, **payload,
            })[0])


if __name__ == "__main__":
    unittest.main()
