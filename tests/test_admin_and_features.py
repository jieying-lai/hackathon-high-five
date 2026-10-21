"""Unit and integration tests for Admin Backdesk, Help Desk, Password Reset, and Map Dots."""

import json
import unittest
from src.main import app
import src.auth_db as auth_db


class TestAdminAndNewFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        auth_db.init_db()

    def setUp(self):
        self.client = app.test_client()
        app.config.update(TESTING=True)
        with self.client.session_transaction() as s:
            s["csrf_token"] = "test-token"

    def get_csrf(self):
        with self.client.session_transaction() as s:
            return s.get("csrf_token", "test-token")

    def post_json(self, url, data):
        return self.client.post(url, json=data, headers={"X-CSRF-Token": self.get_csrf()})

    def put_json(self, url, data):
        return self.client.put(url, json=data, headers={"X-CSRF-Token": self.get_csrf()})

    def test_admin_authentication_and_stats(self):
        # 1. Login as admin
        res = self.post_json(
            "/api/auth/login",
            {"email": "admin@careerlens.my", "password": "Admin@2026!"},
        )
        data = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["ok"])
        self.assertEqual(data["user"]["role"], "admin")
        self.assertEqual(data["redirect"], "/admin")

        # 2. Access admin stats
        s_res = self.client.get("/api/admin/stats")
        self.assertEqual(s_res.status_code, 200)
        s_data = s_res.get_json()
        self.assertTrue(s_data["ok"])
        self.assertIn("total_users", s_data["stats"])
        self.assertIn("total_jobs", s_data["stats"])

        # 3. Access admin users list
        u_res = self.client.get("/api/admin/users")
        self.assertEqual(u_res.status_code, 200)
        u_data = u_res.get_json()
        self.assertTrue(u_data["ok"])
        self.assertGreaterEqual(len(u_data["users"]), 2)

    def test_helpdesk_feedback_submission_and_resolution(self):
        # Submit a ticket
        post_res = self.post_json(
            "/api/helpdesk/feedback",
            {
                "category": "Bug Report",
                "subject": "Map circle visibility in Melaka",
                "message": "Testing map dots and radius circle rendering.",
                "priority": "High"
            }
        )
        self.assertEqual(post_res.status_code, 200)
        p_data = post_res.get_json()
        self.assertTrue(p_data["ok"])
        fid = p_data["ticket_id"]
        self.assertGreater(fid, 0)

        # Login as admin to view and resolve it
        self.post_json(
            "/api/auth/login",
            {"email": "admin@careerlens.my", "password": "Admin@2026!"},
        )
        f_res = self.client.get("/api/admin/feedbacks")
        self.assertEqual(f_res.status_code, 200)
        feedbacks = f_res.get_json()["feedbacks"]
        found = any(f["id"] == fid for f in feedbacks)
        self.assertTrue(found)

        # Update feedback status
        put_res = self.put_json(
            f"/api/admin/feedbacks/{fid}",
            {"status": "Resolved", "admin_notes": "Fixed in latest build"}
        )
        self.assertEqual(put_res.status_code, 200)
        self.assertTrue(put_res.get_json()["ok"])

    def test_forgot_password_random_code_flow(self):
        # 1. Request 6-digit code for aisha.demo@careerlens.my
        req_res = self.post_json(
            "/api/auth/forgot-password/request",
            {"email": "aisha.demo@careerlens.my"}
        )
        self.assertEqual(req_res.status_code, 200)
        code = req_res.get_json()["code"]
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())

        # 2. Reset password with code
        verify_res = self.post_json(
            "/api/auth/forgot-password/verify",
            {
                "email": "aisha.demo@careerlens.my",
                "code": code,
                "new_password": "NewSecret@2026!",
                "confirm_password": "NewSecret@2026!"
            }
        )
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.get_json()["ok"])

        # 3. Verify new password works
        login_res = self.post_json(
            "/api/auth/login",
            {"email": "aisha.demo@careerlens.my", "password": "NewSecret@2026!"},
        )
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.get_json()["ok"])

        # 4. Restore original password for other tests
        restore_res = self.post_json(
            "/api/auth/forgot-password/request",
            {"email": "aisha.demo@careerlens.my"}
        )
        self.assertEqual(restore_res.status_code, 200)
        code2 = restore_res.get_json()["code"]
        self.post_json(
            "/api/auth/forgot-password/verify",
            {
                "email": "aisha.demo@careerlens.my",
                "code": code2,
                "new_password": "CareerLens@2026",
                "confirm_password": "CareerLens@2026"
            }
        )


if __name__ == "__main__":
    unittest.main()
