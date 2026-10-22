"""AI verification question generation and candidate response evaluation.

Supports 3 tiers:
1. Gemini Cloud LLM (dynamic scenario-based prompt generation with temperature sampling)
2. Local fine-tuned LoRA model (Qwen2.5 interview adapter on port 8766)
3. Domain-aware dynamic scenario pool (industry-tailored, multi-template randomized generation)
"""

import json
import os
import random
import re
from pathlib import Path
import requests

from chatbot_engine import _get_gemini_key

DOMAIN_SCENARIO_POOLS = {
    "finance": {
        "problem_solving": [
            "In your role as a {role}, imagine you discover a material discrepancy between general ledger accounts and physical inventory during month-end closing with only 24 hours before the audit committee deadline. What systematic steps would you take to investigate and reconcile it?",
            "During an internal audit of high-value procurement contracts, you notice sequential invoices just below the authorized approval threshold. How would you investigate this potential circumvention of internal controls?",
            "Suppose your financial forecasts for an ongoing capital expenditure project deviate significantly (+25%) from actual variance reports. How do you re-estimate future burn rates while managing stakeholder expectations?",
            "You identify that a business unit has been recognizing software revenue prematurely before contract delivery milestones. Walk us through how you would address this with both the department head and external auditors."
        ],
        "technical_competency": [
            "Given your proficiency with {skills}, how do you design automated audit testing scripts or reconciliation models to detect duplicate payments or abnormal transactions across 100,000+ records?",
            "Explain how you apply Malaysian Financial Reporting Standards (MFRS / IFRS) or GAAP when evaluating lease classifications or asset impairments under market volatility.",
            "Describe how you utilize {skills} to perform variance analysis and stress-testing on working capital requirements for multi-entity consolidations.",
            "How do you configure and validate three-way matching (PO, goods receipt, vendor invoice) when troubleshooting an ERP integration?"
        ],
        "domain_ethics": [
            "A senior executive asks you to defer booking an accrued liability of RM 150,000 to the next quarter so the department meets its KPI bonus. How do you handle this professionally and ethically?",
            "How do you safeguard non-public sensitive financial records and customer transaction data against internal unauthorized access under the Malaysian Personal Data Protection Act (PDPA)?",
            "When faced with incomplete documentation from an overseas affiliate under audit, what standards of professional skepticism and evidence threshold do you uphold before issuing an opinion?"
        ]
    },
    "tech": {
        "problem_solving": [
            "In a real-world system for a {role}, your production service experiences an unexpected spike in p99 latency during peak traffic, triggering cascade timeouts. Walk us through your triage, mitigation, and post-mortem process.",
            "As a {role}, you are tasked with migrating a mission-critical database with zero downtime, but a schema migration script locks several high-volume tables. How do you resolve the immediate incident and redesign the deployment?",
            "As a {role}, a third-party API that your core checkout or user verification service relies on suddenly starts returning intermittent 502 errors. How do you design resilience and graceful degradation into your architecture?",
            "When dealing with conflicting requirements between strict data consistency and low-latency response times for a {role} feature, how do you evaluate and implement the appropriate architectural trade-offs?"
        ],
        "technical_competency": [
            "Drawing on your experience with {skills}, how do you structure high-throughput, maintainable code while ensuring comprehensive unit, integration, and contract test coverage?",
            "Describe a scenario where you diagnosed a memory leak, race condition, or CPU bottleneck in a distributed environment utilizing {skills}.",
            "Drawing on your background with {skills}, how do you implement secure authentication, API rate limiting, and defensive input validation when exposing public microservices?",
            "Walk us through how you leverage {skills} to architect asynchronous job queues and ensure idempotent message processing across worker nodes."
        ],
        "domain_ethics": [
            "In your capacity as a {role}, a product manager asks you to log unmasked user passwords or payment tokens temporarily in debug logs to troubleshoot an urgent user issue. How do you respond and propose a compliant alternative?",
            "As a {role}, how do you protect candidate or customer Personally Identifiable Information (PII) against unauthorized exposure or model extraction in AI-driven pipelines under PDPA?",
            "As a {role}, you uncover a severe, unpatched security vulnerability in a legacy microservice that could take 2 weeks to fix properly. Management wants to proceed with the public release. How do you escalate and resolve this?"
        ]
    },
    "data": {
        "problem_solving": [
            "As a {role}, you observe severe model drift or distribution shifts in production where model prediction accuracy drops by 18% over two weeks. How do you detect root causes and orchestrate a retraining loop?",
            "Your automated ETL data pipeline fails midway through a 50GB ingestion run due to schema mismatch from an upstream source. How do you ensure data pipeline idempotency and prevent partial writes?",
            "Business stakeholders report that your dashboard metrics contradict the monthly revenue reports from accounting. How do you audit upstream data lineage and restore reporting integrity?"
        ],
        "technical_competency": [
            "How do you leverage {skills} to optimize heavy SQL queries or distributed Spark transformations that run out of memory on large datasets?",
            "Describe your methodology for feature engineering, handling skewed target distributions, and selecting cross-validation strategies using {skills}.",
            "How do you containerize, benchmark, and deploy low-latency inference endpoints with monitoring for latency, drift, and throughput?"
        ],
        "domain_ethics": [
            "An algorithmic ranking or screening model demonstrates demographic disparity or disparate impact. How do you measure fairness metrics and debias training data?",
            "What protocols do you enforce for data governance, anonymization, and role-based data access when building business intelligence data marts?",
            "When business stakeholders pressure you to cherry-pick evaluation windows to report a higher ROI on an ML initiative, how do you uphold scientific and professional honesty?"
        ]
    },
    "general": {
        "problem_solving": [
            "In a fast-paced environment for a {role}, two key project stakeholders provide conflicting priorities with tight deadlines. How do you negotiate expectations and deliver value on schedule?",
            "Describe a complex initiative in your career where an unexpected roadblock jeopardized deliverables. What root cause analysis and corrective actions did you lead?",
            "When taking ownership of an inherited project with minimal documentation and technical debt, how do you prioritize short-term fixes versus long-term sustainability?"
        ],
        "technical_competency": [
            "Demonstrating your capability in {skills}, describe how you establish quality benchmarks and streamline workflows in your daily deliverables.",
            "What automated tools, frameworks, or best practices within {skills} do you rely on to maintain high execution standards under tight turnarounds?",
            "Describe a tangible workflow optimization you designed using {skills} that produced measurable time savings or cost reductions for your team."
        ],
        "domain_ethics": [
            "How do you ensure data integrity, client confidentiality, and adherence to industry compliance standards when handling proprietary information?",
            "Describe how you handle constructive disagreement within a cross-functional team to maintain professional trust and collective accountability.",
            "What personal standards do you maintain to ensure your deliverables are transparent, verifiable, and free from misleading claims or shortcuts?"
        ]
    }
}


def _classify_role(role_name: str) -> str:
    r = (role_name or "").lower()
    if any(k in r for k in ["audit", "account", "financ", "tax", "banking", "treasury"]):
        return "finance"
    if any(k in r for k in ["software", "developer", "engineer", "devops", "cloud", "frontend", "backend", "full stack"]):
        return "tech"
    if any(k in r for k in ["data", "machine learning", "ai", "analytics", "bi ", "statistic"]):
        return "data"
    return "general"


def _format_skills(skills: list) -> str:
    if not skills:
        return "relevant core technical skills"
    valid = [str(s).strip() for s in skills if str(s).strip()]
    if not valid:
        return "relevant core technical skills"
    if len(valid) == 1:
        return valid[0]
    if len(valid) == 2:
        return f"{valid[0]} and {valid[1]}"
    return f"{', '.join(valid[:3])}, and {valid[3] if len(valid) > 3 else valid[-1]}"


def _generate_dynamic_fallback(role: str, skills: list) -> list:
    domain = _classify_role(role)
    pool = DOMAIN_SCENARIO_POOLS.get(domain, DOMAIN_SCENARIO_POOLS["general"])
    general_pool = DOMAIN_SCENARIO_POOLS["general"]

    skills_str = _format_skills(skills)

    q1_templates = pool.get("problem_solving", []) or general_pool.get("problem_solving", [])
    q2_templates = pool.get("technical_competency", []) or general_pool.get("technical_competency", [])
    q3_templates = pool.get("domain_ethics", []) or general_pool.get("domain_ethics", [])

    q1_raw = random.choice(q1_templates)
    q2_raw = random.choice(q2_templates)
    q3_raw = random.choice(q3_templates)

    q1_text = q1_raw.format(role=role, skills=skills_str)
    q2_text = q2_raw.format(role=role, skills=skills_str)
    q3_text = q3_raw.format(role=role, skills=skills_str)

    return [
        {
            "id": "q1",
            "category": "Practical Problem Solving",
            "difficulty": "Intermediate",
            "question_text": q1_text
        },
        {
            "id": "q2",
            "category": "Technical Competency",
            "difficulty": "Advanced",
            "question_text": q2_text
        },
        {
            "id": "q3",
            "category": "Domain & Ethics Standard",
            "difficulty": "Scenario-Based",
            "question_text": q3_text
        }
    ]


def generate_verification_questions(target_role: str, skills: list, cv_data: dict = None) -> tuple[list, str]:
    """Generates 3 targeted verification questions using Gemini, Local LoRA, or Dynamic Pool."""
    role = (target_role or "").strip() or "Professional"
    skills_list = [s for s in skills if isinstance(s, str) and s.strip()] if skills else []

    cv_data = cv_data or {}
    structured = cv_data.get("structured_cv") or {}
    if not skills_list:
        skills_list = (structured.get("skills") or [])[:6]

    projects = structured.get("projects") or []
    summary = structured.get("summary") or ""

    # Tier 1: Try Gemini LLM
    gemini_key, gemini_model = _get_gemini_key()
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
            prompt = (
                f"You are an expert technical interviewer and competency assessment AI for CareerLens AI.\n"
                f"Generate exactly 3 fresh, realistic scenario-based verification interview questions for this candidate.\n\n"
                f"Target Role: {role}\n"
                f"Core Skills: {', '.join(skills_list[:8]) if skills_list else 'Standard domain skills'}\n"
                f"Candidate Background Summary: {summary[:300] if summary else 'Experienced professional'}\n"
                f"Key Projects: {json.dumps(projects[:2], ensure_ascii=False) if projects else 'N/A'}\n\n"
                f"Requirements for the 3 questions:\n"
                f"1. Question 1 (Category: 'Practical Problem Solving', Difficulty: 'Intermediate'): A realistic dilemma, unexpected production/business roadblock, or urgent crisis in {role}.\n"
                f"2. Question 2 (Category: 'Technical Competency', Difficulty: 'Advanced'): Deep, practical scenario probing hands-on technical skills or architecture in {skills_list[:3] if skills_list else role}.\n"
                f"3. Question 3 (Category: 'Domain & Ethics Standard', Difficulty: 'Scenario-Based'): Governance, regulatory compliance, data privacy (e.g. PDPA), or professional accountability scenario.\n\n"
                f"Respond ONLY with a valid JSON object matching this schema:\n"
                f"{{\n"
                f'  "questions": [\n'
                f'    {{"id": "q1", "category": "Practical Problem Solving", "difficulty": "Intermediate", "question_text": "..."}},\n'
                f'    {{"id": "q2", "category": "Technical Competency", "difficulty": "Advanced", "question_text": "..."}},\n'
                f'    {{"id": "q3", "category": "Domain & Ethics Standard", "difficulty": "Scenario-Based", "question_text": "..."}}\n'
                f'  ]\n'
                f"}}"
            )
            resp = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.85,
                        "maxOutputTokens": 1024
                    }
                },
                timeout=(3, 12)
            )
            if resp.ok:
                data = resp.json()
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                text = "".join(p.get("text", "") for p in parts)
                parsed = json.loads(text)
                qs = parsed.get("questions", [])
                if len(qs) == 3 and all(q.get("question_text") for q in qs):
                    for idx, q in enumerate(qs):
                        q["id"] = f"q{idx + 1}"
                    return qs, f"Gemini Cloud AI ({gemini_model})"
        except Exception:
            pass

    # Tier 2: Try Local LoRA Model Runtime
    local_url = os.getenv("HR_INTERVIEW_MODEL_URL") or "http://127.0.0.1:8766/generate"
    try:
        resp = requests.post(
            local_url,
            json={
                "prompt": f"Write 3 scenario interview questions for a {role} specializing in {', '.join(skills_list[:5])}",
                "role": role,
                "skills": skills_list,
                "question_count": 3
            },
            timeout=(2, 5)
        )
        if resp.ok:
            data = resp.json()
            raw_qs = data.get("questions", [])
            if len(raw_qs) >= 3:
                cats = [
                    ("Practical Problem Solving", "Intermediate"),
                    ("Technical Competency", "Advanced"),
                    ("Domain & Ethics Standard", "Scenario-Based")
                ]
                formatted = []
                for idx, text in enumerate(raw_qs[:3]):
                    cat, diff = cats[idx]
                    formatted.append({
                        "id": f"q{idx + 1}",
                        "category": cat,
                        "difficulty": diff,
                        "question_text": str(text).strip()
                    })
                return formatted, "Local Fine-Tuned Model (Qwen2.5-1.5B Adapter)"
    except Exception:
        pass

    # Tier 3: Dynamic Domain-Aware Fallback Pool (Always succeeds & randomizes)
    questions = _generate_dynamic_fallback(role, skills_list)
    return questions, "Domain Scenario Engine (Dynamic Randomized)"


def evaluate_verification_answers(answers: list, role: str = "", skills: list = None) -> dict:
    """Evaluates candidate answers with depth analysis, technical coverage, and constructive feedback."""
    if not answers:
        return {
            "verification_score": 60,
            "answered_count": 0,
            "feedback": "No answers provided. Complete the scenario verification questions to boost your profile score.",
            "competency_breakdown": {
                "problem_solving": 50,
                "technical_depth": 50,
                "ethics_compliance": 50
            }
        }

    total_words = 0
    valid_answers = 0
    scores_per_category = []

    for item in answers:
        txt = (item.get("answer") or "").strip()
        words = len(txt.split())
        total_words += words
        if len(txt) > 10:
            valid_answers += 1
            # Depth score: 70 base + bonus for explanation depth & technical keywords
            score = 70 + min(22, words // 3)
            # Bonus if candidate touches on specific technologies or professional processes
            if re.search(r"\b(because|specifically|trade-off|mitigate|verified|workflow|architecture|standard|framework|protocol)\b", txt, re.IGNORECASE):
                score += 5
            scores_per_category.append(min(98, score))
        else:
            scores_per_category.append(50)

    avg_score = int(sum(scores_per_category) / max(1, len(scores_per_category)))
    final_score = max(60, min(98, avg_score))

    feedback_points = []
    if valid_answers == 3:
        feedback_points.append("Excellent completion: all 3 verification scenarios addressed.")
        if total_words > 120:
            feedback_points.append("Strong descriptive depth and clear articulation of real-world trade-offs.")
        else:
            feedback_points.append("Good concise answers; consider adding more quantitative metrics or technical specifics.")
    elif valid_answers > 0:
        feedback_points.append(f"Completed {valid_answers} of 3 questions. Answering all questions unlocks the full verification badge.")
    else:
        feedback_points.append("Please provide detailed responses to verify your domain competencies.")

    return {
        "verification_score": final_score,
        "answered_count": valid_answers,
        "feedback": " ".join(feedback_points),
        "competency_breakdown": {
            "problem_solving": scores_per_category[0] if len(scores_per_category) > 0 else 60,
            "technical_depth": scores_per_category[1] if len(scores_per_category) > 1 else 60,
            "ethics_compliance": scores_per_category[2] if len(scores_per_category) > 2 else 60
        }
    }
