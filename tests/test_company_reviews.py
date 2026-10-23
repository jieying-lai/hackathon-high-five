"""Review persistence, ownership and input boundaries against an isolated database."""
import functools
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
from flask import Flask, session
import company_reviews


class CompanyReviewTests(unittest.TestCase):
    def setUp(self):
        scratch = Path(__file__).resolve().parents[1] / 'work'
        scratch.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=scratch)
        self.addCleanup(self.tmp.cleanup)
        def connect():
            conn = sqlite3.connect(str(Path(self.tmp.name) / 'reviews.db'))
            conn.row_factory = sqlite3.Row
            return conn
        self.patch = patch.object(company_reviews, 'get_db_connection', connect)
        self.patch.start()
        self.addCleanup(self.patch.stop)
        app = Flask(__name__)
        app.secret_key = 'test-only'
        def role(required):
            def decorate(fn):
                @functools.wraps(fn)
                def wrapped(*args, **kwargs):
                    if not session.get('user'): return {'ok':False}, 401
                    if session['user']['role'] != required: return {'ok':False}, 403
                    return fn(*args, **kwargs)
                return wrapped
            return decorate
        company_reviews.register_company_reviews(app, role)
        self.client = app.test_client()
        self.id = next(iter(company_reviews.company_ids()))
        self.url = f'/api/companies/{self.id}/reviews'
        self.payload = dict(relationship='Current employee',rating=4,title='Helpful team',pros='Clear feedback',cons='More training')

    def login(self, uid='author', role='job_seeker'):
        with self.client.session_transaction() as s:
            s['user'] = {'unique_uid':uid,'role':role}

    def test_publish_persists_without_identity_and_update_does_not_duplicate(self):
        self.login()
        data = self.client.post(self.url,json=self.payload).get_json()
        self.assertEqual(data['count'],1)
        self.assertTrue(data['reviews'][0]['is_mine'])
        self.assertNotIn('owner_uid',data['reviews'][0])
        self.payload['rating']=2
        self.client.post(self.url,json=self.payload)
        data=self.client.get(self.url).get_json()
        self.assertEqual((data['count'],data['average']),(1,2))

    def test_other_member_cannot_delete_author_review(self):
        self.login();self.client.post(self.url,json=self.payload)
        self.login('reader');self.client.delete(self.url)
        data=self.client.get(self.url).get_json()
        self.assertEqual(data['count'],1)
        self.assertFalse(data['reviews'][0]['is_mine'])
        self.assertIsNone(data['mine'])
        self.login();self.client.delete(self.url)
        self.assertEqual(self.client.get(self.url).get_json()['count'],0)

    def test_validation_role_and_company_boundaries(self):
        self.assertEqual(self.client.get(self.url).status_code,401)
        self.login(role='hr_company')
        self.assertEqual(self.client.post(self.url,json=self.payload).status_code,403)
        self.login()
        for rating in [0,6,True,3.5,None,'3.0']:
            self.assertEqual(self.client.post(self.url,json={**self.payload,'rating':rating}).status_code,400)
        self.assertEqual(self.client.post(self.url,json={**self.payload,'title':'x'*121}).status_code,400)
        self.assertEqual(self.client.post(self.url,json={**self.payload,'relationship':'Other'}).status_code,400)
        self.assertEqual(self.client.post('/api/companies/unknown/reviews',json=self.payload).status_code,404)
        self.assertEqual(self.client.get(self.url).get_json()['count'],0)


if __name__ == '__main__':
    unittest.main()
