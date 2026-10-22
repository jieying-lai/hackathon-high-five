"""Idempotent milestone/pledge ledger. Records promises; never transfers money."""
from contextlib import closing
from datetime import date, datetime, timedelta, timezone
import hashlib
import os
from pathlib import Path
import sqlite3
from urllib.parse import urlsplit, urlunsplit

from auth_db import DB_PATH

MILESTONES = (10, 20, 30, 40, 50)
PLEDGE_PER_BADGE_CENTS = 10
DEFAULT_RECIPIENT = 'World Food Programme (WFP)'
WFP_DONATION_URL = 'https://www.wfp.org/support-us/stories/donate-now'
SUGGESTED_ORGANISATIONS = [
    {'name': DEFAULT_RECIPIENT, 'url': WFP_DONATION_URL},
]


def campaign():
    demo = os.getenv('CAREERLENS_DEMO', '1') == '1'
    return os.getenv('CAREERLENS_IMPACT_CAMPAIGN', 'learning-for-food-demo-v2' if demo else 'learning-for-food-v2'), demo


def connect():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.executescript('''
      CREATE TABLE IF NOT EXISTS learning_impact_completions (
        campaign TEXT NOT NULL, uid TEXT NOT NULL, course_hash TEXT NOT NULL,
        reported_at TEXT NOT NULL, PRIMARY KEY(campaign, uid, course_hash));
      CREATE TABLE IF NOT EXISTS learning_impact_payouts (
        id INTEGER PRIMARY KEY, campaign TEXT NOT NULL, amount_cents INTEGER NOT NULL,
        paid_at TEXT NOT NULL, recipient TEXT NOT NULL, receipt_url TEXT NOT NULL,
        UNIQUE(campaign, receipt_url));
      CREATE TABLE IF NOT EXISTS learning_impact_badges (
        campaign TEXT NOT NULL, uid TEXT NOT NULL, target INTEGER NOT NULL,
        earned_at TEXT NOT NULL, payout_id INTEGER,
        PRIMARY KEY(campaign, uid, target));
    ''')
    return conn


def canonical_url(value):
    if not isinstance(value, str) or len(value) > 2000:
        return None
    try:
        parsed = urlsplit(value)
        if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
            return None
        return urlunsplit((parsed.scheme, parsed.netloc.lower(), parsed.path.rstrip('/'), '', ''))
    except ValueError:
        return None


def schedule():
    recipient = os.getenv('CAREERLENS_IMPACT_RECIPIENT', DEFAULT_RECIPIENT).strip()[:200] or DEFAULT_RECIPIENT
    recipient_url = os.getenv('CAREERLENS_IMPACT_RECIPIENT_URL', WFP_DONATION_URL if recipient == DEFAULT_RECIPIENT else '').strip()
    recipient_url = canonical_url(recipient_url) if recipient_url.startswith('https://') else None
    try:
        day = int(os.getenv('CAREERLENS_IMPACT_PAYOUT_DAY', '0'))
    except ValueError:
        day = 0
    next_date = None
    if 1 <= day <= 28:
        today = datetime.now(timezone(timedelta(hours=8))).date()
        next_date = date(today.year, today.month, day)
        if next_date < today:
            year, month = (today.year+1, 1) if today.month == 12 else (today.year, today.month+1)
            next_date = date(year, month, day)
    return {'recipient': recipient, 'recipient_url': recipient_url, 'monthly_day': day if 1 <= day <= 28 else None,
            'next_transfer_date': next_date.isoformat() if next_date else None,
            'suggested_organisations': SUGGESTED_ORGANISATIONS}


def summary(conn, uid):
    campaign_id, demo = campaign()
    earned = [dict(row) for row in conn.execute(
        'SELECT target, earned_at, payout_id FROM learning_impact_badges WHERE campaign=? AND uid=? ORDER BY target',
        (campaign_id, uid))]
    count = conn.execute('SELECT COUNT(*) FROM learning_impact_completions WHERE campaign=? AND uid=?',
                         (campaign_id, uid)).fetchone()[0]
    totals = conn.execute('''SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN payout_id IS NOT NULL THEN 1 ELSE 0 END),0) AS sent
                           FROM learning_impact_badges WHERE campaign=?''', (campaign_id,)).fetchone()
    receipts = [dict(row) for row in conn.execute('''SELECT amount_cents, paid_at, recipient, receipt_url
               FROM learning_impact_payouts WHERE campaign=? ORDER BY paid_at DESC LIMIT 12''', (campaign_id,))]
    registered_users = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
    contributors = conn.execute('SELECT COUNT(DISTINCT uid) FROM learning_impact_badges WHERE campaign=?', (campaign_id,)).fetchone()[0]
    # A fixed campaign-wide demo opening balance, never added per request or user.
    opening_cents = 500 if demo else 0
    return {'ok': True, 'campaign': campaign_id, 'demo': demo, 'currency': 'USD',
            'pledge_per_badge_cents': PLEDGE_PER_BADGE_CENTS,
            'milestones': list(MILESTONES), 'lifetime_completed': count, 'earned': earned,
            'registered_users': registered_users, 'badge_contributors': contributors, 'demo_opening_cents': opening_cents,
            'personal_pledged_cents': len(earned)*PLEDGE_PER_BADGE_CENTS,
            'company_pledged_cents': opening_cents + totals['total']*PLEDGE_PER_BADGE_CENTS,
            'company_pending_cents': opening_cents + (totals['total']-totals['sent'])*PLEDGE_PER_BADGE_CENTS,
            'company_sent_cents': totals['sent']*PLEDGE_PER_BADGE_CENTS, 'receipts': receipts, 'schedule': schedule(),
            'completion_basis': 'self_reported', 'automatic_payments': False}


def get_summary(uid):
    with closing(connect()) as conn:
        return summary(conn, uid)


def sync(uid, urls):
    if not isinstance(urls, list) or len(urls) > 10000:
        raise ValueError('Provide a course URL list with at most 10000 entries.')
    hashes = {hashlib.sha256(url.encode()).hexdigest() for value in urls if (url := canonical_url(value))}
    campaign_id, _ = campaign()
    now = datetime.now(timezone.utc).isoformat()
    with closing(connect()) as conn:
        with conn:
            conn.execute('BEGIN IMMEDIATE')
            conn.executemany('INSERT OR IGNORE INTO learning_impact_completions VALUES (?,?,?,?)',
                             ((campaign_id, uid, digest, now) for digest in hashes))
            count = conn.execute('SELECT COUNT(*) FROM learning_impact_completions WHERE campaign=? AND uid=?',
                                 (campaign_id, uid)).fetchone()[0]
            newly_earned = []
            for target in MILESTONES:
                if count >= target:
                    cursor = conn.execute('INSERT OR IGNORE INTO learning_impact_badges(campaign,uid,target,earned_at) VALUES (?,?,?,?)',
                                          (campaign_id, uid, target, now))
                    if cursor.rowcount:
                        newly_earned.append(target)
            result = summary(conn, uid)
            result['newly_earned'] = newly_earned
        return result


def record_transfer(amount_cents, recipient, receipt_url, paid_at):
    """Operator-only receipt entry after a real transfer; no HTTP write endpoint."""
    campaign_id, demo = campaign()
    if demo:
        raise ValueError('Real transfer receipts cannot be recorded in the demo campaign.')
    if type(amount_cents) is not int or amount_cents <= 0 or amount_cents % PLEDGE_PER_BADGE_CENTS:
        raise ValueError('Amount must allocate a whole number of USD 0.10 pledges.')
    if not recipient.strip() or not canonical_url(receipt_url) or not receipt_url.startswith('https://'):
        raise ValueError('Recipient and a public HTTPS receipt URL are required.')
    paid = date.fromisoformat(paid_at)
    if paid > datetime.now(timezone.utc).date():
        raise ValueError('Cannot record a future transfer as already sent.')
    with closing(connect()) as conn:
        with conn:
            conn.execute('BEGIN IMMEDIATE')
            pending = conn.execute('''SELECT uid,target FROM learning_impact_badges WHERE campaign=? AND payout_id IS NULL
                                     ORDER BY earned_at,uid,target LIMIT ?''', (campaign_id, amount_cents//PLEDGE_PER_BADGE_CENTS)).fetchall()
            if len(pending)*PLEDGE_PER_BADGE_CENTS != amount_cents:
                raise ValueError('The amount exceeds the pending pledge balance.')
            cursor = conn.execute('INSERT INTO learning_impact_payouts(campaign,amount_cents,paid_at,recipient,receipt_url) VALUES (?,?,?,?,?)',
                                  (campaign_id, amount_cents, paid.isoformat(), recipient.strip()[:200], receipt_url))
            conn.executemany('UPDATE learning_impact_badges SET payout_id=? WHERE campaign=? AND uid=? AND target=?',
                             ((cursor.lastrowid, campaign_id, row['uid'], row['target']) for row in pending))
            return cursor.lastrowid
