"""Train Lumi AI's Unified Multi-Dataset Knowledge Base from all 13 datasets in C:\\Users\\April\\Downloads\\dataset.

Outputs:
  src/data/lumi_trained_brain.json.gz

Datasets integrated:
  1. Entry Level career QA dataset.zip            -> career_qa (Q&A pairs across roles)
  2. Software Engineering Interview Questions.zip -> se_interview_qa (technical interview Q&A + difficulty)
  3. EdX Courses Dataset 2021.zip                 -> edx_courses (real university courses indexed by skill/topic)
  4. AI Impact on Job Market (2024-2030).zip      -> ai_job_forecasts_2030 (automation risk, 2024->2030 growth, remote %)
  5. AI Workforce Displacement 2020-2026.zip      -> ai_displacement_sectors (displaced % vs new roles created %)
  6. Employee Upskilling and Hiring Success.zip   -> upskilling_roi (hiring success rate & salary hike % by AI upskilling)
  7. IBM HR Analytics Employee Attrition.zip      -> ibm_hr_attrition (attrition rates, overtime impact, training times)
  8. Factory Workers Daily Performance.zip        -> factory_workforce_metrics (shift/role efficacy & behavioral benchmarks)
  9. Gender Pay Gap Dataset.zip                   -> pay_equity_benchmarks (fairness & wage equity across occupations)
  10. ONET Database.zip & ONET Occupation Data.zip -> onet_occupations (1,016 occupations, hot tech, emerging tasks, career transitions)
  11. Updated Resume Dataset.zip                  -> resume_category_benchmarks (962 resumes across 25 categories)
  12. Jobstreet Job Postings.zip                  -> linked via jobstreet_index.json.gz (68,447 MY jobs, 20,514 companies)
"""

import collections
import csv
import gzip
import io
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
from skills_taxonomy import extract_skills, extract_extended_lexicon_skills  # noqa: E402

DATASET_DIR = r"C:\Users\April\Downloads\dataset"
OUT_PATH = os.path.join(ROOT, "src", "data", "lumi_trained_brain.json.gz")
csv.field_size_limit(10**9)


def _find_zip(prefix):
    for f in os.listdir(DATASET_DIR):
        if f.lower().startswith(prefix.lower()) and f.endswith(".zip"):
            return os.path.join(DATASET_DIR, f)
    raise FileNotFoundError(prefix)


def _read_csv_from_zip(zip_path, entry_name=None, max_rows=None, delimiter=","):
    with zipfile.ZipFile(zip_path, "r") as zf:
        if not entry_name:
            entry_name = [n for n in zf.namelist() if not n.endswith("/")][0]
        with zf.open(entry_name) as ef:
            text_stream = io.TextIOWrapper(ef, encoding="utf-8-sig", errors="replace", newline="")
            reader = csv.DictReader(text_stream, delimiter=delimiter)
            rows = []
            for i, r in enumerate(reader):
                rows.append(r)
                if max_rows and i + 1 >= max_rows:
                    break
            return rows


def main():
    brain = {"datasets_trained": [], "stats": {}}

    # ------------------------------------------------------------------
    # 1. Entry Level Career QA Dataset
    # ------------------------------------------------------------------
    z1 = _find_zip("Entry Level career QA")
    rows1 = _read_csv_from_zip(z1)
    career_qa = []
    seen_qa = set()
    for r in rows1:
        role = (r.get("role") or "").strip()
        q = (r.get("question") or "").strip()
        a = (r.get("answer") or "").strip()
        key = (role.lower(), q.lower()[:80])
        if role and q and a and key not in seen_qa:
            seen_qa.add(key)
            career_qa.append({"role": role, "q": q[:180], "a": a[:320]})
    brain["career_qa"] = career_qa[:600]
    brain["stats"]["career_qa_pairs"] = len(rows1)
    brain["datasets_trained"].append("Entry Level Career QA Dataset")
    print(f"1. Career QA: {len(rows1)} raw -> {len(brain['career_qa'])} unique Q&A pairs")

    # ------------------------------------------------------------------
    # 2. Software Engineering Interview Questions Dataset
    # ------------------------------------------------------------------
    z2 = _find_zip("Software Engineering Interview")
    rows2 = _read_csv_from_zip(z2)
    se_qa = []
    for r in rows2:
        q = (r.get("Question") or "").strip()
        a = (r.get("Answer") or "").strip()
        cat = (r.get("Category") or "Software Engineering").strip()
        diff = (r.get("Difficulty") or "Medium").strip()
        if q and a:
            se_qa.append({"q": q, "a": a[:340], "category": cat, "difficulty": diff})
    brain["se_interview_qa"] = se_qa
    brain["stats"]["se_interview_questions"] = len(se_qa)
    brain["datasets_trained"].append("Software Engineering Interview Questions Dataset")
    print(f"2. SE Interview QA: {len(se_qa)} questions")

    # ------------------------------------------------------------------
    # 3. EdX Courses Dataset 2021
    # ------------------------------------------------------------------
    z3 = _find_zip("EdX Courses")
    rows3 = _read_csv_from_zip(z3)
    edx_courses = []
    for r in rows3:
        name = (r.get("Name") or "").strip()
        univ = (r.get("University") or "edX").strip()
        diff = (r.get("Difficulty Level") or "Beginner").strip()
        link = (r.get("Link") or "").strip()
        about = (r.get("About") or "").strip()
        desc = (r.get("Course Description") or "").strip()
        if not name:
            continue
        blob = f"{name}. {about}. {desc[:400]}"
        sk = extract_skills(blob) + extract_extended_lexicon_skills(blob, limit=5)
        dedup_sk = list(dict.fromkeys(sk))[:6]
        edx_courses.append({
            "title": name[:110],
            "provider": univ[:60],
            "level": diff,
            "url": link,
            "about": about[:160],
            "skills": dedup_sk,
        })
    brain["edx_courses"] = edx_courses[:800]
    brain["stats"]["edx_courses_total"] = len(rows3)
    brain["datasets_trained"].append("EdX University Courses Dataset (MIT/Harvard/IBM/etc.)")
    print(f"3. EdX Courses: {len(rows3)} courses indexed")

    # ------------------------------------------------------------------
    # 4. AI Impact on Job Market (2024–2030)
    # ------------------------------------------------------------------
    z4 = _find_zip("AI Impact on Job Market")
    rows4 = _read_csv_from_zip(z4)
    role_agg = collections.defaultdict(lambda: {"count": 0, "auto_risk": 0.0, "remote": 0.0, "sal_usd": 0.0,
                                                "open_2024": 0, "open_2030": 0, "inc": 0, "impact": collections.Counter(), "ind": ""})
    ind_agg = collections.defaultdict(lambda: {"count": 0, "auto_risk": 0.0, "remote": 0.0, "open_2024": 0, "open_2030": 0, "inc": 0})
    for r in rows4:
        jt = (r.get("Job Title") or "").strip()
        ind = (r.get("Industry") or "").strip()
        if not jt:
            continue
        try:
            ar = float(r.get("Automation Risk (%)") or 0)
            rm = float(r.get("Remote Work Ratio (%)") or 0)
            sal = float(r.get("Median Salary (USD)") or 0)
            o24 = int(float(r.get("Job Openings (2024)") or 0))
            o30 = int(float(r.get("Projected Openings (2030)") or 0))
        except ValueError:
            continue
        inc = 1 if (r.get("Job Status") or "").strip().lower() == "increasing" else 0
        imp = (r.get("AI Impact Level") or "Moderate").strip()

        d = role_agg[jt]
        d["count"] += 1
        d["auto_risk"] += ar
        d["remote"] += rm
        d["sal_usd"] += sal
        d["open_2024"] += o24
        d["open_2030"] += o30
        d["inc"] += inc
        d["impact"][imp] += 1
        d["ind"] = ind

        ia = ind_agg[ind]
        ia["count"] += 1
        ia["auto_risk"] += ar
        ia["remote"] += rm
        ia["open_2024"] += o24
        ia["open_2030"] += o30
        ia["inc"] += inc

    ai_job_forecasts = {}
    for jt, d in role_agg.items():
        c = max(1, d["count"])
        growth_pct = round(100.0 * (d["open_2030"] - d["open_2024"]) / max(1, d["open_2024"]), 1)
        ai_job_forecasts[jt] = {
            "industry": d["ind"],
            "samples": c,
            "automation_risk_pct": round(d["auto_risk"] / c, 1),
            "remote_ratio_pct": round(d["remote"] / c, 1),
            "median_salary_usd": round(d["sal_usd"] / c),
            "growth_2024_2030_pct": growth_pct,
            "increasing_share_pct": round(100.0 * d["inc"] / c, 1),
            "dominant_ai_impact": d["impact"].most_common(1)[0][0] if d["impact"] else "Moderate",
        }

    ai_industry_forecasts = {}
    for ind, ia in ind_agg.items():
        c = max(1, ia["count"])
        ai_industry_forecasts[ind] = {
            "records": c,
            "avg_automation_risk_pct": round(ia["auto_risk"] / c, 1),
            "avg_remote_ratio_pct": round(ia["remote"] / c, 1),
            "net_openings_growth_pct": round(100.0 * (ia["open_2030"] - ia["open_2024"]) / max(1, ia["open_2024"]), 1),
            "increasing_roles_pct": round(100.0 * ia["inc"] / c, 1),
        }
    brain["ai_job_forecasts_2030"] = ai_job_forecasts
    brain["ai_industry_forecasts_2030"] = ai_industry_forecasts
    brain["stats"]["ai_job_trends_rows"] = len(rows4)
    brain["datasets_trained"].append("AI Impact on Job Market (2024–2030)")
    print(f"4. AI Impact 2024-2030: {len(rows4)} rows -> {len(ai_job_forecasts)} occupations & {len(ai_industry_forecasts)} industries")

    # ------------------------------------------------------------------
    # 5. AI Workforce Displacement 2020–2026
    # ------------------------------------------------------------------
    z5 = _find_zip("AI Workforce Displacement")
    rows5 = _read_csv_from_zip(z5)
    disp_sec = collections.defaultdict(lambda: {"n": 0, "risk": 0.0, "adopt": 0.0, "disp": 0.0, "new": 0.0, "net": 0.0})
    for r in rows5:
        sec = (r.get("industry_sector") or "").strip()
        if not sec:
            continue
        try:
            d = disp_sec[sec]
            d["n"] += 1
            d["risk"] += float(r.get("sector_automation_risk_score") or 0) * 100
            d["adopt"] += float(r.get("ai_adoption_index") or 0) * 100
            d["disp"] += float(r.get("pct_sector_workforce_displaced") or 0)
            d["new"] += float(r.get("pct_sector_workforce_new_roles_created") or 0)
            d["net"] += float(r.get("net_workforce_change_pct") or 0)
        except ValueError:
            continue
    ai_displacement_sectors = {}
    for sec, d in disp_sec.items():
        n = max(1, d["n"])
        ai_displacement_sectors[sec] = {
            "automation_risk_score": round(d["risk"] / n, 1),
            "ai_adoption_index": round(d["adopt"] / n, 1),
            "workforce_displaced_pct": round(d["disp"] / n, 2),
            "new_roles_created_pct": round(d["new"] / n, 2),
            "net_workforce_change_pct": round(d["net"] / n, 2),
        }
    brain["ai_displacement_sectors"] = ai_displacement_sectors
    brain["stats"]["ai_displacement_rows"] = len(rows5)
    brain["datasets_trained"].append("AI Workforce Displacement Global (2020–2026)")
    print(f"5. AI Workforce Displacement: {len(rows5)} rows -> {len(ai_displacement_sectors)} sectors")

    # ------------------------------------------------------------------
    # 6. Employee Upskilling and Hiring Success Dataset
    # ------------------------------------------------------------------
    z6 = _find_zip("Employee Upskilling")
    rows6 = _read_csv_from_zip(z6)
    upskill_by_type = collections.defaultdict(lambda: {"n": 0, "success": 0, "hike": 0.0})
    upskill_by_role = collections.defaultdict(lambda: {"upskilled_n": 0, "upskilled_win": 0, "upskilled_hike": 0.0,
                                                       "no_n": 0, "no_win": 0, "no_hike": 0.0})
    for r in rows6:
        role = (r.get("Job Role") or r.get("Current Job Title") or "Professional").strip()
        utype = (r.get("AI Upskilling Type") or "General AI").strip()
        has_up = str(r.get("AI Upskilling") or "").strip().lower() in ("1", "yes", "true")
        win = 1 if str(r.get("Success in Hiring Process") or "").strip().lower() in ("1", "yes", "true", "hired", "high") else 0
        try:
            hike = float(r.get("Percentage Hike in Salary") or 0)
        except ValueError:
            hike = 0.0
        if has_up and utype and utype.lower() not in ("none", "no", "0", "nan"):
            t = upskill_by_type[utype]
            t["n"] += 1
            t["success"] += win
            t["hike"] += hike
        rb = upskill_by_role[role]
        if has_up:
            rb["upskilled_n"] += 1
            rb["upskilled_win"] += win
            rb["upskilled_hike"] += hike
        else:
            rb["no_n"] += 1
            rb["no_win"] += win
            rb["no_hike"] += hike

    upskilling_roi = {
        "total_records": len(rows6),
        "by_upskilling_type": {
            k: {
                "participants": v["n"],
                "hiring_success_rate_pct": round(100.0 * v["success"] / max(1, v["n"]), 1),
                "avg_salary_hike_pct": round(v["hike"] / max(1, v["n"]), 1),
            }
            for k, v in upskill_by_type.items() if v["n"] >= 3
        },
        "by_role": {
            k: {
                "upskilled_hiring_success_pct": round(100.0 * v["upskilled_win"] / max(1, v["upskilled_n"]), 1),
                "non_upskilled_hiring_success_pct": round(100.0 * v["no_win"] / max(1, v["no_n"]), 1),
                "upskilled_avg_salary_hike_pct": round(v["upskilled_hike"] / max(1, v["upskilled_n"]), 1),
                "non_upskilled_avg_salary_hike_pct": round(v["no_hike"] / max(1, v["no_n"]), 1),
            }
            for k, v in upskill_by_role.items()
        },
    }
    brain["upskilling_roi"] = upskilling_roi
    brain["stats"]["upskilling_rows"] = len(rows6)
    brain["datasets_trained"].append("Employee Upskilling & Hiring Success Dataset")
    print(f"6. Employee Upskilling ROI: {len(rows6)} rows")

    # ------------------------------------------------------------------
    # 7. IBM HR Analytics Employee Attrition & Performance
    # ------------------------------------------------------------------
    z7 = _find_zip("IBM HR Analytics")
    rows7 = _read_csv_from_zip(z7)
    dept_hr = collections.defaultdict(lambda: {"n": 0, "attr": 0, "ot_attr": 0, "ot_n": 0, "train": 0.0, "income": 0.0, "hike": 0.0})
    role_hr = collections.defaultdict(lambda: {"n": 0, "attr": 0, "income": 0.0, "train": 0.0})
    for r in rows7:
        dept = (r.get("Department") or "General").strip()
        jrole = (r.get("JobRole") or "Staff").strip()
        attr = 1 if (r.get("Attrition") or "").strip().lower() == "yes" else 0
        ot = 1 if (r.get("OverTime") or "").strip().lower() == "yes" else 0
        try:
            inc = float(r.get("MonthlyIncome") or 0)
            tr = float(r.get("TrainingTimesLastYear") or 0)
            hk = float(r.get("PercentSalaryHike") or 0)
        except ValueError:
            inc, tr, hk = 0.0, 0.0, 0.0
        d = dept_hr[dept]
        d["n"] += 1
        d["attr"] += attr
        d["ot_n"] += ot
        d["ot_attr"] += (1 if (attr and ot) else 0)
        d["train"] += tr
        d["income"] += inc
        d["hike"] += hk

        rh = role_hr[jrole]
        rh["n"] += 1
        rh["attr"] += attr
        rh["income"] += inc
        rh["train"] += tr

    ibm_hr_benchmarks = {
        "total_employees_analyzed": len(rows7),
        "overall_attrition_rate_pct": round(100.0 * sum(d["attr"] for d in dept_hr.values()) / max(1, len(rows7)), 1),
        "by_department": {
            k: {
                "headcount": d["n"],
                "attrition_rate_pct": round(100.0 * d["attr"] / max(1, d["n"]), 1),
                "overtime_attrition_rate_pct": round(100.0 * d["ot_attr"] / max(1, d["ot_n"]), 1),
                "avg_training_sessions_yr": round(d["train"] / max(1, d["n"]), 2),
                "avg_salary_hike_pct": round(d["hike"] / max(1, d["n"]), 1),
            }
            for k, d in dept_hr.items()
        },
        "by_job_role": {
            k: {
                "headcount": d["n"],
                "attrition_rate_pct": round(100.0 * d["attr"] / max(1, d["n"]), 1),
                "avg_monthly_income": round(d["income"] / max(1, d["n"])),
                "avg_training_sessions_yr": round(d["train"] / max(1, d["n"]), 2),
            }
            for k, d in role_hr.items()
        },
    }
    brain["ibm_hr_attrition"] = ibm_hr_benchmarks
    brain["stats"]["ibm_hr_rows"] = len(rows7)
    brain["datasets_trained"].append("IBM HR Analytics Employee Attrition & Performance")
    print(f"7. IBM HR Attrition: {len(rows7)} employee records")

    # ------------------------------------------------------------------
    # 8. Factory Workers' Daily Performance & Attrition (Sample 25,000 rows for speed)
    # ------------------------------------------------------------------
    z8 = _find_zip("Factory Workers")
    rows8 = _read_csv_from_zip(z8, max_rows=25000)
    fw_roles = collections.defaultdict(lambda: {"n": 0, "eff": 0.0, "comm": 0.0, "dext": 0.0})
    for r in rows8:
        srole = (r.get("sub_role") or "Operator").strip()
        try:
            eff = float(r.get("actual_efficacy_h") or 0)
            comm = float(r.get("sub_commitment_h") or 0)
            dext = float(r.get("sub_dexterity_h") or 0)
        except ValueError:
            continue
        fw = fw_roles[srole]
        fw["n"] += 1
        fw["eff"] += eff
        fw["comm"] += comm
        fw["dext"] += dext
    brain["factory_workforce_metrics"] = {
        "sampled_daily_records": len(rows8),
        "by_role": {
            k: {
                "observations": v["n"],
                "avg_efficacy": round(v["eff"] / max(1, v["n"]), 3),
                "avg_commitment": round(v["comm"] / max(1, v["n"]), 3),
                "avg_dexterity": round(v["dext"] / max(1, v["n"]), 3),
            }
            for k, v in fw_roles.items()
        },
    }
    brain["stats"]["factory_workforce_rows_sampled"] = len(rows8)
    brain["datasets_trained"].append("Factory Workers Daily Performance & Attrition Dataset")
    print(f"8. Factory Workforce Metrics: {len(rows8)} rows analyzed across {len(fw_roles)} roles")

    # ------------------------------------------------------------------
    # 9. Gender Pay Gap Dataset (Sample 25,000 rows from CurrentPopulationSurvey.csv)
    # ------------------------------------------------------------------
    z9 = _find_zip("Gender Pay Gap")
    rows9 = _read_csv_from_zip(z9, entry_name="CurrentPopulationSurvey.csv", max_rows=25000)
    occ_flags = ["manager", "business", "financialop", "computer", "architect", "scientist", "healthcare", "sales", "officeadmin"]
    pay_gap_by_occ = {}
    for occ in occ_flags:
        m_wages, f_wages = [], []
        for r in rows9:
            if str(r.get(occ) or "0").strip() == "1":
                try:
                    w = float(r.get("realhrwage") or r.get("hrwage") or 0)
                except ValueError:
                    continue
                if w <= 0:
                    continue
                if str(r.get("female") or "0").strip() == "1":
                    f_wages.append(w)
                else:
                    m_wages.append(w)
        if m_wages and f_wages:
            m_avg = sum(m_wages) / len(m_wages)
            f_avg = sum(f_wages) / len(f_wages)
            pay_gap_by_occ[occ] = {
                "female_to_male_wage_ratio_pct": round(100.0 * f_avg / max(0.01, m_avg), 1),
                "sample_size": len(m_wages) + len(f_wages),
            }
    brain["pay_equity_benchmarks"] = {
        "records_analyzed": len(rows9),
        "by_occupation_group": pay_gap_by_occ,
        "fairness_policy": "CareerLens AI strips gender, age, race, and marital status from all candidate scoring to prevent historical wage & screening bias.",
    }
    brain["stats"]["pay_equity_rows_sampled"] = len(rows9)
    brain["datasets_trained"].append("Gender Pay Gap & Wage Equity Dataset (CPS/PSID)")
    print(f"9. Pay Equity Benchmarks: {len(rows9)} rows analyzed")

    # ------------------------------------------------------------------
    # 10. O*NET 29.0 Database (Occupations, Hot Tech Skills, Core Skills, Related Occupations, Emerging Tasks)
    # ------------------------------------------------------------------
    z10 = _find_zip("ONET Database")
    occ_rows = _read_csv_from_zip(z10, "db_29_0_text/Occupation Data.txt", delimiter="\t")
    tech_rows = _read_csv_from_zip(z10, "db_29_0_text/Technology Skills.txt", delimiter="\t")
    rel_rows = _read_csv_from_zip(z10, "db_29_0_text/Related Occupations.txt", delimiter="\t")
    emg_rows = _read_csv_from_zip(z10, "db_29_0_text/Emerging Tasks.txt", delimiter="\t")
    sk_rows = _read_csv_from_zip(z10, "db_29_0_text/Skills.txt", delimiter="\t")

    soc_to_title = {}
    onet_occs = {}
    for r in occ_rows:
        code = (r.get("O*NET-SOC Code") or "").strip()
        title = (r.get("Title") or "").strip()
        desc = (r.get("Description") or "").strip()
        if code and title:
            soc_to_title[code] = title
            onet_occs[code] = {
                "code": code,
                "title": title,
                "description": desc[:220],
                "hot_tech": [],
                "core_skills": [],
                "emerging_tasks": [],
                "related_careers": [],
            }

    for r in tech_rows:
        code = (r.get("O*NET-SOC Code") or "").strip()
        if code not in onet_occs:
            continue
        if (r.get("Hot Technology") == "Y" or r.get("In Demand") == "Y"):
            ex = (r.get("Example") or "").strip()
            if ex and ex not in onet_occs[code]["hot_tech"] and len(onet_occs[code]["hot_tech"]) < 10:
                onet_occs[code]["hot_tech"].append(ex)

    # Top importance (IM) skills per O*NET occupation
    sk_by_soc = collections.defaultdict(list)
    for r in sk_rows:
        if r.get("Scale ID") == "IM":
            code = (r.get("O*NET-SOC Code") or "").strip()
            name = (r.get("Element Name") or "").strip()
            try:
                val = float(r.get("Data Value") or 0)
            except ValueError:
                val = 0.0
            if val >= 3.2:
                sk_by_soc[code].append((val, name))
    for code, items in sk_by_soc.items():
        if code in onet_occs:
            items.sort(reverse=True)
            onet_occs[code]["core_skills"] = [name for _, name in items[:6]]

    for r in emg_rows:
        code = (r.get("O*NET-SOC Code") or "").strip()
        task = (r.get("Task") or "").strip()
        if code in onet_occs and task and len(onet_occs[code]["emerging_tasks"]) < 3:
            onet_occs[code]["emerging_tasks"].append(task[:140])

    for r in rel_rows:
        code = (r.get("O*NET-SOC Code") or "").strip()
        rel_code = (r.get("Related O*NET-SOC Code") or "").strip()
        if code in onet_occs and rel_code in soc_to_title and len(onet_occs[code]["related_careers"]) < 5:
            onet_occs[code]["related_careers"].append(soc_to_title[rel_code])

    brain["onet_occupations"] = list(onet_occs.values())
    brain["stats"]["onet_occupations"] = len(onet_occs)
    brain["stats"]["onet_tech_skills_rows"] = len(tech_rows)
    brain["datasets_trained"].append("O*NET 29.0 Occupation, Hot Tech, Skills & Career Changers Database")
    print(f"10. O*NET 29.0 Database: {len(onet_occs)} occupations, {len(tech_rows)} tech skills")

    # ------------------------------------------------------------------
    # 11. Updated Resume Dataset (962 Resumes across 25 Categories)
    # ------------------------------------------------------------------
    z11 = _find_zip("Updated Resume Dataset")
    rows11 = _read_csv_from_zip(z11)
    cat_resumes = collections.defaultdict(list)
    for r in rows11:
        cat = (r.get("Category") or "").strip()
        res_txt = (r.get("Resume") or "").strip()
        if cat and res_txt:
            cat_resumes[cat].append(res_txt)

    resume_benchmarks = {}
    for cat, texts in cat_resumes.items():
        sk_counter = collections.Counter()
        for t in texts:
            for s in extract_skills(t) + extract_extended_lexicon_skills(t, limit=12):
                sk_counter[s] += 1
        resume_benchmarks[cat] = {
            "resume_count": len(texts),
            "top_skills": [s for s, _ in sk_counter.most_common(10)],
        }
    brain["resume_category_benchmarks"] = resume_benchmarks
    brain["stats"]["updated_resumes_count"] = len(rows11)
    brain["datasets_trained"].append("Updated Resume Dataset (962 Labeled CVs across 25 Categories)")
    print(f"11. Updated Resume Dataset: {len(rows11)} resumes across {len(resume_benchmarks)} categories")

    # ------------------------------------------------------------------
    # 12. Record JobStreet Malaysia 68.4k index metadata
    # ------------------------------------------------------------------
    brain["stats"]["jobstreet_malaysia_jobs"] = 68447
    brain["stats"]["jobstreet_malaysia_companies"] = 20514
    brain["datasets_trained"].append("JobStreet Malaysia All Job Dataset (68,447 Jobs · 20,514 Companies)")

    with gzip.open(OUT_PATH, "wt", encoding="utf-8", compresslevel=9) as g:
        json.dump(brain, g, ensure_ascii=False, separators=(",", ":"))

    size_mb = os.path.getsize(OUT_PATH) / 1e6
    print("=" * 70)
    print(f"SUCCESS: Compiled {len(brain['datasets_trained'])} datasets into {OUT_PATH} ({size_mb:.2f} MB)")
    print("Stats:", json.dumps(brain["stats"], indent=2))


if __name__ == "__main__":
    main()
