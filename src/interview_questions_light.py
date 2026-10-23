"""Small, evidence-based question builder. No model, network or API key needed."""
import secrets


def generate_questions(context, language='en'):
    index = {'en': 0, 'ms': 1, 'zh': 2}[language]
    def choose(*translations):
        return translations[index]
    role = context['role']
    skills = context['cv_skills']
    required = context['required_skills']
    focus = context['focus'].casefold()
    # Focus only selects professional evidence already supplied by the server.
    ranked = sorted(skills, key=lambda s: (s.casefold() not in focus if focus else True,
                                          s.casefold() not in {r.casefold() for r in required}))
    skill = next(iter(ranked), choose('a relevant skill', 'kemahiran yang berkaitan', '一项相关技能'))
    missing = [s for s in required if s.casefold() not in {s.casefold() for s in skills}]
    target = next(iter(missing or required), skill)
    project = next(iter(context['cv_projects']), '')
    evidence = choose(f'Your CV mentions {skill}.', f'CV anda menyebut {skill}.', f'简历中提到了 {skill}。') if skills else choose(
        'Use an example from work, study or volunteering.', 'Gunakan contoh kerja, pengajian atau sukarelawan.', '请使用工作、学习或志愿服务中的例子。')
    project_intro = choose(f'Your CV lists this project: “{project[:240]}”.', f'CV anda menyenaraikan projek: “{project[:240]}”.', f'简历列出了项目：“{project[:240]}”。') if project else choose(
        f'Choose a task relevant to {role}.', f'Pilih tugasan berkaitan dengan {role}.', f'请选择一项与 {role} 相关的任务。')
    groups = [
        [evidence + ' ' + q for q in choose(
            ['Describe how you carried out a task, your own contribution, and the evidence you used to check the outcome.', 'Walk through a difficult decision in that work. Which alternatives did you compare, and why?', 'Describe a mistake or unexpected result in that work. How did you investigate and correct it?'],
            ['Huraikan cara melaksanakan tugasan, sumbangan anda dan bukti untuk menyemak hasil.', 'Terangkan keputusan sukar dalam kerja itu. Apakah pilihan yang anda bandingkan dan mengapa?', 'Huraikan kesilapan atau hasil tidak dijangka. Bagaimana anda menyiasat dan membetulkannya?'],
            ['请说明任务的实施步骤、你个人负责的部分，以及验证成果的依据。', '请说明其中一个困难决策。你比较了哪些方案，为什么这样选择？', '请描述一次错误或意外结果。你如何调查并改正？'])],
        [q for q in choose(
            [f'The {role} position calls for {target}. How would you approach a task using it, and what would you verify before starting?', f'For {role}, how would you demonstrate your understanding of {target} in a small practical exercise? Explain the success criteria.', f'If a task involving {target} was unfamiliar, how would you identify your knowledge gaps, seek guidance and validate the result?'],
            [f'Jawatan {role} memerlukan {target}. Bagaimana anda mendekati tugasan ini dan apakah yang disemak dahulu?', f'Untuk {role}, bagaimana anda menunjukkan kefahaman {target} melalui latihan praktikal? Jelaskan kriteria kejayaan.', f'Jika tugasan {target} belum biasa, bagaimana anda mengenal pasti jurang pengetahuan, meminta bimbingan dan mengesahkan hasil?'],
            [f'{role} 岗位要求 {target}。你会如何开展相关任务，开始前需要核实什么？', f'针对 {role}，你会用什么小型实践展示对 {target} 的理解？请说明成功标准。', f'如果不熟悉涉及 {target} 的任务，你会如何找出知识缺口、寻求指导并验证结果？'])],
        [project_intro + ' ' + q for q in choose(
            ['What did you personally deliver, what constraints mattered, and how did you measure the result?', 'Which part would you improve if you repeated it, and what evidence supports that change?', 'How did you communicate progress and resolve a disagreement or unclear requirement?'],
            ['Apakah hasil kerja anda sendiri, kekangan utama dan cara mengukur hasil?', 'Bahagian manakah yang akan ditambah baik jika diulang, dan apakah buktinya?', 'Bagaimana anda melaporkan kemajuan dan menyelesaikan perbezaan pendapat atau keperluan tidak jelas?'],
            ['你个人交付了什么？主要限制是什么？如何衡量成果？', '如果重新开展，你会改进哪一部分？有什么依据？', '你如何汇报进度，并处理分歧或不明确的要求？'])],
        choose(
            [f'As a {role}, how would you balance a tight deadline with quality checks? Explain what you would escalate and document.', f'For a {role} task, how would you check that information is reliable before sharing a recommendation with stakeholders?', f'In your first month as a {role}, what would you clarify with your team, and how would you track progress?'],
            [f'Sebagai {role}, bagaimana anda mengimbangi tarikh akhir dan semakan kualiti? Apakah yang dirujuk dan didokumenkan?', f'Untuk tugasan {role}, bagaimana anda menyemak kebolehpercayaan maklumat sebelum berkongsi cadangan?', f'Dalam bulan pertama sebagai {role}, apakah yang anda jelaskan bersama pasukan dan bagaimana menjejak kemajuan?'],
            [f'作为 {role}，你如何平衡紧迫期限与质量检查？哪些问题需要上报并记录？', f'开展 {role} 相关任务时，你如何在提出建议前核实信息的可靠性？', f'担任 {role} 的第一个月，你会与团队确认什么，并如何跟踪进展？'])
    ]
    previous = {q.strip().casefold() for q in context['previous_questions_to_avoid']}
    return [secrets.choice([q for q in group if q.casefold() not in previous] or group) for group in groups]
