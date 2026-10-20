(() => {
  const root = document.getElementById('home-features');
  if (!root) return;
  const rows = [
    ['🧩', ['Skills profile intake','Profil kemahiran','技能档案采集'], ['Start with your story. Upload a CV, fill in a form or answer a questionnaire to capture your skills and explore your potential.','Muat naik CV, isi borang atau jawab soal selidik untuk mengenal pasti kemahiran dan potensi anda.','从你的经历开始：上传简历、填写表单或回答问卷，整理现有技能，探索发展潜力。'], ['CV → skills → your profile','CV → kemahiran → profil anda','简历 → 技能 → 个人档案'], ['Communication · Analysis · Digital skills','Komunikasi · Analisis · Kemahiran digital','沟通能力 · 分析能力 · 数字技能']],
    ['📡', ['AI-trend signal layer','Isyarat trend AI','AI 趋势信号'], ['Explore changing AI research signals through an updatable source. Check the source and publication date before interpreting a trend.','Terokai isyarat penyelidikan AI daripada sumber yang boleh dikemas kini. Semak sumber dan tarikh penerbitan.','通过可更新的数据源了解 AI 研究动向。查看来源与发布日期，再判断趋势对职业的意义。'], ['Research → signals → context','Penyelidikan → isyarat → konteks','研究动态 → 趋势信号 → 职业参考'], ['Source: arXiv research feed. The portal shows source dates; research activity is not a direct measure of hiring demand.','Sumber: suapan penyelidikan arXiv. Portal memaparkan tarikh sumber; aktiviti penyelidikan bukan ukuran langsung permintaan pekerjaan.','来源：arXiv 研究订阅。门户展示来源日期；研究热度不等于实际招聘需求。']],
    ['🎯', ['Future-role matching','Padanan kerjaya masa depan','未来岗位匹配'], ['Discover ranked roles with explainable match scores. See which skills transfer and which gaps need attention.','Temui jawatan berperingkat dengan skor padanan yang boleh dijelaskan serta jurang kemahiran.','查看适合你的岗位排名和可解释的匹配分数，了解可迁移技能与需要补足的差距。'], ['78% illustrative match','78% padanan contoh','78% 示例匹配度'], ['Your strengths + role requirements → a clearer next step','Kekuatan anda + keperluan jawatan → langkah seterusnya','个人优势 + 岗位要求 → 更清晰的下一步']],
    ['🪴', ['Personalised reskilling pathway','Laluan latihan semula peribadi','个性化技能提升路径'], ['Follow an ordered learning plan with estimated time and free or low-cost resources. Check programme eligibility and fees with the provider.','Ikuti pelan pembelajaran tersusun dengan anggaran masa serta sumber percuma atau kos rendah. Semak kelayakan dan yuran dengan penyedia.','按照有顺序的学习计划逐步提升技能，参考预计时间与免费或低成本资源；课程费用及 HRD Corp 申领资格以提供方为准。'], ['01 Learn → 02 Practise → 03 Apply','01 Belajar → 02 Berlatih → 03 Gunakan','01 学习基础 → 02 实践练习 → 03 应用技能'], ['Example: foundations · 2h / practice · 4h / project · 6h','Contoh: asas · 2j / latihan · 4j / projek · 6j','示例：基础学习 · 2 小时 / 练习 · 4 小时 / 项目 · 6 小时']],
    ['🌏', ['SDG mapping','Pemetaan SDG','可持续发展目标映射'], ['Connect roles and skills to Sustainable Development Goals, and see how your career direction can contribute.','Hubungkan jawatan dan kemahiran dengan Matlamat Pembangunan Mampan dan lihat sumbangan laluan kerjaya anda.','将岗位和技能与可持续发展目标联系起来，理解职业选择如何为这些目标作出贡献。'], ['SDG 4 · Quality education / SDG 8 · Decent work','SDG 4 · Pendidikan berkualiti / SDG 8 · Pekerjaan layak','SDG 4 · 优质教育 / SDG 8 · 体面工作'], ['Learning new skills supports lifelong learning and career development.','Kemahiran baharu menyokong pembelajaran sepanjang hayat dan pembangunan kerjaya.','学习新技能，支持终身学习与职业发展。']],
    ['🔮', ['Handling uncertainty','Menghadapi ketidakpastian','理解未来的不确定性'], ['Compare moderate and fast AI disruption scenarios. Explore possibilities instead of relying on a single forecast.','Bandingkan senario perubahan AI sederhana dan pesat. Terokai kemungkinan tanpa bergantung pada satu ramalan.','比较中等与快速 AI 变革情景，探索多种可能，而不是依赖单一预测。'], ['More than one possible future','Lebih daripada satu kemungkinan masa depan','未来不只有一种可能'], ['Scenario estimates are not guarantees of employment, salary or future demand.','Anggaran senario bukan jaminan pekerjaan, gaji atau permintaan masa depan.','情景估算不保证就业、薪资或未来市场需求。']]
  ];
  const shapes = [
    '<rect x="6" y="3" width="12" height="18" rx="3"/><circle cx="12" cy="9" r="2"/><path d="M9 16c0-4 6-4 6 0M9 19h6"/>',
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 6-6M12 3v2M3 12h2M12 19v2M19 12h2"/>',
    '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="m11 13 9-10m-4 0h4v4"/>',
    '<path d="M3 20h6v-5h6v-5h6V4M17 4h4v4"/><circle cx="5" cy="6" r="2"/>',
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
    '<path d="M12 21v-7c0-5-7-4-7-10m7 10c0-5 7-4 7-10M2 7l3-3 3 3m8 0 3-3 3 3"/>'
  ];
  const icon = i => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[i]}</svg>`;
  const curve = '<svg class="journey-curve" viewBox="0 0 500 660" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="journey-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#818cf8"/><stop offset=".5" stop-color="#e879c4"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient></defs><path class="journey-shadow" d="M145 50 C440 50 440 200 275 200 S40 360 240 360 S440 520 275 520 S90 570 145 625"/><path class="journey-line" d="M145 50 C440 50 440 200 275 200 S40 360 240 360 S440 520 275 520 S90 570 145 625"/></svg>';
  let active = 0, fast = false;
  const lang = () => ({en:0,ms:1,zh:2}[window.careerLensLocale?.getLanguage()] ?? 0);
  const t = (...texts) => texts[lang()];
  function preview() {
    const row = rows[active];
    document.getElementById('feature-preview').innerHTML = `<div class="feature-enter"><span class="chip chip-indigo">${t('Interactive feature preview','Pratonton ciri interaktif','互动功能预览')}</span><div class="feature-art" data-feature-color="${active}" aria-hidden="true">${icon(active)}<span class="art-orbit"></span><span class="art-spark"></span></div><h3>${row[1][lang()]}</h3><p class="feature-copy">${row[2][lang()]}</p><div class="feature-demo"><strong>${row[3][lang()]}</strong>${active===2?'<div class="feature-track"><span></span></div>':''}<p>${row[4][lang()]}</p></div>${active===5?`<div class="feature-pills"><button type="button" data-scenario="moderate" aria-pressed="${!fast}">${t('Moderate','Sederhana','中等变革')}</button><button type="button" data-scenario="fast" aria-pressed="${fast}">${t('Fast','Pesat','快速变革')}</button></div><p class="feature-copy">${fast?t('Explore faster task changes and more frequent learning.','Terokai perubahan tugas lebih pantas dan pembelajaran lebih kerap.','探索任务更快变化、学习更新更频繁的情景。'):t('Explore gradual changes with human–AI collaboration.','Terokai perubahan beransur melalui kerjasama manusia–AI.','探索逐步变化、人机协作的情景。')}</p>`:''}<p class="feature-note">${t('Illustrative preview. Your personalised results appear after sign-in.','Pratonton contoh. Hasil peribadi tersedia selepas log masuk.','此处为功能示意，登录后查看你的个性化结果。')}</p><button type="button" class="btn btn-primary" data-start>${t('Explore with your profile →','Terokai dengan profil anda →','开启我的职业旅程 →')}</button></div>`;
  }
  function render() {
    document.getElementById('feature-heading').innerHTML = `<div class="feature-intro"><span class="chip chip-pink">${t('A little clarity. A bigger future.','Lebih jelas. Masa depan lebih luas.','看清现在，探索更大的未来。')}</span><h2 id="features-heading">${t('Your next chapter, in six steps.','Bab seterusnya, dalam enam langkah.','六个步骤，开启职业新篇章。')}</h2><p>${t('Tap a step to explore how CareerLens connects your strengths to what comes next.','Pilih langkah untuk meneroka bagaimana CareerLens menghubungkan kekuatan anda dengan masa depan.','点击每一步，看看 CareerLens 如何连接你的优势与未来机会。')}</p></div>`;
    document.getElementById('feature-steps').innerHTML = curve + rows.map((row,i)=>`<button type="button" class="feature-step" data-feature-color="${i}" data-step="${i}" aria-expanded="${i===active}" aria-controls="feature-preview"><span class="feature-step-title"><span class="feature-icon" aria-hidden="true">${icon(i)}</span>${row[1][lang()]}<span class="feature-number">0${i+1}</span></span></button>`).join('');
    preview();
  }
  root.addEventListener('click', e => {
    const step=e.target.closest('[data-step]');
    if(step){active=Number(step.dataset.step);render();document.querySelector(`[data-step="${active}"]`).focus({preventScroll:true});}
    const scenario=e.target.closest('[data-scenario]');
    if(scenario){fast=scenario.dataset.scenario==='fast';preview();root.querySelector(`[data-scenario="${fast?'fast':'moderate'}"]`).focus({preventScroll:true});}
    if(e.target.closest('[data-start]')) window.openAuth('register');
  });
  document.getElementById('uiLanguage')?.addEventListener('change', render);
  // A single scheduled frame follows the pointer; touch and reduced-motion stay still.
  const motion = window.matchMedia?.('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const stage = root.querySelector('.feature-explorer');
  let frame = 0, px = 0, py = 0;
  function resetMotion() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    stage.style.setProperty('--mx', '0');
    stage.style.setProperty('--my', '0');
  }
  stage.addEventListener('pointermove', e => {
    if (!motion?.matches || e.pointerType === 'touch') return;
    const box = stage.getBoundingClientRect();
    px = Math.max(-1, Math.min(1, (e.clientX-box.left)/box.width*2-1));
    py = Math.max(-1, Math.min(1, (e.clientY-box.top)/box.height*2-1));
    if (!frame) frame = requestAnimationFrame(() => {
      stage.style.setProperty('--mx', String(px));
      stage.style.setProperty('--my', String(py));
      frame = 0;
    });
  });
  stage.addEventListener('pointerleave', resetMotion);
  motion?.addEventListener('change', resetMotion);
  render();
})();
