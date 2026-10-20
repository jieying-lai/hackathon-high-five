"""Unit tests for user account viewing, editing, and password update."""

import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from auth_db import (
    get_db_connection,
    update_user_profile,
    update_user_password,
    get_user_by_uid,
    authenticate_user,
    init_db,
)

class TestAccountProfile(unittest.TestCase):
    def setUp(self):
        init_db()
        self.test_uid = "CL-JS-2026-1042"

    def test_get_user_by_uid(self):
        user = get_user_by_uid(self.test_uid)
        self.assertIsNotNone(user)
        self.assertEqual(user["email"], "aisha.demo@careerlens.my")
        self.assertEqual(user["role"], "job_seeker")

    def test_update_profile_success(self):
        ok, msg, updated = update_user_profile(
            self.test_uid,
            full_name="Aisha Binti Rahman",
            email="aisha.updated@careerlens.my",
            role_details={
                "current_role": "Senior Financial Auditor",
                "industry": "Finance & Accounting",
                "location": "Kuala Lumpur",
                "phone": "+60123456789",
            }
        )
        self.assertTrue(ok, msg)
        self.assertEqual(updated["full_name"], "Aisha Binti Rahman")
        self.assertEqual(updated["email"], "aisha.updated@careerlens.my")
        self.assertEqual(updated["role_details"]["current_role"], "Senior Financial Auditor")
        self.assertEqual(updated["role_details"]["phone"], "+60123456789")

        # Restore original for subsequent tests
        update_user_profile(
            self.test_uid,
            full_name="Aisha Rahman",
            email="aisha.demo@careerlens.my",
            role_details={
                "seeker_type": "Career Switcher / At Risk of AI Displacement",
                "industry": "Finance & Accounting",
                "current_role": "Junior Financial Auditor",
                "education_level": "Bachelor's Degree (B.Acc)",
                "years_experience": "3 Years",
                "preferred_work_mode": "Hybrid",
                "location": "Kuala Lumpur",
            }
        )

    def test_update_profile_duplicate_email(self):
        # Trying to update to an email belonging to another user (hr.demo@nexussme.my)
        ok, msg, _ = update_user_profile(
            self.test_uid,
            full_name="Aisha Rahman",
            email="hr.demo@nexussme.my",
        )
        self.assertFalse(ok)
        self.assertIn("already in use", msg)

    def test_update_password_flow(self):
        # Wrong current password
        ok, msg = update_user_password(
            self.test_uid,
            current_password="WrongPassword123!",
            new_password="NewSecurePass@2026",
            confirm_password="NewSecurePass@2026",
        )
        self.assertFalse(ok)
        self.assertIn("Current password", msg)

        # Mismatched new password
        ok, msg = update_user_password(
            self.test_uid,
            current_password="CareerLens@2026",
            new_password="NewSecurePass@2026",
            confirm_password="DifferentPass@2026",
        )
        self.assertFalse(ok)
        self.assertIn("do not match", msg)

        # Successful update
        ok, msg = update_user_password(
            self.test_uid,
            current_password="CareerLens@2026",
            new_password="NewSecurePass@2026",
            confirm_password="NewSecurePass@2026",
        )
        self.assertTrue(ok)

        # Verify login works with new password
        ok_login, _, _ = authenticate_user("aisha.demo@careerlens.my", "NewSecurePass@2026")
        self.assertTrue(ok_login)

        # Restore original password
        update_user_password(
            self.test_uid,
            current_password="NewSecurePass@2026",
            new_password="CareerLens@2026",
            confirm_password="CareerLens@2026",
        )

if __name__ == "__main__":
    unittest.main()
