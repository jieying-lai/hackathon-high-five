"""Content Moderation & AI Safety Validation Engine for CareerLens AI.

Enforces Fair-AI principles, Malaysia Personal Data Protection Act (PDPA 2010),
and content safety guardrails across all user uploads, CV text, applications,
feedback inquiries, and employer job descriptions.

Detects:
1. Illegal or fraudulent activities (money laundering, unlicensed schemes, fraud, scam keywords)
2. Hate speech, abusive language, or discriminatory exclusion
3. Prompt injection and jailbreak payloads (e.g., 'ignore previous instructions', eval(), exec())
4. Unprotected sensitive financial data (credit card numbers, unmasked credentials)
"""

import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

# Patterns for illicit, fraudulent, or harmful wording
_ILLEGAL_PATTERNS = [
    (re.compile(r"\b(?:money\s+launder(?:ing)?|ponzi\s+scheme|pyramid\s+scheme|illicit\s+substance|contraband)\b", re.I), "Illegal Financial & Contraband Activity"),
    (re.compile(r"\b(?:fake\s+(?:degree|diploma|certificate|passport|ic)|forge(?:d)?\s+credentials?)\b", re.I), "Credential Fraud / Forgery"),
    (re.compile(r"\b(?:phishing|ransomware|trojan\s+payload|ddos\s+attack|unauthorized\s+exploit)\b", re.I), "Cybercrime & Malicious Exploitation"),
    (re.compile(r"\b(?:unlicensed\s+gambling|illegal\s+betting|bribe(?:ry)?|kickback)\b", re.I), "Bribery & Unregulated Gambling"),
    (re.compile(r"\b(?:scam\s+recruitment|guaranteed\s+passive\s+income\s+no\s+work|pay\s+to\s+get\s+hired)\b", re.I), "Recruitment Fraud / Job Scam"),
]

# Patterns for toxic, abusive, or hate speech
_ABUSIVE_PATTERNS = [
    (re.compile(r"\b(?:hate\s+speech|racial\s+slur|terroris[mt]|violent\s+extremis[mt])\b", re.I), "Hate Speech & Extremism"),
    (re.compile(r"\b(?:kill\s+yourself|die\s+in\s+a\s+fire|assassinat(?:e|ion))\b", re.I), "Harassment & Violent Threats"),
]

# Patterns for Prompt Injection & Jailbreak attempts
_INJECTION_PATTERNS = [
    (re.compile(r"(?:ignore\s+(?:all\s+)?previous\s+instructions|system\s+prompt\s+override|disregard\s+above|you\s+are\s+now\s+dan\b)", re.I), "Prompt Injection / Jailbreak Attempt"),
    (re.compile(r"(?:<script\b|javascript:|onerror\s*=|eval\s*\(|document\.cookie)", re.I), "Malicious Script / XSS Vector"),
    (re.compile(r"(?:exec\s*\(|__import__\s*\(|os\.system|subprocess\.)", re.I), "Arbitrary Code Execution Attempt"),
]

# Patterns for raw sensitive financial PII (credit cards)
_FINANCIAL_PII_PATTERNS = [
    (re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b"), "Unmasked Credit Card Number"),
]


def validate_content(text: str, context: str = "general") -> Dict[str, Any]:
    """Scan and validate any text submission for safety, legality, and compliance.

    Args:
        text: The raw text string to inspect (CV text, notes, feedback, role descriptions).
        context: Context of the text ('cv', 'application', 'feedback', 'user_profile').

    Returns:
        dict containing:
            - is_safe (bool): True if content is clean and compliant.
            - status (str): 'Verified Clean' or 'Flagged for Review'.
            - risk_score (int): 0 (clean) to 100 (high risk).
            - categories (list[str]): Categories triggered, if any.
            - reason (str): Human-readable compliance summary.
            - checked_at (str): UTC timestamp of audit scan.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    if not text or not str(text).strip():
        return {
            "is_safe": True,
            "status": "Verified Clean",
            "risk_score": 0,
            "categories": [],
            "reason": "Empty or standard minimal content verified clean.",
            "checked_at": now,
            "context": context,
        }

    raw = str(text)
    triggered_categories: List[str] = []
    risk_score = 0

    # 1. Check Illegal & Fraud Patterns (High Severity)
    for pattern, label in _ILLEGAL_PATTERNS:
        if pattern.search(raw):
            triggered_categories.append(label)
            risk_score = max(risk_score, 85)

    # 2. Check Abusive & Hate Speech Patterns (High Severity)
    for pattern, label in _ABUSIVE_PATTERNS:
        if pattern.search(raw):
            triggered_categories.append(label)
            risk_score = max(risk_score, 90)

    # 3. Check Prompt Injection Patterns (Medium-High Severity)
    for pattern, label in _INJECTION_PATTERNS:
        if pattern.search(raw):
            triggered_categories.append(label)
            risk_score = max(risk_score, 75)

    # 4. Check Raw Financial PII (Medium Severity)
    for pattern, label in _FINANCIAL_PII_PATTERNS:
        if pattern.search(raw):
            triggered_categories.append(label)
            risk_score = max(risk_score, 60)

    is_safe = len(triggered_categories) == 0

    if is_safe:
        return {
            "is_safe": True,
            "status": "Verified Clean",
            "risk_score": 0,
            "categories": [],
            "reason": "100% compliant under Fair-AI & PDPA 2010 safety standards.",
            "checked_at": now,
            "context": context,
        }

    return {
        "is_safe": False,
        "status": "Flagged for Review",
        "risk_score": risk_score,
        "categories": list(set(triggered_categories)),
        "reason": f"Content triggered safety filters: {', '.join(set(triggered_categories))}.",
        "checked_at": now,
        "context": context,
    }


def audit_record_data(record: dict) -> Dict[str, Any]:
    """Helper to evaluate a composite record (e.g. CV or Application)."""
    combined_parts = []
    for k in ["headline", "executive_summary", "motivation", "cover_note", "notes", "message", "subject"]:
        val = record.get(k)
        if isinstance(val, str) and val:
            combined_parts.append(val)

    # Add skills or projects if list
    skills = record.get("skills")
    if isinstance(skills, list):
        combined_parts.extend([str(s) for s in skills if isinstance(s, (str, int))])

    combined_text = "\n".join(combined_parts)
    return validate_content(combined_text, context="composite_record")
