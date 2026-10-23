"""Private action records must not become verified CV evidence or leak across accounts."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import auth_db
import career_actions
import main


class CareerActionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.database = patch.object(auth_db, "DB_PATH", Path(self.temp.name) / "actions.db")
        self.database.start()
        career_actions.init_tables()
        self.client = main.app.test_client()
        with self.client.session_transaction() as session:
            session["csrf_token"] = "test-csrf"

    def tearDown(self):
        self.database.stop()
        self.temp.cleanup()

    def login(self, uid="A", role="job_seeker"):
        with self.client.session_transaction() as session:
            session["user"] = {"unique_uid": uid, "role": role}

    def request(self, method, path="/api/career-actions", **payload):
        return self.client.open(path, method=method, json=payload,
                                headers={"X-CSRF-Token": "test-csrf"})

    def create(self, owner="A", **changes):
        return career_actions.create(owner, {
            "kind": "skill_practice", "role_title": "Analyst", "skill": "Excel", **changes,
        })

    def test_auth_role_csrf_and_private_get(self):
        self.assertEqual(self.client.get("/api/career-actions").status_code, 401)
        self.login(role="hr_company")
        self.assertEqual(self.client.get("/api/career-actions").status_code, 403)
        self.login()
        self.assertEqual(self.client.post("/api/career-actions", json={}).status_code, 403)
        self.assertEqual(self.client.get("/api/career-actions").json["actions"], [])
        self.assertIn("no-store", self.client.get("/api/career-actions").headers["Cache-Control"])

    def test_all_write_endpoints_require_talent_role_and_csrf(self):
        for method, path, payload in [
            ("POST", "/api/career-actions", {"kind": "role_test", "role_title": "Analyst"}),
            ("PATCH", "/api/career-actions/preferences", {"goal": "learn", "minutes": 20}),
            ("PATCH", "/api/career-actions/missing", {"status": "done"}),
        ]:
            self.login()
            self.assertEqual(self.client.open(path, method=method, json=payload).status_code, 403)
            self.login(role="hr_company")
            self.assertEqual(self.request(method, path, **payload).status_code, 403)

    def test_defaults_and_preferences_are_account_scoped(self):
        self.assertEqual(career_actions.snapshot("A")["preferences"], {"goal": "explore", "minutes": 20})
        career_actions.preferences("A", {"goal": "apply", "minutes": 30})
        self.assertEqual(career_actions.snapshot("A")["preferences"], {"goal": "apply", "minutes": 30})
        self.assertEqual(career_actions.snapshot("B")["preferences"]["goal"], "explore")

    def test_create_finish_note_undo_and_reload(self):
        self.login()
        response = self.request("POST", kind="skill_practice", role_title="Analyst", skill="Excel")
        self.assertEqual(response.status_code, 201)
        action = response.json["action"]
        self.assertNotIn("owner_uid", action)
        self.assertEqual(action["status"], "planned")
        path = "/api/career-actions/" + action["id"]
        done = self.request("PATCH", path, status="done", note="Built a pivot table.").json["action"]
        self.assertTrue(done["completed_at"])
        self.assertEqual(done["note"], "Built a pivot table.")
        self.assertEqual(self.client.get("/api/career-actions").json["actions"][0], done)
        undone = self.request("PATCH", path, status="planned").json["action"]
        self.assertIsNone(undone["completed_at"])
        self.assertEqual(undone["note"], done["note"])

    def test_unshared_records_are_not_visible_or_mutable_to_another_user(self):
        action = self.create()
        self.login("B")
        self.assertEqual(self.client.get("/api/career-actions").json["actions"], [])
        response = self.request("PATCH", "/api/career-actions/" + action["id"], status="done")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(career_actions.snapshot("A")["actions"][0]["status"], "planned")

    def test_duplicate_active_action_is_idempotent_including_concurrent_requests(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            actions = list(pool.map(lambda _: self.create(), range(4)))
        self.assertEqual(len({action["id"] for action in actions}), 1)
        self.assertEqual(len(career_actions.snapshot("A")["actions"]), 1)
        self.assertEqual(self.create(role_title=" analyst ", skill=" excel ")["id"], actions[0]["id"])

    def test_undo_does_not_duplicate_an_existing_active_action(self):
        action = self.create()
        career_actions.update("A", action["id"], {"status": "done"})
        next_action = self.create()
        self.assertNotEqual(action["id"], next_action["id"])
        with self.assertRaises(career_actions.ActionLimit):
            career_actions.update("A", action["id"], {"status": "planned"})
        self.assertEqual(career_actions.snapshot("A")["actions"][1]["status"], "done")

    def test_capacity_limit_never_blocks_recording_an_existing_action(self):
        first = self.create()
        for i in range(career_actions.ACTIVE_LIMIT - 1):
            self.create(role_title=f"Role {i}")
        self.assertEqual(self.create()["id"], first["id"])
        with self.assertRaises(career_actions.ActionLimit):
            self.create(role_title="One too many")
        career_actions.update("A", first["id"], {"status": "done"})
        self.assertEqual(self.create(role_title="Now available")["status"], "planned")

    def test_malformed_or_overlong_fields_and_client_ownership_are_rejected(self):
        self.login()
        for changes in [
            {"kind": []}, {"kind": "shortlist"}, {"role_title": ""},
            {"role_title": "x" * 151}, {"skill": []}, {"skill": ""},
            {"skill": "x" * 101}, {"role_title": "bad\x00"},
            {"owner_uid": "B"}, {"status": "done"}, {"title": "Verified expert"},
        ]:
            payload = {"kind": "skill_practice", "role_title": "Analyst", "skill": "Excel", **changes}
            with self.subTest(changes=changes):
                self.assertEqual(self.request("POST", **payload).status_code, 400)
        for payload in [[], None, "bad"]:
            response = self.client.post("/api/career-actions", json=payload,
                                       headers={"X-CSRF-Token": "test-csrf"})
            self.assertEqual(response.status_code, 400)
        self.assertEqual(career_actions.snapshot("A")["actions"], [])

    def test_preference_and_update_validation(self):
        self.login()
        for payload in [{"goal": "hired", "minutes": 20}, {"goal": [], "minutes": 20},
                        {"goal": "learn", "minutes": True}, {"goal": "learn", "minutes": 15}]:
            self.assertEqual(self.request("PATCH", "/api/career-actions/preferences", **payload).status_code, 400)
        action = self.create()
        for payload in [{"note": "x" * 801}, {"status": []}, {"status": "verified"}, {"note": None}, {}]:
            self.assertEqual(self.request("PATCH", "/api/career-actions/" + action["id"], **payload).status_code, 400)

    def test_completion_does_not_modify_cv_or_certify_skills(self):
        with patch.object(main.cv_engine, "save_user_pdf_cv") as save:
            action = self.create()
            done = career_actions.update("A", action["id"], {"status": "done", "note": "<script>not executed</script>"})
        save.assert_not_called()
        self.assertEqual(done["note"], "<script>not executed</script>")
        self.assertNotIn("verified", done)

    def test_delete_is_private_csrf_protected_and_does_not_fake_completion(self):
        action = self.create()
        path = "/api/career-actions/" + action["id"]
        self.login()
        self.assertEqual(self.client.delete(path).status_code, 403)
        self.login("B")
        self.assertEqual(self.request("DELETE", path).status_code, 404)
        self.login()
        self.assertEqual(self.request("DELETE", path).status_code, 200)
        self.assertEqual(career_actions.snapshot("A")["actions"], [])
        self.assertEqual(self.request("DELETE", path).status_code, 404)


if __name__ == "__main__":
    unittest.main()
