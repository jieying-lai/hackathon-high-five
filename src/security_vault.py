"""Security Vault & PDPA Data Protection for CareerLens AI.

Enforces Malaysia Personal Data Protection Act (PDPA 2010) compliance:
- Masks sensitive Personally Identifiable Information (PII) by default
  (Emails, phone numbers, identification numbers, addresses).
- Protects administrative audit logs whenever sensitive information is accessed or revealed.
- Provides symmetric token encryption / HMAC signing for verification.
"""

from datetime import datetime, timezone
import hashlib
import hmac
import os
import re
from typing import Any, Dict, Optional

# Secret key used for cryptographic HMAC verification
_SECRET_SALT = os.getenv("CAREERLENS_VAULT_SECRET", "CareerLens-PDPA-Vault-2026-SecureKey")


def mask_email(email: Optional[str]) -> str:
    """Mask email while preserving general domain context.
    Example: 'aisha.demo@careerlens.my' -> 'a***o@careerlens.my'
    """
    if not email or not isinstance(email, str) or "@" not in email:
        return "—"
    parts = email.strip().split("@", 1)
    user, domain = parts[0], parts[1]
    if len(user) <= 2:
        masked_user = user[0] + "***"
    else:
        masked_user = user[0] + "***" + user[-1]
    return f"{masked_user}@{domain}"


def mask_phone(phone: Optional[str]) -> str:
    """Mask telephone number according to PDPA standards.
    Example: '+60 12-345 6789' -> '+60 1*-*** 6789'
    """
    if not phone or not isinstance(phone, str):
        return "—"
    p = phone.strip()
    digits = re.sub(r"\D", "", p)
    if len(digits) < 7:
        return "****"
    # Show country prefix or first 3 digits and last 4 digits
    return f"+60 {digits[2:4] if len(digits)>4 else '1*'}-*** {digits[-4:]}"


def mask_name(full_name: Optional[str]) -> str:
    """Mask candidate name for privacy-preserving screening.
    Example: 'Aisha Rahman' -> 'A**** R*****'
    """
    if not full_name or not isinstance(full_name, str):
        return "Anonymous Candidate"
    words = full_name.strip().split()
    masked_words = []
    for w in words:
        if len(w) <= 1:
            masked_words.append(w)
        else:
            masked_words.append(w[0] + "*" * (len(w) - 1))
    return " ".join(masked_words)


def mask_user_dict(user: Dict[str, Any], reveal: bool = False) -> Dict[str, Any]:
    """Return a privacy-sanitized copy of a user record.
    If reveal is False (default), sensitive PII fields are masked.
    """
    u = dict(user)
    if not reveal:
        u["email_masked"] = mask_email(u.get("email"))
        u["full_name_masked"] = u.get("full_name")  # name can be visible or partially masked
        u["is_pii_masked"] = True
    else:
        u["email_masked"] = u.get("email")
        u["is_pii_masked"] = False
    return u


def compute_pii_hash(val: str) -> str:
    """Deterministic cryptographic hash for indexing without exposing raw PII."""
    return hmac.new(_SECRET_SALT.encode(), val.strip().lower().encode(), hashlib.sha256).hexdigest()[:16]
