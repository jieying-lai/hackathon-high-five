/* Questionnaire text templates. Display labels never replace stored answer values. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.questionnaireI18n = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const rows = [
    ["Preferred field / industry", "Bidang / industri pilihan", "目标领域／行业"],
    ["Preferred role", "Jawatan pilihan", "目标职位"],
    ["Preferred state / federal territory", "Negeri / wilayah persekutuan pilihan", "意向州属／联邦直辖区"],
    ["Preferred district / area", "Daerah / kawasan pilihan", "意向县区／地区"],
    ["Enter your preferred area", "Masukkan kawasan pilihan", "填写意向地区"],
    ["Preferred work arrangement", "Aturan kerja pilihan", "工作安排偏好"],
    ["Preferred working style", "Gaya kerja pilihan", "工作方式偏好"],
    ["Your goal for the next 3–5 years", "Matlamat untuk 3–5 tahun akan datang", "未来 3–5 年的职业目标"],
    ["Other area", "Kawasan lain", "其他地区"],
    ["Choose the field above first", "Pilih medan di atas dahulu", "请先选择上方项目"],
    ["Use my current skills", "Gunakan kemahiran semasa", "发挥现有技能"],
    ["Career growth", "Perkembangan kerjaya", "职业发展"],
    ["Better salary", "Gaji lebih baik", "更好的薪资"],
    ["Career change", "Pertukaran kerjaya", "转行"],
    ["Interest in this profession", "Minat dalam profesion ini", "对该职业感兴趣"],
    ["Independent work", "Kerja berdikari", "独立工作"],
    ["Team work", "Kerja berpasukan", "团队工作"],
    ["A mix of both", "Gabungan kedua-duanya", "两者结合"],
    ["Develop specialist expertise", "Bina kepakaran khusus", "发展专业能力"],
    ["Move into management", "Beralih ke pengurusan", "转向管理岗位"],
    ["Change career field", "Tukar bidang kerjaya", "转向其他职业领域"],
    ["Start a business", "Mulakan perniagaan", "创业"],
    ["Still exploring", "Masih meneroka", "仍在探索"],
    ["Prefer to discuss", "Sedia berbincang", "面议"],
    ["Common questions", "Soalan umum", "基本资料"],
    ["Save basic information", "Simpan maklumat asas", "保存基本资料"],
    ["Basic information saved on this device.", "Maklumat asas disimpan pada peranti ini.", "基本资料已保存在此设备。"],
    ["2 · Personalised for your CV", "2 · Khusus untuk CV anda", "2 · 简历个性化问题"],
    ["Continue to CV questions →", "Teruskan ke soalan CV →", "继续填写简历问题 →"],
    ["← Back to basic information", "← Kembali ke maklumat asas", "← 返回基本资料"],
    ["Generate my CV questions", "Jana soalan CV saya", "生成我的简历问题"],
    ["Regenerate questions", "Jana semula soalan", "重新生成问题"],
    ["Save questionnaire", "Simpan soal selidik", "保存问卷"],
    ["✨ Recommend roles from my CV", "✨ Cadangkan jawatan daripada CV saya", "✨ 根据简历推荐职位"],
    ['Are you a fresh graduate, working, or changing career?', 'Adakah anda graduan baharu, sedang bekerja atau menukar kerjaya?', '你是应届毕业生、在职人士，还是正在转行？'],
    ['Which role or field are you aiming for?', 'Apakah jawatan atau bidang sasaran anda?', '你的目标岗位或领域是什么？'],
    ['Why does this role interest you?', 'Mengapa anda berminat dengan jawatan ini?', '你为什么对这个岗位感兴趣？'],
    ['Preferred location and work arrangement?', 'Lokasi dan aturan kerja pilihan?', '你偏好的工作地点和安排是什么？'],
    ['Expected monthly salary range?', 'Julat gaji bulanan dijangka?', '你期望的月薪范围是多少？'],
    ['How soon can you start?', 'Bilakah anda boleh mula bekerja?', '你何时可以入职？'],
    ['Do you prefer independent or team work? Why?', 'Adakah anda lebih suka bekerja sendiri atau dalam pasukan? Mengapa?', '你更喜欢独立工作还是团队合作？为什么？'],
    ['Where do you want to be in 3–5 years?', 'Apakah matlamat kerjaya anda dalam 3–5 tahun?', '你希望在未来 3–5 年达到怎样的职业目标？'],
    ['Select…', 'Sila pilih…', '请选择…'],
    ['Fresh Graduate', 'Graduan Baharu', '应届毕业生'],
    ['Working Professional', 'Profesional Bekerja', '在职人士'],
    ['Career Changer', 'Penukar Kerjaya', '转行人士'],
    ['Kuala Lumpur · Hybrid', 'Kuala Lumpur · Hibrid', '吉隆坡 · 混合办公'],
    ['Selangor · Hybrid', 'Selangor · Hibrid', '雪兰莪 · 混合办公'],
    ['Remote (Malaysia)', 'Jarak jauh (Malaysia)', '远程办公（马来西亚）'],
    ['On-site (any city)', 'Di pejabat (mana-mana bandar)', '现场办公（任意城市）'],
    ['Immediately', 'Serta-merta', '可立即入职'],
    ['2 weeks', '2 minggu', '2 周后'],
    ['1 month', '1 bulan', '1 个月后'],
    ['2+ months', '2 bulan atau lebih', '2 个月或更久后'],
    ['Adaptability & AI Readiness', 'Kebolehsuaian & Kesediaan AI', '适应能力与 AI 就绪度'],
    ['Finance & Accounting', 'Kewangan & Perakaunan', '金融与会计'],
    ['Marketing & PR', 'Pemasaran & Perhubungan Awam', '市场营销与公关'],
    ['IT & Software', 'IT & Perisian', '信息技术与软件'],
    ['HR & Administration', 'Sumber Manusia & Pentadbiran', '人力资源与行政'],
    ['Financial Auditing', 'Pengauditan Kewangan', '财务审计'],
    ['Financial Reporting', 'Pelaporan Kewangan', '财务报告'],
    ['Excel Pivot & Macros', 'Jadual Pangsi & Makro Excel', 'Excel 数据透视表与宏'],
    ['Tax Compliance', 'Pematuhan Cukai', '税务合规'],
    ['SQL Basics', 'Asas SQL', 'SQL 基础'],
    ['Risk Assessment', 'Penilaian Risiko', '风险评估'],
    ['Copywriting', 'Penulisan Iklan', '文案写作'],
    ['SEO Content Strategy', 'Strategi Kandungan SEO', 'SEO 内容策略'],
    ['Canva & Basic Design', 'Canva & Reka Bentuk Asas', 'Canva 与基础设计'],
    ['Google Analytics', 'Google Analytics', 'Google Analytics'],
    ['Social Media Campaigns', 'Kempen Media Sosial', '社交媒体活动'],
    ['Bilingual Communication', 'Komunikasi Dwibahasa', '双语沟通'],
    ['REST APIs', 'API REST', 'REST API'],
    ['Data Structures', 'Struktur Data', '数据结构'],
  ];
  const dictionary = new Map(rows.map(row => [row[0], row]));
  function translate(text, language) {
    const index = language === 'zh' ? 2 : language === 'ms' ? 1 : 0;
    if (!index) return text;
    const entry = dictionary.get(text);
    if (entry) return entry[index];
    const numbered = text.match(/^(\d+\.\s+)(.+)$/s);
    if (numbered) return numbered[1] + translate(numbered[2], language);
    const progress = text.match(/^(\d+) of (\d+) answered · (?:draft )?saved on this device$/);
    if (progress) return language === 'zh'
      ? `已回答 ${progress[1]} / ${progress[2]} 题 · 已保存在此设备`
      : `${progress[1]} daripada ${progress[2]} soalan dijawab · disimpan pada peranti ini`;
    const skillQuestion = text.match(/^Your profile lists '(.+)'. Can you describe a real project or workflow where you applied (.+) independently to solve a bottleneck\?$/s);
    if (skillQuestion) {
      const skill = translate(skillQuestion[1], language);
      const applied = translate(skillQuestion[2], language);
      return language === 'zh'
        ? `你的资料列出了“${skill}”。请描述一个真实项目或工作流程，说明你如何独立运用${applied}解决瓶颈。`
        : `Profil anda menyenaraikan '${skill}'. Bolehkah anda terangkan projek atau aliran kerja sebenar di mana anda menggunakan ${applied} secara berdikari untuk mengatasi halangan?`;
    }
    const readinessQuestion = text.match(/^In (.*), repetitive tasks are shifting to AI co-pilots\. Which part of your current workflow would you automate first, and what human judgment must remain under your control\?$/s);
    if (readinessQuestion) {
      const sector = translate(readinessQuestion[1], language);
      return language === 'zh'
        ? `在${sector}领域，重复性任务正逐渐由 AI 助手承担。你会优先将当前工作流程的哪一部分自动化？哪些判断必须由你本人掌控？`
        : `Dalam bidang ${sector}, tugas berulang semakin beralih kepada pembantu AI. Bahagian manakah dalam aliran kerja semasa anda yang akan diautomasikan dahulu, dan pertimbangan manusia manakah yang mesti kekal di bawah kawalan anda?`;
    }
    return text;
  }
  return { translate };
});
