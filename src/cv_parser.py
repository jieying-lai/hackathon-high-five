"""Local PDF CV extraction with reviewable source evidence.

This is a deterministic parser and skill taxonomy, not a trained AI model. PDF
text is treated as data; it is never executed or sent to an external service.
An extracted skill is a mention, not independent verification of proficiency.
"""

import io
import re

from pypdf import PdfReader

from skills_taxonomy import _PATTERNS, expand_for_matching, extract_skills, analyze_resume_competencies_and_impact

MAX_PDF_BYTES = 8 * 1024 * 1024
MAX_PDF_PAGES = 20
MAX_TEXT_CHARS = 100_000
MAX_PAGE_STREAM_BYTES = 2 * 1024 * 1024
EXTRACTION_METHOD = "Local PDF text extraction + rules and skill taxonomy (no external model)"
SKILL_PATTERNS = {name: pattern for name, pattern, _ in _PATTERNS}

EMAIL_RX = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RX = re.compile(r"(?<!\w)\+?\d[\d ()-]{6,20}\d(?!\w)")
BULLET_RX = re.compile(r"^\s*(?:[-•*·‣▪]|\d+[.)])\s+")
SECTION_HEADERS = {
    "summary": r"executive summary|professional summary|personal profile|profile|summary|objective|about me",
    "experience": r"work experience|professional experience|employment history|experience|career history|employment",
    "education": r"education|academic background|qualifications|academic qualifications|education and qualifications",
    "projects": r"key projects|projects|academic projects|selected projects|portfolio",
    "skills": r"technical skills|core skills|skills|competencies|tools\s*&\s*technologies|skills and competencies",
    "certifications": r"certifications?|licen[cs]es?\s*(?:&|and)\s*certifications?|awards?|training",
    "other": r"languages?|interests?|hobbies|references?|publications?|volunteering|volunteer experience|personal details",
}
HEADER_PATTERNS = {
    name: re.compile(r"^(?:" + pattern + r")\s*(?::\s*(.*))?$", re.I)
    for name, pattern in SECTION_HEADERS.items()
}


def _evidence(source="missing", page=None, quote=""):
    return {"source": source, "page": page, "quote": quote[:600]}


def _from_record(record, source="pdf"):
    return _evidence(source, record["page"], record["text"])


def _section_items(records):
    """Join wrapped bullet lines without inventing missing section content."""
    items = []
    for record in records:
        text = record["text"]
        starts_item = bool(BULLET_RX.match(text))
        clean = BULLET_RX.sub("", text).strip()
        if not clean:
            continue
        # A new title/date row is usually the next unbulleted employment entry.
        starts_item = starts_item or ("|" in text and len(text) < 180)
        if not items or starts_item:
            items.append(clean)
        else:
            items[-1] += " " + clean
    return items


def _split_sections(page_texts):
    sections = {name: [] for name in ("header", *SECTION_HEADERS)}
    all_records = []
    current = "header"
    for page_no, text in enumerate(page_texts, start=1):
        for line in text.splitlines():
            line = re.sub(r"\s+", " ", line).strip()
            if not line:
                continue
            record = {"page": page_no, "text": line}
            all_records.append(record)
            for section, pattern in HEADER_PATTERNS.items():
                match = pattern.fullmatch(line)
                if match:
                    current = section
                    if match.group(1):
                        sections[current].append({"page": page_no, "text": match.group(1).strip()})
                    break
            else:
                sections[current].append(record)
    return sections, all_records


def _safe_account_value(value):
    return value.strip()[:250] if isinstance(value, str) else ""


def review_analytics(raw_text, fields):
    """Keep the existing wording panel without presenting heuristics as abilities."""
    analysis = analyze_resume_competencies_and_impact(raw_text)
    analysis["method"] = "Local keyword and wording heuristics"
    analysis["disclaimer"] = "Wording signals for your review, not verified ability, hiring suitability or model confidence."
    for pillar in analysis.get("competencies", []):
        hits = len(pillar.get("matched_verbs", []))
        pillar["score_pct"] = min(100, hits * 20)
        if not hits:
            pillar["evidence"] = "No matching wording found."
    pillars = analysis.get("competencies", [])
    analysis["competency_score"] = round(sum(p["score_pct"] for p in pillars) / len(pillars)) if pillars else 0
    impact = analysis.get("measurable_impact", {})
    impact["impact_score"] = min(100, 5 * len(impact.get("strong_action_verbs", [])) + 7 * len(impact.get("metrics_found", [])))
    # A guessed domain and default academic major are not extracted facts.
    analysis["predicted_profile"] = {"domain": fields.get("current_role") or "Not specified", "confidence_pct": None}
    education = " ".join(fields.get("education_history", [])).lower()
    major = analysis.get("academic_major", {}).get("major") or ""
    if not major or major.lower() not in education:
        analysis["academic_major"] = {"major": "Not specified", "category": ""}
    analysis["lexicon_skills_extracted"] = [
        skill for skill in analysis.get("lexicon_skills_extracted", [])
        if any(re.search(r"(?<!\w)" + re.escape(skill) + r"(?!\w)", item["quote"], re.I)
               for item in fields.get("skill_evidence", []))
    ]
    return analysis


def _positive_mention(skill, text):
    """Avoid using clear negations/learning goals as existing skills for matching.

    This is intentionally conservative and still requires owner review. It is
    not a linguistic model or a claim to verify the person's competence.
    """
    pattern = SKILL_PATTERNS.get("Python" if skill == "Python Data Analysis" else skill)
    if not pattern:
        # A composite category is kept only when a single line supports it.
        return skill in extract_skills(text)
    for match in pattern.finditer(text):
        prefix = re.split(r"[.;!?]|\bbut\b|\bhowever\b", text[:match.start()], flags=re.I)[-1]
        blocked = re.search(
            r"\b(?:(?:no|without)\s+(?:(?:prior|professional|practical|working)\s+)?"
            r"(?:experience|knowledge|skills?|proficiency|exposure)\b|"
            r"not\s+(?:familiar|experienced|proficient)\b|never\s+(?:used|learned|learnt)\b|"
            r"(?:learning|studying|exploring|upskilling in|interested in|transitioning toward)\b|"
            r"(?:plan|want|hoping)\s+to\s+(?:learn|study|use)\b|no\s*$)",
            prefix, re.I,
        )
        suffix = text[match.end():]
        denied_after = re.match(r"\s*(?:(?:experience|knowledge|proficiency)\s*)?:\s*(?:none|no)\b", suffix, re.I)
        if not blocked and not denied_after:
            return True
    return False


def parse_and_summarize_pdf_cv(pdf_bytes: bytes, filename: str,
                               user_context: dict | None = None) -> tuple[bool, str, dict | None]:
    """Keep the existing API shape while producing a source-grounded draft."""
    if not isinstance(filename, str) or not filename.lower().endswith(".pdf"):
        return False, "Only PDF files (.pdf) are accepted. Export your CV as a PDF and try again.", None
    if not isinstance(pdf_bytes, (bytes, bytearray)) or len(pdf_bytes) < 64:
        return False, "The uploaded PDF is empty or incomplete. Export it again and retry.", None
    if len(pdf_bytes) > MAX_PDF_BYTES:
        return False, "PDF file exceeds the 8 MB maximum size limit.", None
    if not pdf_bytes.lstrip().startswith(b"%PDF-"):
        return False, "This file is not a valid PDF. Renaming a file to .pdf does not convert it.", None

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        if reader.is_encrypted:
            return False, "This PDF is password-protected or encrypted. Upload an unencrypted copy that you are authorised to use.", None
        page_count = len(reader.pages)
        if page_count < 1:
            return False, "The PDF document contains no pages.", None
        if page_count > MAX_PDF_PAGES:
            return False, "PDF CVs can contain at most 20 pages. Upload a shorter version.", None
        page_texts = []
        text_length = 0
        for page in reader.pages:
            # Bound decoded content and extracted text as well as uploaded bytes.
            # Production deployments should also isolate parsing with CPU/memory limits.
            contents = page.get_contents()
            if contents is not None and len(contents.get_data()) > MAX_PAGE_STREAM_BYTES:
                return False, "This PDF contains an unusually large page. Export a simplified text PDF and retry.", None
            text = (page.extract_text() or "").replace("\x00", "").replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"').strip()
            text_length += len(text) + 1
            if text_length > MAX_TEXT_CHARS:
                return False, "This PDF contains too much text to process safely. Upload a shorter CV (maximum 100,000 characters).", None
            page_texts.append(text)
    except Exception:
        return False, "The PDF is damaged, malformed, or uses an unsupported format. Open it in a PDF reader and export a fresh text PDF.", None

    raw_text = "\n".join(page_texts).strip()
    if len(re.sub(r"\s", "", raw_text)) < 25:
        return False, "This PDF has too little selectable text and may be a scan. Use OCR or export a text-based PDF; automatic OCR is not available here.", None

    user_context = user_context if isinstance(user_context, dict) else {}
    role_details = user_context.get("role_details")
    role_details = role_details if isinstance(role_details, dict) else {}
    sections, records = _split_sections(page_texts)
    header = sections["header"]
    warnings = [
        "Review every field before confirming or sharing. Local rules can misread columns, dates, names and section boundaries.",
        "Skills are mentions in the PDF, not verified proficiency. Taxonomy labels can group related tools; check each source quote.",
    ]
    blank_pages = [str(i) for i, text in enumerate(page_texts, 1) if len(text.strip()) < 10]
    if blank_pages:
        warnings.append("Little or no text was found on page(s) " + ", ".join(blank_pages) + "; image content on those pages was not extracted.")

    fields = {key: "" for key in (
        "full_name", "email", "phone", "location", "industry", "current_role",
        "seeker_type", "education_level", "work_mode_preference", "executive_summary",
    )}
    fields["years_experience"] = None
    evidence = {key: _evidence() for key in fields}

    def set_field(key, value, record, source="pdf"):
        fields[key] = value
        evidence[key] = _from_record(record, source)

    def find_label(key, pattern, candidates=None):
        for record in records if candidates is None else candidates:
            match = re.search(pattern, record["text"], re.I)
            if match and match.group(1).strip():
                set_field(key, match.group(1).strip(), record)
                return True
        return False

    find_label("full_name", r"(?:^|\|)\s*(?:full name|name)\s*:\s*([^|]+)", header)
    if not fields["full_name"] and header:
        first = header[0]
        name = first["text"]
        words = name.split()
        if (2 <= len(words) <= 6 and len(name) <= 70
                and not re.search(r"[\d@:|/]|\bcurriculum\b|\bresume\b|\bcv\b|\bdeveloper\b|\bengineer\b", name, re.I)):
            set_field("full_name", name, first, "inferred")

    # Contact details come from the header when available, avoiding references' details.
    for record in header or records[:8]:
        match = EMAIL_RX.search(record["text"])
        if match and not fields["email"]:
            set_field("email", match.group(0), record)
        phone_text = record["text"]
        labelled = re.search(r"(?:phone|mobile|tel(?:ephone)?)\s*:\s*([^|]+)", phone_text, re.I)
        for match in PHONE_RX.finditer(labelled.group(1) if labelled else phone_text):
            number = match.group(0).strip()
            digits = re.sub(r"\D", "", number)
            if 8 <= len(digits) <= 15 and not re.fullmatch(r"\d{4}\s*[-–]\s*\d{4}", number):
                if not fields["phone"]:
                    set_field("phone", number, record)
                break

    find_label("location", r"(?:^|\|)\s*(?:location|based in|address)\s*:\s*([^|]+)", header)
    if fields["location"]:
        # Strip a separate work-mode annotation, but never guess a city/country.
        fields["location"] = re.sub(r"\s*\((?:hybrid|remote|on[ -]?site)\)\s*$", "", fields["location"], flags=re.I).strip()
    find_label("current_role", r"(?:^|\|)\s*(?:current role|job title|role)\s*:\s*([^|]+)", header)
    if not fields["current_role"]:
        for record in header[1:4]:
            title = record["text"].split("|")[0].strip()
            if (3 <= len(title) <= 80 and not re.search(r"[@:\d]", title)
                    and re.search(r"\b(?:developer|engineer|auditor|analyst|designer|manager|copywriter|specialist|consultant|accountant|intern|student|graduate|director|officer|coordinator|assistant|researcher)\b", title, re.I)):
                set_field("current_role", title, record, "inferred")
                break

    find_label("industry", r"(?:^|\|)\s*(?:industry|sector)\s*:\s*([^|]+)", header)
    if not fields["industry"]:
        # Recognise an explicitly listed demo/UI sector, not a sector guessed from skills.
        for record in header:
            for piece in record["text"].split("|"):
                if piece.strip() in ("Finance & Accounting", "IT & Software", "Marketing & PR", "HR & Administration"):
                    set_field("industry", piece.strip(), record)

    find_label("work_mode_preference", r"(?:^|\|)\s*(?:preferred (?:work )?(?:mode|arrangement)|work mode(?: preference)?)\s*:\s*(remote|hybrid|on[ -]?site)\b", header)
    if not fields["work_mode_preference"]:
        for record in header:
            match = re.search(r"\((hybrid|remote|on[ -]?site)\)\s*(?:$|\|)", record["text"], re.I)
            if match:
                set_field("work_mode_preference", match.group(1).title(), record, "inferred")
                break

    years_found = []
    years_rx = re.compile(r"\b(\d{1,2})(?:\+)?\s*(?:years?|yrs?)(?:['’])?\s+(?:of\s+)?(?:(?:professional|relevant|work|industry|agency)\s+)?experience\b|\b(?:total\s+)?(?:years?\s+of\s+)?experience\s*:\s*(\d{1,2})(?:\+)?\s*(?:years?|yrs?)\b", re.I)
    for record in header + sections["summary"]:
        for match in years_rx.finditer(record["text"]):
            years = int(match.group(1) or match.group(2))
            if 0 <= years <= 60:
                years_found.append((years, record))
    if len({years for years, _ in years_found}) == 1:
        set_field("years_experience", years_found[0][0], years_found[0][1])
    elif years_found:
        warnings.append("Conflicting experience totals were found. Enter the correct total yourself; overlapping jobs and study time are not added automatically.")

    for record in header + sections["summary"]:
        match = re.search(r"\b(fresh graduate|career changer|experienced worker)\b", record["text"], re.I)
        if match:
            set_field("seeker_type", match.group(1).title(), record)
            break

    for label, pattern in (
        ("Doctor", r"\b(?:ph\.?d\.?|doctorate|doctor of)\b"),
        ("Master's / Postgraduate", r"\b(?:master(?:'s)?|mba|m\.?sc|postgraduate)\b"),
        ("Bachelor's Degree", r"\b(?:bachelor(?:'s)?|b\.?sc|b\.?eng|b\.?acc|b\.?comm)\b"),
        ("Diploma / TVET", r"\b(?:diploma|tvet)\b"),
        ("SPM / UEC", r"\b(?:spm|uec)\b"),
    ):
        matching = next((r for r in sections["education"] if re.search(pattern, r["text"], re.I)), None)
        if matching:
            set_field("education_level", label, matching, "inferred")
            break

    for key, value in {
        "full_name": user_context.get("full_name"), "email": user_context.get("email"),
        "location": role_details.get("location"), "industry": role_details.get("industry"),
        "current_role": role_details.get("current_role"),
        "work_mode_preference": role_details.get("preferred_work_mode"),
    }.items():
        value = _safe_account_value(value)
        if not fields[key] and value:
            fields[key] = value
            evidence[key] = _evidence("account", None, value)

    skills = extract_skills(raw_text)
    skill_evidence = []
    excluded_mentions = []
    for skill in skills:
        found = next((r for r in records if skill in extract_skills(r["text"]) and _positive_mention(skill, r["text"])), None)
        if found:
            skill_evidence.append({"skill": skill, "page": found["page"], "quote": found["text"][:600], "status": "mentioned"})
        else:
            excluded_mentions.append(skill)
    # Keep only labels with a locatable source; don't invent proficiency or a portfolio.
    skills = [item["skill"] for item in skill_evidence]
    if sections["skills"]:
        for record in sections["skills"]:
            for token in re.split(r"[,•|;]", record["text"]):
                token = token.strip(" -*·")
                if 2 <= len(token) <= 60 and token not in skills and not extract_skills(token):
                    skills.append(token)
                    skill_evidence.append({"skill": token, "page": record["page"], "quote": record["text"][:600], "status": "mentioned"})
    if excluded_mentions:
        warnings.append("Some taxonomy matches were omitted because a source line did not support a current skill mention (for example, a learning goal or negation): " + ", ".join(excluded_mentions) + ". Add them yourself if appropriate.")

    for key, section in (("work_experience", "experience"), ("education_history", "education"),
                         ("projects", "projects"), ("certifications", "certifications")):
        fields[key] = _section_items(sections[section])
        evidence[key] = _from_record(sections[section][0]) if sections[section] else _evidence()
    if sections["summary"]:
        summary = " ".join(record["text"] for record in sections["summary"])
        fields["executive_summary"] = summary[:1800]
        evidence["executive_summary"] = _from_record(sections["summary"][0])
        if len(summary) > 1800:
            warnings.append("The source summary exceeds 1,800 characters; this editable draft shows the beginning only.")
    elif skills:
        fields["executive_summary"] = "The CV mentions " + ", ".join(skills[:8]) + ". Review the source evidence and add your own professional summary."
        first = skill_evidence[0]
        evidence["executive_summary"] = _evidence("inferred", first["page"], first["quote"])

    missing = [key.replace("_", " ") for key in ("current_role", "years_experience", "location", "education_level") if fields[key] in ("", None)]
    if missing:
        warnings.append("Not confidently identified: " + ", ".join(missing) + ". These fields are left blank for your review.")
    if not sections["experience"] or not sections["education"]:
        warnings.append("Some usual section headings were not recognised. Compare the draft with your original PDF and add any missing entries.")
    fields.update({
        "skills": skills,
        "expanded_skills": expand_for_matching(skills),
        "skill_evidence": skill_evidence,
        "field_evidence": evidence,
        "review_warnings": warnings,
        "extraction_method": EXTRACTION_METHOD,
        "review_status": "needs_review",
        "ai_highlights": (["Listed role: " + fields["current_role"]] if fields["current_role"] else [])
                         + (["Skill mentions: " + ", ".join(skills[:8])] if skills else []),
        "page_count": page_count,
        "char_count": len(raw_text),
        "privacy_notice": "Processed locally without sending your PDF to an external AI service. Review your draft and choose exactly what to share with each application.",
    })
    evidence["skills"] = _evidence("pdf", skill_evidence[0]["page"], skill_evidence[0]["quote"]) if skill_evidence else _evidence()
    fields["parser_analytics"] = review_analytics(raw_text, fields)
    from candidate_comparison import structured_dimensions
    fields.update(structured_dimensions(fields))
    fields["experience_known"] = fields["years_experience"] is not None
    return True, "PDF extracted locally. Review and confirm the organised draft before sharing.", {
        "page_count": page_count, "raw_text": raw_text, "structured_cv": fields,
    }
