import hashlib
import json
import re
from pathlib import Path

COMPETENCIES = json.loads((Path(__file__).parent / 'data/role_competencies.json').read_text(encoding='utf-8'))


def evidence(context, role):
    text = json.dumps(context, ensure_ascii=False).lower()
    needed = COMPETENCIES[role]
    matched = [skill for skill in needed if re.search(r'(?<!\w)' + re.escape(skill) + r'(?!\w)', text)]
    missing = [skill for skill in needed if skill not in matched]
    current = str(context.get('current_role') or '').lower()
    return matched, missing, len(matched) * 10 + (5 if role.lower() == current else 0)


def generate_local(context, roles, basics, language, action):
    index = {'en': 0, 'ms': 1, 'zh': 2}.get(language, 0)
    choose = lambda en, ms, zh: (en, ms, zh)[index]
    metadata = {
        'provider': 'Local CV analysis', 'mode': 'local',
        'notice': choose('Local CV analysis · rules-based, no external AI service',
                         'Analisis CV setempat · berdasarkan peraturan, tanpa AI luaran',
                         '本地简历分析 · 规则生成，未调用外部 AI'),
        'cv_version': hashlib.sha256(json.dumps(context, sort_keys=True).encode()).hexdigest()[:16],
    }
    if action == 'recommendations':
        ranked = sorted(roles, key=lambda role: evidence(context, role)[2], reverse=True)
        recommendations = []
        for role in ranked[:1]:
            matched, missing, score = evidence(context, role)
            found = ', '.join(matched)
            gap = ', '.join(missing) or choose('none in this small catalog', 'tiada dalam katalog kecil ini', '此精简技能目录中未发现')
            reason = choose(
                f'CV evidence: {found}. Skills to confirm or build: {gap}.' if matched else f'An option to explore in your selected field. Your CV has no matching skills in this role catalog yet. Skills to confirm: {gap}.',
                f'Bukti CV: {found}. Kemahiran untuk disahkan atau dibina: {gap}.' if matched else f'Pilihan untuk diteroka dalam bidang anda. Belum ada kemahiran CV yang sepadan. Kemahiran untuk disahkan: {gap}.',
                f'简历依据：{found}。待确认或提升的技能：{gap}。' if matched else f'这是所选领域中可探索的职位，目前简历尚未匹配到该职位的目录技能。待确认技能：{gap}。')
            recommendations.append({'role': role, 'reason': reason, 'matched_skills': matched, 'skills_to_confirm': missing,
                                    'skill_coverage_pct': round(100 * len(matched) / len(COMPETENCIES[role])),
                                    'skills_total': len(COMPETENCIES[role])})
        return {**metadata, 'recommendations': recommendations}
    role = basics['c2']
    matched, missing, _ = evidence(context, role)
    raw_skills = context.get('skills') or []
    skills = [s for s in raw_skills if isinstance(s, str) and s.strip()] if isinstance(raw_skills, list) else []
    skill = next(iter(matched or skills), None)
    questions = []
    if skill:
        questions.append({'skill_tested': skill, 'question': choose(
            f'Your CV mentions {skill}. Describe a task where you used it, your own contribution, and how you checked the result. How would this experience help you as a {role}?',
            f'CV anda menyebut {skill}. Huraikan tugasan, sumbangan anda dan cara menyemak hasilnya. Bagaimanakah pengalaman ini membantu sebagai {role}?',
            f'你的简历提到了 {skill}。请描述使用该技能的任务、你负责的部分，以及如何检查成果。这段经历如何帮助你担任 {role}？')})
    else:
        questions.append({'skill_tested': 'Experience evidence', 'question': choose(
            f'Your CV has no structured skills listed. Describe one project, study assignment or work task relevant to {role}, and explain your contribution.',
            f'CV anda belum menyenaraikan kemahiran. Huraikan projek, tugasan pengajian atau kerja yang berkaitan dengan {role} dan sumbangan anda.',
            f'你的简历尚未列出结构化技能。请描述与 {role} 相关的项目、学习任务或工作，并说明你负责的部分。')})
    target = missing[0] if missing else COMPETENCIES[role][0]
    questions.append({'skill_tested': target, 'question': choose(
        f'The {role} skills catalog includes {target}. ' + ('Your CV does not clearly mention it. Have you used it? If not, what practical exercise would you use to learn it?' if missing else 'Describe a difficult situation involving this skill and how you would handle it.'),
        f'Katalog kemahiran {role} merangkumi {target}. ' + ('CV anda tidak menyebutnya dengan jelas. Pernahkah anda menggunakannya? Jika belum, apakah latihan praktikal untuk mempelajarinya?' if missing else 'Huraikan situasi sukar yang melibatkan kemahiran ini dan cara menanganinya.'),
        f'{role} 的技能目录包含 {target}。' + ('你的简历没有明确提及。你是否使用过它？如果没有，你会通过什么实践任务学习？' if missing else '请描述涉及这项技能的困难情境，以及你的处理方式。'))})
    questions.append({'skill_tested': 'Career direction', 'question': choose(
        f'You selected {role} with the goal “{basics["c8"]}”. Which part of your CV best supports that direction, and what would you aim to achieve in your first 90 days?',
        f'Anda memilih {role} dengan matlamat “{basics["c8"]}”. Bahagian CV manakah menyokongnya, dan apakah sasaran 90 hari pertama anda?',
        f'你选择了 {role}，职业目标是“{basics["c8"]}”。简历中的哪段经历最能支持这个方向？入职前 90 天你希望达成什么？')})
    questions.append({'skill_tested': 'Working approach', 'question': choose(
        f'For a {role} position in {basics["cState"]} with {basics["cMode"]} work, describe how you would communicate progress, check quality and handle a missed deadline. Use an example from your work or studies.',
        f'Untuk jawatan {role} di {basics["cState"]} dengan aturan {basics["cMode"]}, bagaimana anda melaporkan kemajuan, menyemak kualiti dan menangani kelewatan? Gunakan contoh kerja atau pengajian.',
        f'针对 {basics["cState"]} 的 {role} 职位及 {basics["cMode"]} 工作安排，你会如何汇报进度、检查质量和处理延期？请结合工作或学习经历。')})
    return {**metadata, 'questions': questions}
