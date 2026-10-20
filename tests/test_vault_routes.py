"""End-to-end route permissions on disposable accounts and synthetic PDF data."""
import importlib
import io
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
import vault_sharing


class VaultRouteTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        for target, attr, val in [
            (auth_db, "DB_PATH", os.path.join(self.temp.name, "test.db")),
            (auth_db, "DATA_DIR", self.temp.name),
            (cv_engine, "UPLOADS_DIR", os.path.join(self.temp.name, "uploads")),
            (cv_engine, "SAMPLE_PDF_DIR", os.path.join(self.temp.name, "samples")),
        ]:
            p = patch.object(target, attr, val); p.start(); self.addCleanup(p.stop)
        p = patch.dict(os.environ, {"CAREERLENS_DEMO": "0"}); p.start(); self.addCleanup(p.stop)
        p = patch.object(cv_engine, "ensure_sample_pdfs", return_value=[]); p.start(); self.addCleanup(p.stop)
        self.main = importlib.import_module("main")
        auth_db.init_db(); hr_engine.init_hr_tables(); cv_engine.init_cv_tables(); vault_sharing.init_share_tables()
        conn = auth_db.get_db_connection()
        for uid in ("owner", "recipient", "stranger"):
            conn.execute("""INSERT INTO users (unique_uid,full_name,email,password_hash,role,role_details_json,
                consent_timestamp,created_at) VALUES (?,?,?,?,?,?,?,?)""",
                         (uid, uid.title(), uid + "@example.test", "unused", "job_seeker", "{}", "now", "now"))
        conn.commit(); conn.close()
        self.pdf = cv_engine._build_pdf_bytes(cv_engine.SAMPLE_CV_SPECS[1])
        ok, msg, cv = cv_engine.save_user_pdf_cv("owner", "fictional.pdf", self.pdf)
        self.assertTrue(ok, msg)
        self.digest = cv["file_sha256"]
        cv_engine.update_user_structured_cv("owner", {"review_confirmed": True, "expected_file_sha256": self.digest})
        self.main.app.config.update(TESTING=True)
        self.owner = self.client("owner")
        self.recipient = self.client("recipient")
        self.stranger = self.client("stranger")

    def client(self, uid=None):
        client = self.main.app.test_client()
        if uid:
            with client.session_transaction() as session:
                session["user"] = {"unique_uid": uid, "role": "job_seeker", "full_name": uid.title(), "role_details": {}}
                session["csrf_token"] = "test-token"
        return client

    def change(self, client, url, data=None, method="POST"):
        return client.open(url, method=method, json=data, headers={"X-CSRF-Token": "test-token"})

    def grant(self, summary=True, pdf=False):
        result = self.change(self.owner, "/api/cv/shares", {
            "recipient_email": "recipient@example.test", "share_summary": summary, "share_pdf": pdf,
            "expires_in_days": 7, "expected_file_sha256": self.digest,
        })
        self.assertEqual(result.status_code, 200, result.get_json())
        return result.get_json()["share"]

    def test_owner_routes_and_no_cache(self):
        self.assertEqual(self.client().get("/api/cv/me").status_code, 401)
        self.assertIsNone(self.stranger.get("/api/cv/me").get_json()["cv"])
        self.assertEqual(self.stranger.get("/api/cv/me/pdf").status_code, 404)
        response = self.owner.get("/api/cv/me/pdf")
        self.assertEqual(response.status_code, 200)
        self.assertIn("no-store", response.headers["Cache-Control"])
        response.close()
        self.assertEqual(self.owner.get("/workspace").status_code, 200)
        self.assertEqual(self.owner.get("/api/cv/me/export").status_code, 200)

    def test_csrf_and_cross_origin_mutations_fail_closed(self):
        self.assertEqual(self.owner.delete("/api/cv/me").status_code, 403)
        result = self.owner.delete("/api/cv/me", headers={"X-CSRF-Token": "test-token", "Origin": "https://evil.example"})
        self.assertEqual(result.status_code, 403)
        self.assertIsNotNone(cv_engine.get_user_cv("owner"))

    def test_share_identity_and_separate_resource_consent(self):
        for summary, pdf in [(True, False), (False, True), (True, True)]:
            share = self.grant(summary, pdf)
            self.assertEqual(self.stranger.get(share["url"]).status_code, 404)
            self.assertEqual(self.client().get(share["url"]).status_code, 401)
            view = self.recipient.get(share["url"])
            self.assertEqual(view.status_code, 200)
            self.assertIn("no-store", view.headers["Cache-Control"])
            self.assertEqual(b"Reviewed career summary" in view.data, summary)
            file = self.recipient.get(share["url"] + "/pdf")
            self.assertEqual(file.status_code, 200 if pdf else 404)
            file.close()
            self.assertEqual(self.stranger.get(share["url"] + "/pdf").status_code, 404)

    def test_revocation_expiry_and_replacement_invalidate_links(self):
        share = self.grant()
        self.assertEqual(self.change(self.stranger, "/api/cv/shares/" + share["grant_id"], method="DELETE").status_code, 404)
        self.assertEqual(self.change(self.owner, "/api/cv/shares/" + share["grant_id"], method="DELETE").status_code, 200)
        self.assertEqual(self.recipient.get(share["url"]).status_code, 404)
        share = self.grant()
        conn = auth_db.get_db_connection(); conn.execute("UPDATE cv_shares SET expires_at='2000-01-01'"); conn.commit(); conn.close()
        self.assertEqual(self.recipient.get(share["url"]).status_code, 404)
        share = self.grant()
        cv_engine.save_user_pdf_cv("owner", "fictional.pdf", self.pdf)
        cv_engine.update_user_structured_cv("owner", {"review_confirmed": True, "expected_file_sha256": self.digest})
        self.assertEqual(self.recipient.get(share["url"]).status_code, 404)

    def test_content_edits_invalidate_shares_and_stats_choice_does_not(self):
        share = self.grant()
        cv_engine.update_user_structured_cv("owner", {"allow_anon_stats": True})
        self.assertEqual(self.recipient.get(share["url"]).status_code, 200)
        cv_engine.update_user_structured_cv("owner", {"executive_summary": "Owner edited summary", "expected_file_sha256": self.digest, "review_confirmed": True})
        self.assertEqual(self.recipient.get(share["url"]).status_code, 404)

    def test_deletion_removes_all_grants_and_logs(self):
        share = self.grant(); self.recipient.get(share["url"])
        response = self.change(self.owner, "/api/cv/me", method="DELETE")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.recipient.get(share["url"]).status_code, 404)
        self.assertEqual(vault_sharing.list_shares("owner"), {"shares": [], "received": [], "events": []})

    def test_upload_requires_synthetic_confirmation_and_checks_sample_allowlist(self):
        headers = {"X-CSRF-Token": "test-token"}
        response = self.owner.post("/api/cv/upload", data={"file": (io.BytesIO(self.pdf), "fictional.pdf")}, headers=headers)
        self.assertEqual(response.status_code, 400)
        response = self.owner.post("/api/cv/upload", data={"file": (io.BytesIO(self.pdf), "fictional.pdf"), "synthetic_confirmed": "1"}, headers=headers)
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["cv"]["structured_cv"]["review_status"], "needs_review")
        self.assertEqual(self.change(self.owner, "/api/cv/upload", {"sample_filename": "../../main.py"}).status_code, 400)

    def test_invalid_grants_do_not_create_access_and_views_are_audited(self):
        data = {"recipient_email": "recipient@example.test", "share_summary": "false", "expected_file_sha256": self.digest}
        self.assertEqual(self.change(self.owner, "/api/cv/shares", data).status_code, 400)
        share = self.grant()
        self.stranger.get(share["url"])
        self.assertEqual(vault_sharing.list_shares("owner")["events"], [])
        self.recipient.get(share["url"])
        self.assertEqual(len(vault_sharing.list_shares("owner")["events"]), 1)


if __name__ == "__main__":
    unittest.main()
