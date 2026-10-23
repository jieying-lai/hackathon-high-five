"""Account-owned public company reviews, separate from imported historical ratings."""
import json
from contextlib import closing
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

from flask import jsonify, request, session
from auth_db import get_db_connection

RELATIONSHIPS = {'Current employee', 'Former employee', 'Interview candidate', 'Intern'}


@lru_cache(maxsize=1)
def company_ids():
    path = Path(__file__).resolve().parents[1] / 'data/processed/companies_base.json'
    return {row['company_id'] for row in json.loads(path.read_text(encoding='utf-8'))}


def connect():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS company_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id TEXT NOT NULL, owner_uid TEXT NOT NULL,
        relationship TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        title TEXT NOT NULL, pros TEXT NOT NULL, cons TEXT NOT NULL,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        UNIQUE(company_id, owner_uid))''')
    conn.commit()
    return conn


def register_company_reviews(app, api_role):
    @app.route('/api/companies/<company_id>/reviews', methods=['GET', 'POST', 'DELETE'])
    @api_role('job_seeker')
    def company_reviews(company_id):
        if company_id not in company_ids():
            return jsonify(ok=False, message='Company not found.'), 404
        owner = session['user']['unique_uid']
        with closing(connect()) as conn:
            if request.method == 'DELETE':
                with conn:
                    conn.execute('DELETE FROM company_reviews WHERE company_id=? AND owner_uid=?', (company_id, owner))
                return jsonify(ok=True, message='Your review was removed.')
            if request.method == 'POST':
                data = request.get_json(silent=True)
                if not isinstance(data, dict):
                    return jsonify(ok=False, message='Invalid review.'), 400
                rating = data.get('rating')
                if isinstance(rating, str) and rating in {'1','2','3','4','5'}:
                    rating = int(rating)
                if type(rating) is not int or not 1 <= rating <= 5:
                    return jsonify(ok=False, message='Choose 1 to 5 stars.'), 400
                fields = {}
                for key, minimum, maximum in [('relationship',1,30),('title',1,120),('pros',1,2000),('cons',0,2000)]:
                    value = data.get(key, '')
                    if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
                        return jsonify(ok=False, message=f'Please check {key} and its length.'), 400
                    fields[key] = value.strip()
                if fields['relationship'] not in RELATIONSHIPS:
                    return jsonify(ok=False, message='Choose your relationship.'), 400
                now = datetime.now(timezone.utc).isoformat()
                with conn:
                    conn.execute('''INSERT INTO company_reviews
                        (company_id,owner_uid,relationship,rating,title,pros,cons,created_at,updated_at)
                        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(company_id,owner_uid) DO UPDATE SET
                        relationship=excluded.relationship,rating=excluded.rating,title=excluded.title,
                        pros=excluded.pros,cons=excluded.cons,updated_at=excluded.updated_at''',
                        (company_id,owner,fields['relationship'],rating,fields['title'],fields['pros'],fields['cons'],now,now))
            summary = conn.execute('SELECT COUNT(*) AS count, AVG(rating) AS average FROM company_reviews WHERE company_id=?', (company_id,)).fetchone()
            rows = conn.execute('''SELECT relationship,rating,title,pros,cons,created_at,updated_at,
                owner_uid=? AS is_mine FROM company_reviews WHERE company_id=?
                ORDER BY updated_at DESC,id DESC LIMIT 50''', (owner,company_id)).fetchall()
            mine = conn.execute('''SELECT relationship,rating,title,pros,cons FROM company_reviews
                WHERE company_id=? AND owner_uid=?''',(company_id,owner)).fetchone()
            return jsonify(ok=True, count=summary['count'], average=round(summary['average'],2) if summary['average'] is not None else None,
                           reviews=[dict(row) for row in rows], mine=dict(mine) if mine else None)
