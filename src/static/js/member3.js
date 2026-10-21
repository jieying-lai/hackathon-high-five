
(() => {
  const vocabulary = [
    ['Dashboard','Papan pemuka','仪表板'],['Overview','Gambaran keseluruhan','概览'],
    ['Your career dashboard','Papan pemuka kerjaya anda','你的职业仪表板'],
    ['Profile & Skills','Profil & Kemahiran','个人资料与技能'],['Skills profile','Profil kemahiran','技能档案'],
    ['Questionnaire','Soal selidik','问卷'],['Application questionnaire','Soal selidik permohonan','申请问卷'],
    ['AI Radar','Radar AI','AI 趋势雷达'],['Future skills radar','Radar kemahiran masa depan','未来技能雷达'],
    ['Role Matches','Padanan Jawatan','岗位匹配'],['Future-role matches','Padanan jawatan masa depan','未来岗位匹配'],
    ['Reskilling Plan','Pelan latihan semula','技能提升计划'],['Personalised reskilling plan','Pelan latihan semula peribadi','个性化技能提升计划'],
    ['SDG Passport','Pasport SDG','SDG 职业护照'],['Your SDG career passport','Pasport kerjaya SDG anda','你的 SDG 职业护照'],
    ['Talent Portal','Portal Bakat','求职者门户'],['Employer Portal','Portal Majikan','雇主门户'],
    ['Sign out','Log keluar','退出登录'],['Welcome back','Selamat kembali','欢迎回来'],['Next step','Langkah seterusnya','下一步'],
    ['Your details','Maklumat anda','你的资料'],['Demo personas use synthetic data only','Persona demo menggunakan data sintetik sahaja','演示人物仅使用合成数据'],
    ['Full name','Nama penuh','姓名'],['Industry','Industri','行业'],['Current role','Jawatan semasa','当前岗位'],
    ['Work mode','Mod kerja','工作模式'],['Skills','Kemahiran','技能'],['· press Enter to add','· tekan Enter untuk tambah','· 按 Enter 添加'],
    ['Save & analyse →','Simpan & analisis →','保存并分析 →'],['Common questions','Soalan umum','通用问题'],
    ['Personalised for your CV','Disesuaikan untuk CV anda','根据你的简历定制'],['AI-generated','Dijana AI','AI 生成'],
    ['🐢 Moderate','🐢 Sederhana','🐢 中等采用'],['🚀 Fast disruption','🚀 Perubahan pesat','🚀 快速变革'],
    ['What-If: AI adoption scenario','Bagaimana Jika: Senario penggunaan AI','What-If：AI 采用情景'],
    ['Two benchmark scenarios: Moderate / Fast. Estimates, not predictions.','Dua senario penanda aras: Sederhana / Pesat. Anggaran sahaja.','两种基准情景：中等／快速。数值仅为估算，并非预测。'],
    ['Loading analysis…','Memuatkan analisis…','正在加载分析…'],['Analysis unavailable. Please retry.','Analisis tidak tersedia. Sila cuba lagi.','分析暂不可用，请重试。'],
    ['📈 Rising skills','📈 Kemahiran meningkat','📈 增长中的技能'],['⚠️ Tasks at automation risk','⚠️ Tugas berisiko automasi','⚠️ 存在自动化风险的任务'],
    ['📰 Recent AI research signals','📰 Isyarat penyelidikan AI terkini','📰 近期 AI 研究信号'],
    ['Moderate AI Adoption (Human-AI Co-Pilot)','Penggunaan AI sederhana (kerjasama manusia-AI)','中等 AI 采用（人机协作）'],
    ['Fast AI Disruption (Aggressive Adoption)','Perubahan AI pesat (penggunaan agresif)','快速 AI 变革（积极采用）'],
    ['⚖️ Fairness checks','⚖️ Semakan keadilan','⚖️ 公平性检查'],['Scores are estimates','Skor ialah anggaran','分数仅为估算'],
    ['Protected attributes excluded from scoring. Statistical parity has not been audited.','Atribut terlindung dikecualikan daripada pemarkahan. Kesetaraan statistik belum diaudit.','评分不使用受保护属性；尚未进行统计公平性审计。'],
    ['Scenario adjustment','Pelarasan senario','情景调整'],['Core skills','Kemahiran teras','核心技能'],['Transferable','Boleh dipindah','可迁移技能'],
    ['Sector fit','Padanan sektor','行业适配'],['Work mode','Mod kerja','工作模式'],['★ Best match','★ Padanan terbaik','★ 最佳匹配'],
    ['No skill gap','Tiada jurang kemahiran','无技能差距'],['Reskilling plan →','Pelan latihan semula →','技能提升计划 →'],
    ['Target role','Jawatan sasaran','目标岗位'],['Step-by-step path','Laluan langkah demi langkah','有序学习路径'],['SDG alignment','Penjajaran SDG','SDG 目标对齐'],
    ['Open course ↗','Buka kursus ↗','打开课程 ↗'],['Continue →','Teruskan →','继续 →'],['Plan','Pelan','计划'],
    ['Complete your profile','Lengkapkan profil anda','完善个人资料'],['Answer the questionnaire','Jawab soal selidik','填写问卷'],
    ['Review your role matches','Semak padanan jawatan','查看匹配岗位'],['Open your reskilling plan','Buka pelan latihan semula','打开技能提升计划'],
    ['View your SDG passport','Lihat pasport SDG','查看 SDG 护照'],['Profile analysed','Profil dianalisis','资料已分析'],
    ['Please enter your name.','Sila masukkan nama anda.','请输入姓名。'],['Add at least one skill.','Tambah sekurang-kurangnya satu kemahiran.','请至少添加一项技能。'],
    ['Company','Syarikat','公司'],['Hiring & workforce overview','Gambaran pengambilan & tenaga kerja','招聘与团队概览'],
    ['Job Vacancies','Kekosongan Jawatan','招聘职位'],['Job vacancies','Kekosongan jawatan','招聘职位'],
    ['Candidate Screening','Saringan Calon','候选人筛选'],['Candidate screening','Saringan calon','候选人筛选'],
    ['Skills Heatmap','Peta Haba Kemahiran','技能热力图'],['Workforce skills-gap heatmap','Peta haba jurang kemahiran tenaga kerja','团队技能差距热力图'],
    ['Reskilling Plans','Pelan Latihan Semula','团队技能提升计划'],['Reskilling plans','Pelan latihan semula','团队技能提升计划'],
    ['Workforce','Tenaga kerja','团队'],['👨‍⚖️ Humans make the final decision','👨‍⚖️ Keputusan akhir oleh manusia','👨‍⚖️ 最终由人工决策'],
    ['Open vacancies','Kekosongan terbuka','开放职位'],['Candidate pool','Kumpulan calon','候选人库'],['Avg match','Purata padanan','平均匹配'],
    ['Team AI readiness','Kesediaan AI pasukan','团队 AI 就绪度'],['Screening pipeline','Aliran saringan','筛选流程'],
    ['Responsible AI checks','Semakan AI bertanggungjawab','负责任 AI 检查'],['Manage →','Urus →','管理 →'],['Screen','Saring','筛选'],
    ['Department','Jabatan','部门'],['All departments','Semua jabatan','全部部门'],['Biggest gap','Jurang terbesar','最大差距'],
    ['Staff below 60% ready','Staf di bawah 60% bersedia','就绪度低于 60% 的员工'],['Employees tracked','Pekerja dijejaki','员工数'],
    ['Employee','Pekerja','员工'],['Readiness','Kesediaan','就绪度'],['Team coverage (≥ target)','Liputan pasukan (≥ sasaran)','团队覆盖率（达到目标）'],
    ['0 None','0 Tiada','0 无'],['1 Basic','1 Asas','1 基础'],['2 Proficient','2 Mahir','2 熟练'],['3 Advanced','3 Lanjutan','3 高级'],['Target: 2','Sasaran: 2','目标：2'],
    ['Synthetic team data · proficiency scale 0–3 · target level 2. Department filter applies to table rows; summary covers the whole team.','Data pasukan sintetik · tahap 0–3 · sasaran 2. Penapis jabatan untuk baris jadual; ringkasan merangkumi seluruh pasukan.','合成团队数据 · 熟练度 0–3 · 目标等级 2。部门筛选作用于表格；摘要展示全团队。'],
    ['Approved training','Latihan diluluskan','已批准的培训'],['SDG contribution','Sumbangan SDG','SDG 贡献'],['Approve','Luluskan','批准'],
    ['Candidate','Calon','候选人'],['Relevant exp.','Pengalaman berkaitan','相关经验'],['Match','Padanan','匹配'],['To confirm','Untuk disahkan','待确认'],
    ['Suggested action','Tindakan dicadangkan','建议操作'],['HR decision','Keputusan HR','HR 决策'],['Insight','Wawasan','详情'],
    ['Candidates','Calon','候选人'],['Priority review','Semakan keutamaan','优先审核'],['Confirm skills','Sahkan kemahiran','确认技能'],['Average match','Purata padanan','平均匹配'],
    ['Create a job vacancy','Cipta kekosongan jawatan','创建招聘职位'],['Create vacancy','Cipta kekosongan','创建职位'],['Position *','Jawatan *','职位 *'],['Location','Lokasi','地点'],
    ['Work mode *','Mod kerja *','工作模式 *'],['Min. relevant years *','Tahun berkaitan minimum *','最低相关年限 *'],
    ['Salary min (RM) *','Gaji minimum (RM) *','最低薪资（RM）*'],['Salary max (RM) *','Gaji maksimum (RM) *','最高薪资（RM）*'],
    ['Minimum education *','Pendidikan minimum *','最低学历 *'],['Required skills *','Kemahiran wajib *','必需技能 *'],['Preferred skills','Kemahiran pilihan','优先技能'],
    ['· Enter to add','· Enter untuk tambah','· 按 Enter 添加'],['· optional','· pilihan','· 选填'],['Vacancy','Kekosongan','职位'],
    ['Use only criteria that relate directly to the role.','Gunakan kriteria berkaitan jawatan sahaja.','仅使用与岗位直接相关的标准。'],
    ['Team data unavailable. Please retry.','Data pasukan tidak tersedia. Sila cuba lagi.','团队数据暂不可用，请重试。'],
    ['Benchmark trend radar','Radar trend penanda aras','基准趋势雷达'],['Illustrative growth (%) · not live job-market measurements','Pertumbuhan ilustrasi (%) · bukan ukuran pasaran kerja langsung','示例增长率（%）· 非实时就业市场测量'],
    ['AI risk','Risiko AI','AI 风险'],['Automation','Automasi','自动化'],['Sustainability','Kemampanan','可持续发展'],['Growth (%)','Pertumbuhan (%)','增长率（%）'],
    ['Function 01','Fungsi 01','功能 01'],['Function 02','Fungsi 02','功能 02'],['Function 03','Fungsi 03','功能 03'],['Function 04','Fungsi 04','功能 04'],
    ['Impact','Impak','影响'],['Step 1','Langkah 1','第 1 步'],['Step 2','Langkah 2','第 2 步'],
    ['Are you a fresh graduate, working, or changing career?','Adakah anda graduan baharu, sedang bekerja atau menukar kerjaya?','你是应届毕业生、在职人士，还是正在转行？'],
    ['Which role or field are you aiming for?','Apakah jawatan atau bidang sasaran anda?','你的目标岗位或领域是什么？'],
    ['Why does this role interest you?','Mengapa anda berminat dengan jawatan ini?','你为什么对这个岗位感兴趣？'],
    ['Preferred location and work arrangement?','Lokasi dan aturan kerja pilihan?','你偏好的工作地点和安排是什么？'],
    ['Expected monthly salary range?','Julat gaji bulanan dijangka?','你期望的月薪范围是多少？'],
    ['How soon can you start?','Bilakah anda boleh mula?','你何时可以入职？'],
    ['Do you prefer independent or team work? Why?','Adakah anda lebih suka bekerja sendiri atau dalam pasukan? Mengapa?','你更喜欢独立工作还是团队合作？为什么？'],
    ['Top future-role matches','Padanan jawatan masa depan terbaik','最匹配的未来岗位'],['See all →','Lihat semua →','查看全部 →'],
    ['Add your skills to get started.','Tambah kemahiran anda untuk bermula.','添加技能以开始分析。'],
    ['Help us verify your practical depth.','Bantu kami mengesahkan pengalaman praktikal anda.','帮助我们了解你的实践经验。'],
    ['See why each role fits you.','Lihat sebab setiap jawatan sesuai.','了解各岗位与你的匹配原因。'],
    ['Follow an ordered, verified learning path.','Ikuti laluan pembelajaran tersusun daripada katalog.','按照目录中的有序学习路径提升技能。'],
    ['See the impact of your chosen path.','Lihat impak laluan pilihan anda.','查看所选学习路径的影响。'],
    ['No skills yet — add some below.','Belum ada kemahiran — tambah di bawah.','尚无技能，请在下方添加。'],
  ];
  const byEnglish = new Map(vocabulary.map(row => [row[0], row]));
  const reverse = new Map(vocabulary.flatMap(row => row.map(text => [text, row[0]])));
  let language = 'en';
  try { language = localStorage.getItem('cl_language') || 'en'; } catch (_) {}
  if (!['en','ms','zh'].includes(language)) language = 'en';
  const originals = new WeakMap();
  const renderedSources = new Map();
  function translate(text) {
    // Malay place names can also be canonical values (e.g. Pulau Pinang).
    const source = /[\u3400-\u9fff]/.test(text) ? renderedSources.get(text) || text : text;
    const rendered = translateText(source);
    if (rendered !== source && /[\u3400-\u9fff]/.test(rendered)) renderedSources.set(rendered, source);
    return rendered;
  }
  function translateText(text) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized !== text) {
      const translated = translate(normalized);
      if (translated !== normalized) return translated;
    }
    const questionnaireText = window.questionnaireI18n?.translate(text, language) ?? text;
    if (questionnaireText !== text) return questionnaireText;
    const authText = window.authI18n?.translate(text, language) ?? text;
    if (authText !== text) return authText;
    const row = byEnglish.get(reverse.get(text) || text);
    if (row) return row[language === 'zh' ? 2 : language === 'ms' ? 1 : 0];
    const portalText = window.portalI18n?.translate(text, language) ?? text;
    if (portalText !== text) return portalText;
    const icon = text.match(/^([\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D✓★+⚪↻⬇✕]+\s*)(.+)$/u);
    if (icon) return icon[1] + translate(icon[2]);

    if (text.includes('·')) return text.split(/(\s*·\s*)/).map((part,index)=>index%2 ? part : translate(part)).join('');
    return text;
  }
  const attributeOriginals = new WeakMap();
  const generatedOriginals = new WeakMap();
  const originalTitle = document.title;
  function apply() {
    observer.disconnect();

    document.body.normalize();
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language;
    document.title = translate(originalTitle);

    document.querySelectorAll('option:not([value])').forEach(option => {
      option.setAttribute('value', option.textContent);
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,textarea,input,[data-no-translate]')) continue;
      const text = node.textContent.trim();
      if (!text) continue;
      const previous = originals.get(node);
      const source = previous && (text === previous.source || text === previous.rendered) ? previous.source : reverse.get(text) || text;
      const rendered = translate(source);
      if (rendered !== text) node.textContent = node.textContent.replace(text, rendered);
      originals.set(node, {source, rendered});
    }
    document.querySelectorAll('[title],[aria-label],[placeholder],[alt],optgroup[label]').forEach(element => {
      if (element.closest('[data-no-translate]')) return;
      const saved = attributeOriginals.get(element) || {};
      for (const name of ['title','aria-label','placeholder','alt','label']) {
        if (!element.hasAttribute(name)) continue;
        const text = element.getAttribute(name);
        const previous = saved[name];
        const source = previous && text === previous.rendered ? previous.source : text;
        const rendered = translate(source);
        if (rendered !== text) element.setAttribute(name,rendered);
        saved[name] = {source,rendered};
      }
      attributeOriginals.set(element,saved);
    });
    document.querySelectorAll('textarea[data-generated-source]').forEach(element => {
      const previous=generatedOriginals.get(element);
      const source=element.dataset.generatedSource;

      if (previous && element.value !== previous.rendered) return;
      const rendered=translate(source);
      element.value=rendered;
      generatedOriginals.set(element,{rendered});
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['title','aria-label','placeholder','alt']});
  }
  const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(apply, 20); });
  let timer;
  const toolbar = document.createElement('div');
  toolbar.className = 'language-toolbar'; toolbar.dataset.noTranslate = '';
  const languageSlot = document.querySelector('[data-language-slot]');
  toolbar.innerHTML = '<label for="uiLanguage" class="language-label">Language / Bahasa / 语言</label><svg class="language-globe" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0"/></svg><select id="uiLanguage" aria-label="Language / Bahasa / 语言"><option value="en">EN</option><option value="ms">BM</option><option value="zh">中文</option></select>';
  if (languageSlot) {
    toolbar.classList.add('language-inline');
    const portalViewport = window.matchMedia('(min-width: 1280px)');
    function placeLanguageSelector() {
      const target = document.querySelector(portalViewport.matches ? '[data-language-slot="desktop"]' : '[data-language-slot="mobile"]') || languageSlot;
      target.append(toolbar);
    }
    placeLanguageSelector();
    portalViewport.addEventListener('change', placeLanguageSelector);
  } else document.body.prepend(toolbar);
  const selector = toolbar.querySelector('select'); selector.value = language;
  selector.addEventListener('change', () => {
    language = selector.value;
    try { localStorage.setItem('cl_language', language); } catch (_) {}
    apply();
  });
  const styles = document.createElement('style');
  styles.textContent = '.language-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:10px 24px;background:transparent;color:#334155;border-bottom:0;font:600 12px system-ui;position:relative;z-index:40}.language-toolbar select{padding:6px 10px;border:1px solid #cbd5e1;border-radius:8px;background:transparent;color:#0f172a}#scenarioSlider{accent-color:#6366f1;min-height:32px}summary{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #6366f1;outline-offset:3px}.trend-radar{max-width:430px;margin:auto;display:block;width:100%;height:auto}';
  document.head.append(styles);
  const headerStyles = document.createElement('style');
  headerStyles.textContent = '.language-globe{width:19px;height:19px;flex:none;color:#64748b}.language-toolbar:not(.language-inline) .language-globe{display:none}.language-toolbar.language-inline{display:flex;align-items:center;gap:7px;padding:0 11px;background:rgba(255,255,255,.72);border:1px solid #e2e8f0;border-radius:999px;font:700 13px system-ui;position:static;transition:background .15s,border-color .15s;box-shadow:0 2px 8px #0f172a04}.language-toolbar.language-inline:hover{background:#fff;border-color:#c7d2fe}.language-inline .language-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.language-toolbar.language-inline select{min-height:42px;max-width:72px;padding:6px 0;border:0;border-radius:0;background:transparent;box-shadow:none;color:#334155;cursor:pointer;font:inherit}.language-inline:focus-within{outline:3px solid #a5b4fc;outline-offset:2px}.language-toolbar.language-inline select:focus-visible{outline:0}.landing-actions{flex-shrink:0}.landing-brand{min-width:0}@media(max-width:640px){.landing-header .landing-brand>div>div:last-child{display:none}.landing-header .landing-brand{gap:8px}.landing-header .landing-brand img{width:36px;height:36px}.landing-header .landing-brand>div>div:first-child{font-size:16px;white-space:nowrap}.landing-header .landing-actions{gap:8px}.landing-header .landing-actions>.btn-primary{display:none}.landing-header .landing-actions>.btn-soft{padding:9px 12px;font-size:12px}.language-toolbar.language-inline{padding:0 8px;gap:5px}.language-toolbar.language-inline select{min-height:38px;font-size:12px;max-width:62px}.language-inline .language-globe{width:17px;height:17px}}';
  document.head.append(headerStyles);
  window.renderTrendRadar = trend => {
    const chart = document.getElementById('radarChart'); if (!chart) return;
    const rows = trend.emerging_skills;
    if (rows.length !== 4) return;
    const values = rows.map(s => Math.min(100, Math.max(0, Number(s.growth_pct) || 0)));
    const points = radius => `210,${160-radius} ${210+radius},160 210,${160+radius} ${210-radius},160`;
    const dataPoints = `${210},${160-values[0]*1.1} ${210+values[1]*1.1},160 210,${160+values[2]*1.1} ${210-values[3]*1.1},160`;
    const polygon = chart.querySelector('#radarData');
    if (polygon) {
      polygon.setAttribute('points', dataPoints);
      const description = rows.map((r,i)=>`${esc(r.skill)}: ${values[i]}%`).join('; ');
      chart.querySelector('#radarDesc').textContent = translate(description);
      return;
    }
    chart.innerHTML = `<h2 class="text-sm font-extrabold">Benchmark trend radar</h2><p class="hint">Illustrative growth (%) · not live job-market measurements</p><svg viewBox="0 0 420 325" class="trend-radar" role="img" aria-labelledby="radarTitle radarDesc"><title id="radarTitle">Benchmark trend radar</title><desc id="radarDesc">${rows.map((r,i)=>`${esc(r.skill)}: ${values[i]}%`).join('; ')}</desc>${[27.5,55,82.5,110].map(r=>`<polygon points="${points(r)}" fill="none" stroke="#cbd5e1"/>`).join('')}<path d="M210 50V270M100 160H320" stroke="#cbd5e1"/><polygon id="radarData" points="${dataPoints}" fill="#6366f1" fill-opacity=".22" stroke="#4f46e5" stroke-width="3"/><g fill="#334155" font-size="12" text-anchor="middle"><text x="210" y="30">LLM / RAG</text><text x="365" y="165">AI risk</text><text x="210" y="298">Automation</text><text x="52" y="165">Sustainability</text></g></svg>`;
  };
  window.careerLensLocale = {apply, translate, getLanguage: () => language};
  apply();
})();
