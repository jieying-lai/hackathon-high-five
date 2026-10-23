
(() => {
  const vocabulary = [
    ['AI Workforce Navigation & Reskilling Platform','Platform Panduan Kerjaya & Latihan Semula AI','平台 AI 职业导航与技能提升'],
    ['Find your place in the ','Cari tempat anda dalam ','在 AI 时代找到自己的位置'],
    ['AI era','era AI','AI 时代'],
    ["Match today's skills to tomorrow's roles, with transparent scores, verified courses and a clear path.",'Padankan kemahiran hari ini dengan pekerjaan masa depan melalui skor yang jelas, kursus disahkan dan laluan pembelajaran yang tersusun.','将现有技能与未来岗位相匹配，查看清晰的评分、经过核实的课程和明确的学习路径。'],
    ['Get Started →','Mulakan →','开始使用 →'],
    ['use AI vs trained (MY)','menggunakan AI berbanding menerima latihan (Malaysia)','（马来西亚）使用 AI 与接受 AI 培训的比例'],
    ['workers to reskill','pekerja perlu menjalani latihan semula','名员工需要提升技能'],
    ['impact alignment','penjajaran impak','影响目标对齐'],
    ['CareerLens AI Radar','Radar AI CareerLens','CareerLens AI 趋势雷达'],
    ['Workforce Mobility & Matching Engine','Enjin Mobiliti & Padanan Tenaga Kerja','人才流动与岗位匹配引擎'],
    ['● Active Engine','● Enjin Aktif','● 引擎运行中'],
    ['Skill Extraction & Verification','Pengekstrakan & Pengesahan Kemahiran','技能提取与核验'],
    ['Instant CV parsing across 400+ national taxonomy skills','Penghuraian CV segera merangkumi lebih 400 kemahiran dalam taksonomi kebangsaan','快速解析简历，涵盖 400 多项国家技能分类'],
    ['Future-Role Fit Scoring','Pemarkahan Kesesuaian Jawatan Masa Depan','未来岗位匹配评分'],
    ['Transparent fit breakdown powered by O*NET 29.0 & MASCO','Pecahan skor kesesuaian yang telus berdasarkan O*NET 29.0 & MASCO','基于 O*NET 29.0 和 MASCO 的透明匹配评分明细'],
    ['Personalised Reskilling Plan','Pelan Latihan Semula Peribadi','个性化技能提升计划'],
    ['Structured courses, Pomodoro buddy, and SDG passport','Kursus tersusun, pembantu Pomodoro dan pasport SDG','结构化课程、番茄钟助手和 SDG 护照'],
    ['69,000+','69,000+','69,000+'],
    ['live postings indexed','iklan kerja aktif diindeks','个在招职位已收录'],
    ['Explore Roles →','Terokai Jawatan →','探索岗位 →'],
    ['Two Dedicated Portals','Dua Portal Khusus','两大专属门户'],
    ['Choose your gateway','Pilih portal anda','选择你的入口'],
    ['Whether you are developing your career or building your workforce, CareerLens has a purpose-built workspace engineered for you.','Sama ada anda sedang membangunkan kerjaya atau pasukan, CareerLens menyediakan ruang kerja khusus untuk keperluan anda.','无论你正发展职业生涯还是建设团队，CareerLens 都为你提供专属工作空间。'],
    ['For Individuals & Job Seekers','Untuk Individu & Pencari Kerja','面向个人与求职者'],
    ['Free for Talent','Percuma untuk Pencari Kerja','求职者免费使用'],
    ['Empower your career transition with ethical AI. Bridge skills gaps, understand automation risk, and build your certified green & digital workforce passport.','Majukan peralihan kerjaya anda dengan AI beretika. Atasi jurang kemahiran, fahami risiko automasi dan bina pasport tenaga kerja hijau serta digital yang diperakui.','借助合乎伦理的 AI 推进职业转型，弥补技能差距、了解自动化风险，并建立经过认证的绿色与数字技能护照。'],
    ['Private CV Vault','Peti Simpanan CV Peribadi','私密简历库'],
    ['Fast local PDF extraction; zero PII leakage with owner-controlled consent.','Pengekstrakan PDF setempat yang pantas; data peribadi tidak dikongsi tanpa kebenaran pemilik.','快速本地解析 PDF；由用户掌控授权，避免个人资料外泄。'],
    ['AI Disruption Radar','Radar Gangguan AI','AI 变革趋势雷达'],
    ['Real-time analysis of what AI automates vs your human advantage in Malaysia.','Analisis masa nyata tentang tugas yang diautomasikan AI dan kelebihan manusia anda di Malaysia.','实时分析马来西亚哪些工作会被 AI 自动化，以及你的人类优势所在。'],
    ['69k+ Role Matches','69k+ Padanan Jawatan','超过 6.9 万个岗位匹配'],
    ['Live Malaysian job indexing with proximity search and map exploration.','Indeks kerja Malaysia secara langsung dengan carian berdekatan dan penerokaan peta.','实时收录马来西亚职位，支持附近搜索和地图浏览。'],
    ['SDG 8 Passport','Pasport SDG 8','SDG 8 护照'],
    ['Verifiable micro-courses aligned with UN Sustainable Development Goals.','Kursus mikro yang boleh disahkan dan sejajar dengan Matlamat Pembangunan Mampan PBB.','可核实的微课程，与联合国可持续发展目标相衔接。'],
    ['Launch Talent Portal →','Buka Portal Bakat →','进入求职者门户 →'],
    ['Try Demo: Aisha Rahman','Cuba Demo: Aisha Rahman','体验演示：Aisha Rahman'],
    ['For HR, Leaders & Companies','Untuk HR, Pemimpin & Syarikat','面向人力资源、管理者与企业'],
    ['Zero Bias AI','AI Tanpa Bias','零偏见 AI'],
    ['Screen candidates with complete fairness, plan team reskilling, and schedule interviews seamlessly while staying 100% compliant with Malaysia PDPA 2010.','Saring calon secara adil, rancang latihan semula pasukan dan jadualkan temu duga dengan lancar sambil mematuhi sepenuhnya Akta Perlindungan Data Peribadi Malaysia 2010.','公平筛选候选人、规划团队技能提升并轻松安排面试，同时全面遵守马来西亚《2010年个人资料保护法》。'],
    ['Fair Screening Pipeline','Aliran Saringan Adil','公平筛选流程'],
    ['Strictly evaluates verifiable competency without scoring age or ethnicity.','Menilai kecekapan yang boleh disahkan tanpa memberi markah berdasarkan umur atau etnik.','仅评估可核实的能力，不按年龄或族群打分。'],
    ['Live Skills Heatmap','Peta Haba Kemahiran Langsung','实时技能热力图'],
    ['Benchmark applicant capabilities against team requirements and roles.','Bandingkan keupayaan pemohon dengan keperluan dan jawatan pasukan.','将申请者能力与团队需求及岗位要求进行对照。'],
    ['Direct Interview Dispatch','Jemputan Temu Duga Terus','直接发送面试邀请'],
    ['Send online video or in-person invitations directly into candidate dashboards.','Hantar jemputan temu duga video dalam talian atau bersemuka terus ke papan pemuka calon.','直接向候选人面板发送线上视频或现场面试邀请。'],
    ['AI Strategic Analytics','Analitik Strategik AI','AI 战略分析'],
    ['Data-driven expansion recommendations and custom printable reports.','Syor pengembangan berasaskan data dan laporan boleh cetak yang disesuaikan.','提供数据驱动的扩展建议和可定制的打印报告。'],
    ['Launch Employer Workspace →','Buka Ruang Kerja Majikan →','进入雇主工作区 →'],
    ['Try Demo: Nexus Digital Sdn Bhd','Cuba Demo: Nexus Digital Sdn Bhd','体验演示：Nexus Digital Sdn Bhd'],
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
    ['My profile','Profil saya','我的个人资料'],['Update your professional story','Kemas kini latar belakang profesional anda','更新你的职业经历'],
    ['Review my CV','Semak CV saya','检查我的简历'],['Check and refine your extracted details','Semak dan perkemas maklumat yang diekstrak','检查并完善提取出的资料'],
    ['Find opportunities','Cari peluang','寻找机会'],['Explore vacancies for your next move','Terokai kekosongan untuk langkah kerjaya seterusnya','寻找下一步职业发展的职位'],
    ['My applications','Permohonan saya','我的申请'],['Manage applications and CV access','Urus permohonan dan akses CV','管理申请和简历访问权限'],
    ['My professional profile','Profil profesional saya','我的职业档案'],
    ['View contact information and work preferences','Lihat maklumat hubungan dan pilihan kerja','查看联系信息和工作偏好'],
    ['Future Skills Radar','Radar Kemahiran Masa Depan','未来技能趋势雷达'],
    ['Future-Role Matches','Padanan Jawatan Masa Depan','未来岗位匹配'],
    ['answered','dijawab','已回答'],
    ['Profile Details','Butiran Profil','个人资料'],['Review CV','Semak CV','检查简历'],['My Applications','Permohonan Saya','我的申请'],
    ['Achievements & professional skills','Pencapaian & kemahiran profesional','成就与专业技能'],
    ['Projects & achievements','Projek & pencapaian','项目与成就'],['From your saved CV profile. These details are self-reported, not independently verified.','Daripada profil CV tersimpan anda. Maklumat ini dilaporkan sendiri dan belum disahkan secara bebas.','以下内容来自已保存的简历档案，由本人提供，尚未经过独立核实。'],
    ['Edit CV details →','Edit butiran CV →','编辑简历资料 →'],['Learning achievements →','Pencapaian pembelajaran →','学习成果 →'],
    ['No details added yet. Upload or review your CV to add them.','Belum ada butiran. Muat naik atau semak CV anda untuk menambahkannya.','尚未添加资料。请上传或检查简历以添加内容。'],
    ['Review your professional story','Semak kisah profesional anda','检查你的职业经历'],
    ['Work through one section at a time. Check the original PDF, refine your details, then save your reviewed CV.','Semak satu bahagian pada satu masa. Periksa PDF asal, kemas kini maklumat anda, kemudian simpan CV yang telah disemak.','逐项检查内容，核对原始 PDF、完善资料，然后保存审核后的简历。'],
    ['View Original PDF','Lihat PDF Asal','查看原始 PDF'],['Replace PDF','Gantikan PDF','替换 PDF'],['Your CV workspace','Ruang kerja CV anda','你的简历工作区'],
    ['No PDF yet','Belum ada PDF','尚无 PDF'],['Upload a PDF CV to extract your structured profile','Muat naik CV PDF untuk mengekstrak profil berstruktur anda','上传 PDF 简历以提取结构化档案'],
    ['Check the draft before sharing with employers','Semak draf sebelum berkongsi dengan majikan','与雇主分享前请先检查草稿'],
    ['Upload a sample or fictional PDF to begin.','Muat naik PDF contoh atau rekaan untuk bermula.','上传示例或虚构的 PDF 以开始。'],
    ['AI Profile & Experience Enhancer','Penambah Baik Profil & Pengalaman AI','AI 个人资料与经历优化工具'],
    ['Polish executive summary, optimize action verbs, and structure career achievements','Perkemas ringkasan profesional, kata kerja tindakan dan susunan pencapaian kerjaya','润色职业摘要、优化行动动词并整理职业成就'],
    ['Authorize AI assistant to polish and format this draft','Benarkan pembantu AI mengemas dan memformat draf ini','授权 AI 助手润色并整理此草稿'],
    ['Professional Summary','Ringkasan Profesional','职业摘要'],['Write or review your executive summary. Highlight your core expertise and career background.','Tulis atau semak ringkasan profesional anda. Serlahkan kepakaran utama dan latar belakang kerjaya.','撰写或检查职业摘要，突出核心专长和职业背景。'],
    ['Contact & career preferences','Maklumat hubungan & pilihan kerjaya','联系资料与职业偏好'],
    ['Your contact details, target occupation, and work preferences','Maklumat hubungan, pekerjaan sasaran dan pilihan kerja anda','你的联系资料、目标职业和工作偏好'],
    ['Identity & Contact Details','Identiti & Maklumat Hubungan','身份与联系资料'],
    ['Primary contact information used by prospective employers for verification and outreach.','Maklumat hubungan utama untuk pengesahan dan komunikasi oleh bakal majikan.','潜在雇主用于核实身份和联系你的主要资料。'],
    ['Full Legal Name','Nama Penuh Mengikut Kad Pengenalan','法定全名'],['Target / Current Occupation','Pekerjaan Sasaran / Semasa','目标／当前职业'],
    ['Primary Email Address','Alamat E-mel Utama','主要电子邮件地址'],['Contact Phone (+60)','Nombor Telefon (+60)','联系电话（+60）'],
    ['Current Location / State of Residence','Lokasi Semasa / Negeri Kediaman','目前所在地／居住州属'],
    ['Career Preferences & Workplace Style','Pilihan Kerjaya & Gaya Kerja','职业偏好与工作方式'],
    ['Define your target industry domain, workplace flexibility, and qualification credentials.','Nyatakan industri sasaran, fleksibiliti tempat kerja dan kelayakan anda.','设定目标行业、工作方式灵活度和学历资格。'],
    ['Target Industry Sector','Sektor Industri Sasaran','目标行业'],['Preferred Work Mode','Mod Kerja Pilihan','偏好的工作模式'],
    ['Highest Qualification Level','Tahap Kelayakan Tertinggi','最高学历'],['Total Years of Experience','Jumlah Tahun Pengalaman','工作年限'],
    ['Enter 0 for fresh graduates or entry-level starters.','Masukkan 0 jika anda graduan baharu atau baru memulakan kerjaya.','应届毕业生或职场新人请填 0。'],
    ['Experience, education & projects','Pengalaman, pendidikan & projek','工作经历、教育与项目'],
    ['Open to review your professional history','Buka untuk menyemak sejarah profesional anda','展开查看职业经历'],
    ['Experience & Qualifications','Pengalaman & Kelayakan','工作经历与资格'],
    ['Structured history extracted from your CV. You can edit or add new entries directly.','Sejarah berstruktur yang diekstrak daripada CV. Anda boleh mengedit atau menambah maklumat di sini.','从简历提取的结构化经历。你可以直接编辑或添加内容。'],
    ['Work Experience','Pengalaman Kerja','工作经历'],['Education','Pendidikan','教育经历'],['Projects','Projek','项目'],['Certifications','Pensijilan','证书'],
    ['Extracted Skills & Competencies','Kemahiran & Kecekapan Diekstrak','提取的技能与能力'],
    ['Click × on any chip to remove','Klik × pada mana-mana label untuk membuangnya','点击任意标签上的 × 即可移除'],
    ['Original Extraction Quotes & Evidence','Petikan & Bukti Pengekstrakan Asal','原始提取引文与依据'],
    ['View quotes from PDF ▾','Lihat petikan daripada PDF ▾','查看 PDF 中的引文 ▾'],
    ['Quotes and page numbers from your PDF that supported the initial draft.','Petikan dan nombor halaman daripada PDF yang menyokong draf awal.','支持初始草稿的 PDF 引文和页码。'],
    ['I have verified the summary, contact details, and qualifications. Mark profile as reviewed.','Saya telah mengesahkan ringkasan, maklumat hubungan dan kelayakan. Tandakan profil sebagai telah disemak.','我已核实摘要、联系资料和学历资格。将档案标记为已审核。'],
    ['Track your applications and control who can view your CV.','Jejaki permohonan anda dan kawal pihak yang boleh melihat CV anda.','追踪申请，并管理谁可以查看你的简历。'],
    ['Find jobs →','Cari pekerjaan →','寻找职位 →'],['Your CV, your sharing choices','CV anda, pilihan perkongsian anda','你的简历，由你决定如何分享'],
    ['Private by default','Peribadi secara lalai','默认设为私密'],['Sharing & access','Perkongsian & akses','分享与访问权限'],
    ['Choose who can view your CV and review their access below.','Pilih pihak yang boleh melihat CV anda dan semak akses mereka di bawah.','选择可以查看简历的人，并在下方查看其访问权限。'],
    ['My applications & employer access','Permohonan saya & akses majikan','我的申请与雇主访问权限'],
    ['Share with someone you choose','Kongsi dengan individu pilihan anda','与指定对象分享'],
    ['The recipient needs a CareerLens account. Only that signed-in account can open the link. No email is sent.','Penerima memerlukan akaun CareerLens. Hanya akaun tersebut boleh membuka pautan ini. E-mel tidak dihantar.','接收者需要 CareerLens 账号，且只有该账号可以打开链接。系统不会发送电子邮件。'],
    ['Recipient account email','E-mel akaun penerima','接收者账号邮箱'],['Access expires after','Akses tamat selepas','访问权限到期时间'],
    ['Create recipient access','Beri akses kepada penerima','创建接收者访问权限'],['Recent recipient access','Akses penerima terkini','最近的接收者访问记录'],
    ['Employer CV access log','Log akses CV majikan','雇主简历访问记录'],['Recorded employer accesses through this app','Rekod akses majikan melalui aplikasi ini','此应用记录的雇主访问'],
    ['Application Questionnaire & Skill Verification','Soal Selidik Permohonan & Pengesahan Kemahiran','申请问卷与技能验证'],
    ['Targeted scenarios generated based on your uploaded CV and target role.','Senario khusus dijana berdasarkan CV yang dimuat naik dan jawatan sasaran anda.','根据你上传的简历和目标岗位生成针对性情景题。'],
    ['CareerLens Core Questionnaire','Soal Selidik Teras CareerLens','CareerLens 核心问卷'],
    ['All fields are required. Select your preferred field first to unlock tailored role suggestions and district options.','Semua ruangan wajib diisi. Pilih bidang pilihan anda dahulu untuk melihat cadangan jawatan dan pilihan daerah yang sesuai.','所有栏位均为必填。请先选择偏好领域，以获取匹配的岗位建议和地区选项。'],
    ['AI Connected & Ready','AI Disambungkan & Sedia','AI 已连接并就绪'],
    ['AI enhancement is optional. Fast local extraction is active.','Penambahbaikan AI adalah pilihan. Pengekstrakan setempat pantas sedang aktif.','AI 优化为可选功能。目前已启用快速本地提取。'],
    ['Use our domain-trained AI engine to intelligently polish your extracted CV draft into recruiter-ready format before saving.','Gunakan enjin AI khusus bidang kami untuk memperkemas draf CV yang diekstrak menjadi format yang sedia dinilai perekrut sebelum disimpan.','使用我们经过领域训练的 AI 引擎，在保存前将提取的简历草稿整理成便于招聘人员阅读的格式。'],
    ['Allow AI assistant to analyze and organize resume highlights for this draft.','Benarkan pembantu AI menganalisis dan menyusun sorotan resume untuk draf ini.','允许 AI 助手分析并整理此草稿中的简历重点。'],
    ['Enhance with AI','Perkemas dengan AI','使用 AI 优化'],['Optional','Pilihan','可选'],
    ['Career Stage','Peringkat Kerjaya','职业阶段'],['Target Industry','Industri Sasaran','目标行业'],['Target Role','Jawatan Sasaran','目标岗位'],
    ['Career Motivation','Motivasi Kerjaya','职业动机'],['Location / State','Lokasi / Negeri','地点／州属'],['District / Area','Daerah / Kawasan','县区／地区'],
    ['Specific Area','Kawasan Khusus','具体地区'],['Workplace Mode','Mod Tempat Kerja','工作方式'],['Expected Salary','Gaji Dijangka','期望薪资'],
    ['Availability','Ketersediaan','可入职时间'],['Work Style','Gaya Kerja','工作风格'],['3–5 Year Horizon','Matlamat 3–5 Tahun','未来 3–5 年规划'],
    ['Calibrates role seniority, expected learning curves, and benchmark percentiles.','Menentukan tahap jawatan, jangkaan pembelajaran dan kedudukan penanda aras.','用于评估岗位资历、预期学习曲线和基准百分位。'],
    ['Unlocks tailored roles, industry competencies, and local salary brackets.','Membuka cadangan jawatan, kompetensi industri dan julat gaji tempatan yang bersesuaian.','显示匹配的岗位、行业能力要求和本地薪资范围。'],
    ['Your target occupation for AI gap analysis and relevant nearby openings.','Pekerjaan sasaran anda untuk analisis jurang AI dan peluang kerja berdekatan.','用于 AI 技能差距分析和附近职位推荐的目标职业。'],
    ['Helps match company culture and growth opportunities with your priorities.','Membantu memadankan budaya syarikat dan peluang perkembangan dengan keutamaan anda.','帮助根据你的偏好匹配企业文化和发展机会。'],
    ['Sets your geographic focal point across Malaysia.','Menetapkan lokasi tumpuan anda di Malaysia.','设定你在马来西亚的地理定位。'],
    ['Narrows down local commute radius and employer cluster proximity.','Mengecilkan lingkungan perjalanan dan mencari kelompok majikan berdekatan.','缩小通勤范围并查找附近的雇主聚集区。'],
    ['Type your specific town or township name.','Taip nama bandar atau pekan anda.','输入具体的城市或镇区名称。'],
    ['Specify your ideal balance between on-site and remote flexibility.','Nyatakan keseimbangan pilihan antara kerja di pejabat dan jarak jauh.','说明你对现场办公与远程工作的偏好。'],
    ['Compared anonymously with current market medians and employer budgets.','Dibandingkan secara tanpa nama dengan median pasaran semasa dan bajet majikan.','将与当前市场中位数和雇主预算进行匿名比较。'],
    ['Informs hiring teams of your transition timeline and notice period.','Memaklumkan pasukan pengambilan tentang tempoh peralihan dan notis anda.','让招聘团队了解你的入职时间和通知期。'],
    ['Aligns your autonomous vs. team collaboration preferences.','Memadankan pilihan anda antara kerja kendiri dan kerjasama pasukan.','了解你对独立工作与团队协作的偏好。'],
    ['Guides AI to recommend upskilling pathways and leadership milestones.','Membantu AI mencadangkan laluan peningkatan kemahiran dan sasaran kepimpinan.','帮助 AI 推荐技能提升路径和领导力目标。'],
    ['Required','Wajib','必填'],['Answered','Dijawab','已回答'],['🔒 Dependent','🔒 Bergantung','🔒 需先完成前项'],
    ['Select an option…','Pilih satu pilihan…','请选择一项…'],['👉 Choose the field above first','👉 Pilih bidang di atas dahulu','👉 请先选择上方的领域'],
    ['👉 Choose the state above first','👉 Pilih negeri di atas dahulu','👉 请先选择上方的州属'],
    ['Please select your Preferred Field first to unlock matching roles','Sila pilih Bidang Pilihan dahulu untuk melihat padanan jawatan','请先选择偏好领域以查看匹配岗位'],
    ['Please select your Preferred State first to choose districts','Sila pilih Negeri Pilihan dahulu untuk memilih daerah','请先选择偏好州属以选择县区'],
    ['AI Workforce Radar','Radar Tenaga Kerja AI','AI 职场趋势雷达'],
    ['Future Skills & AI Disruption Radar','Radar Kemahiran Masa Depan & Gangguan AI','未来技能与 AI 变革趋势雷达'],
    ['Clear breakdown of what AI automates vs. your human advantage in the Malaysian market.','Perincian jelas tentang tugas yang diautomasikan AI dan kelebihan manusia dalam pasaran Malaysia.','清楚展示马来西亚市场中 AI 可自动化的工作，以及你的个人优势。'],
    ['Moderate Pace','Kadar Sederhana','中等速度'],['Fast Disruption (2.2x)','Perubahan Pantas (2.2x)','快速变革（2.2 倍）'],
    ['Routine Automation Risk','Risiko Automasi Rutin','常规工作自动化风险'],['Moderate Threat','Ancaman Sederhana','中等威胁'],['Rapid Threat','Ancaman Pantas','快速威胁'],
    ['Routine manual entries & standard checklists are shifting to AI.','Kemasukan data rutin dan senarai semak standard semakin diautomasikan oleh AI.','常规手动录入和标准清单工作正逐渐转由 AI 处理。'],
    ['Human Moat Demand','Permintaan Kemahiran Unik Manusia','人类独特优势需求'],['Surging Hiring','Pengambilan Meningkat Pesat','招聘需求快速上升'],
    ['Strategic judgment, compliance & client communication.','Pertimbangan strategik, pematuhan dan komunikasi pelanggan.','战略判断、合规能力与客户沟通。'],
    ['Career Resilience Tier','Tahap Ketahanan Kerjaya','职业韧性等级'],['Strong Defense','Perlindungan Kukuh','防护力强'],
    ['High upward mobility into supervisory audit roles.','Peluang kemajuan tinggi ke jawatan penyeliaan audit.','有较大机会晋升至审计主管岗位。'],
    ['5-Dimensional Competency Radar','Radar Kompetensi 5 Dimensi','五维能力雷达图'],
    ['Benchmark your capabilities across key future-of-work vectors.','Bandingkan keupayaan anda berdasarkan dimensi utama pekerjaan masa depan.','根据未来工作关键维度评估你的能力。'],
    ['Scenario blend:','Gabungan senario:','情景组合：'],['Baseline (2026-2028)','Asas (2026–2028)','基准情景（2026–2028）'],
    ['Rapid Disruption (AI Agents)','Perubahan Pantas (Ejen AI)','快速变革（AI 智能体）'],
    ['What AI Takes Over','Tugas yang Diambil Alih AI','AI 将接手的工作'],['Routine, repetitive manual workflows','Aliran kerja manual yang rutin dan berulang','常规、重复的手动工作流程'],
    ['Automation >65%','Automasi >65%','自动化程度 >65%'],['Where Humans Win','Kelebihan Manusia','人类的优势'],
    ['Judgment, compliance & strategic trust','Pertimbangan, pematuhan dan kepercayaan strategik','判断力、合规能力与战略信任'],['Demand +50%','Permintaan +50%','需求增长 +50%'],
    ['3 Quick Action Steps to Protect Your Career','3 Langkah Pantas untuk Melindungi Kerjaya','保护职业发展的 3 个行动步骤'],
    ['How to bulletproof your profile against AI obsolescence.','Cara mengukuhkan profil anda daripada risiko kemahiran lapuk akibat AI.','如何增强个人档案，降低 AI 导致技能过时的风险。'],
    ['Automate the Routine','Automatikkan Tugas Rutin','自动化常规工作'],['Master Rules & Compliance','Kuasai Peraturan & Pematuhan','掌握规则与合规要求'],
    ['Be the Reviewer, Not Preparer','Jadi Penyemak, Bukan Penyedia','成为审核者，而非单纯的资料准备者'],['Action Step','Langkah Tindakan','行动步骤'],
    ['Exceptional Fit','Padanan Cemerlang','高度匹配'],['Strong Fit','Padanan Kukuh','匹配度高'],['Growth Fit','Potensi Perkembangan','成长型匹配'],['Top Choice','Pilihan Utama','首选'],
    ['High Market Demand','Permintaan Pasaran Tinggi','市场需求高'],['Steady Demand','Permintaan Stabil','需求稳定'],['Fit Score','Skor Padanan','匹配分数'],
    ['Estimated Monthly:','Anggaran Gaji Bulanan:','预计月薪：'],['Outlook:','Unjuran:','市场前景：'],['Your Verified Strengths','Kekuatan Anda yang Disahkan','已核实的个人优势'],
    ['Skills to Gain for this Role','Kemahiran untuk Dikuasai bagi Jawatan Ini','此岗位需要提升的技能'],
    ['All core competencies matched!','Semua kompetensi teras sepadan!','核心能力均已匹配！'],['Browse jobs in this field','Lihat pekerjaan dalam bidang ini','浏览此领域的职位'],
    ['Find Jobs →','Cari Pekerjaan →','寻找职位 →'],['Reskilling Plan →','Pelan Latihan Semula →','技能提升计划 →'],
    ['Build the skills for your target role. Start with your next learning goal, then follow the path below.','Bina kemahiran untuk jawatan sasaran anda. Mulakan dengan matlamat pembelajaran seterusnya, kemudian ikuti laluan di bawah.','提升目标岗位所需技能。先从下一个学习目标开始，再沿着下方路径学习。'],
    ['Your learning overview','Gambaran pembelajaran anda','学习概览'],['✓ Completed Learning','✓ Pembelajaran Selesai','✓ 已完成的学习'],
    ['These courses are recommended based on your selected target role and the skills you still need to improve.','Kursus ini dicadangkan berdasarkan jawatan sasaran dan kemahiran yang masih perlu anda tingkatkan.','这些课程根据你选择的目标岗位及仍需提升的技能推荐。'],
    ['Follow the cards from left to right. Open a step for details.','Ikuti kad dari kiri ke kanan. Buka langkah untuk melihat butiran.','从左向右依次查看卡片，展开步骤可了解详情。'],
    ['All core competencies matched!','Semua kompetensi teras sepadan!','核心能力均已匹配！'],
    ['What this path connects to the SDGs','Hubungan laluan ini dengan SDG','此学习路径与 SDG 的关联'],
    ['Add your practice project to your CV.','Tambahkan projek latihan anda pada CV.','把实践项目加入简历。'],
    ['Choose your next career goal','Pilih matlamat kerjaya seterusnya','选择下一个职业目标'],
    ['A little learning. A lasting journey.','Sedikit pembelajaran. Perjalanan bermakna.','点滴学习，成就长远成长。'],
    ['Open my passport','Buka pasport saya','打开我的护照'],['Every small step leaves a mark.','Setiap langkah kecil meninggalkan kesan.','每一小步，都值得留下印记。'],
    ['Your personal SDG learning journey','Perjalanan pembelajaran SDG peribadi anda','你的个人 SDG 学习旅程'],['Passport holder','Pemegang pasport','护照持有人'],
    ['Gold stamp = completed learning. Empty circle = a milestone to explore.','Cop emas = pembelajaran selesai. Bulatan kosong = pencapaian untuk diteroka.','金色印章代表已完成学习；空心圆圈代表可探索的里程碑。'],
    ['Stamp earned','Cop diperoleh','已获得印章'],['Your completed learning behind this stamp','Pembelajaran selesai yang memperoleh cop ini','获得此印章所对应的已完成学习'],
    ['Complete a mapped course and mark it Completed to collect this stamp.','Lengkapkan kursus yang dipadankan dan tandakannya Selesai untuk memperoleh cop ini.','完成匹配课程并将状态标记为“已完成”，即可获得此印章。'],
    ['No course in your current learning paths maps to this goal yet. It stays open for a future milestone.','Belum ada kursus dalam laluan pembelajaran semasa yang dipadankan dengan matlamat ini. Pencapaian ini kekal terbuka untuk masa hadapan.','当前学习路径中还没有与此目标匹配的课程，可留待之后完成。'],
    ['Self-reported learning milestones, saved on this device.','Pencapaian pembelajaran dilaporkan sendiri dan disimpan pada peranti ini.','学习里程碑由你自行记录，并保存在此设备上。'],
    ['Manual 3-Way Invoice & PO Matching','Padanan Manual Invois & Pesanan Belian 3 Hala','人工核对发票与采购订单'],
    ['Automated ERP pipelines and OCR extraction eliminate repetitive checks.','Saluran ERP automatik dan pengekstrakan OCR menghapuskan semakan berulang.','自动化 ERP 流程和 OCR 提取减少重复核对工作。'],
    ['Standard Periodic Trial Balance Compilation','Penyediaan Imbangan Duga Berkala Standard','定期编制标准试算表'],
    ['Continuous accounting models update ledger variance automatically.','Model perakaunan berterusan mengemas kini perbezaan lejar secara automatik.','持续会计模型会自动更新分类账差异。'],
    ['Basic Regulatory Checklist Tick-and-Bash','Semakan Asas Senarai Semak Peraturan','基础监管清单核对'],
    ['Rules-based AI engines scan 100% of transactions for red flags.','Enjin AI berasaskan peraturan mengimbas semua transaksi untuk mengesan tanda amaran.','基于规则的 AI 引擎会扫描所有交易以识别风险信号。'],
    ['AI Prompt Governance & Audit Integrity','Tadbir Urus Prompt AI & Integriti Audit','AI 提示治理与审计完整性'],
    ['Ensures model outputs meet Malaysian Financial Reporting Standards (MFRS).','Memastikan output model mematuhi Malaysian Financial Reporting Standards (MFRS).','确保模型输出符合马来西亚财务报告准则（MFRS）。'],
    ['ESG & Sustainability Impact Reporting','Pelaporan Impak ESG & Kelestarian','ESG 与可持续发展影响报告'],
    ['Mandatory Bursa Malaysia climate disclosure requires human audit sign-off.','Pendedahan iklim Bursa Malaysia yang diwajibkan memerlukan pengesahan audit manusia.','Bursa Malaysia 强制要求的气候披露仍需人工审计签核。'],
    ['Cross-Ledger Fraud & Anomaly Auditing','Audit Penipuan & Anomali Merentas Lejar','跨账簿欺诈与异常审计'],
    ['Requires high domain intuition and investigative interview techniques.','Memerlukan pemahaman mendalam tentang bidang dan teknik temu bual penyiasatan.','需要深厚的领域判断力和调查访谈技巧。'],
    ["Shift positioning from 'Data Entry & Ledger Maintenance' to 'AI-Supervised Assurance & Financial Governance'.",'Alihkan fokus daripada kemasukan data dan penyelenggaraan lejar kepada jaminan serta tadbir urus kewangan yang diselia AI.','将职业定位从“数据录入与账簿维护”转向“AI 辅助的鉴证与财务治理”。'],
    ['Acquire certified expertise in MFRS 101/108 and Bursa ESG compliance frameworks.','Dapatkan pensijilan kepakaran dalam MFRS 101/108 dan rangka kerja pematuhan ESG Bursa.','取得 MFRS 101/108 和 Bursa ESG 合规框架的专业认证。'],
    ['Master agentic accounting workflows using Python/PowerBI to orchestrate 10x faster variance triage.','Kuasai aliran kerja perakaunan beragen menggunakan Python/PowerBI untuk mempercepat triage varians sehingga 10 kali ganda.','掌握使用 Python/PowerBI 的智能体会计流程，将差异初筛速度提升至 10 倍。'],
    ['Boilerplate CRUD & Scaffold Code Generation','Penjanaan Kod Asas CRUD & Rangka Kerja','CRUD 样板与脚手架代码生成'],
    ['Modern LLMs generate standard endpoints in seconds.','LLM moden menjana endpoint standard dalam beberapa saat.','现代大型语言模型可在数秒内生成标准接口。'],
    ['Basic Manual Regression & Smoke Testing','Ujian Regresi Manual & Ujian Asas','基础手动回归与冒烟测试'],
    ['Autonomous agentic test suites reproduce and fix edge cases.','Suite ujian beragen autonomi mengulang dan membaiki kes pinggir.','自主智能体测试套件能够复现并修复边界情况。'],
    ['Routine YAML Configuration & Container Setup','Konfigurasi YAML Rutin & Persediaan Kontena','常规 YAML 配置与容器设置'],
    ['Infra-as-code copilots handle cloud orchestrations.','Pembantu infra-as-code mengendalikan orkestrasi awan.','基础设施即代码助手可处理云端编排。'],
    ['AI System Architecture & RAG Pipelines','Seni Bina Sistem AI & Saluran RAG','AI 系统架构与 RAG 流程'],
    ['Design high-reliability retrieval and agent tool-calling networks.','Reka rangkaian pengambilan data dan panggilan alat ejen yang boleh dipercayai.','设计高可靠性的检索系统和智能体工具调用网络。'],
    ['Cybersecurity & Defensive PDPA Governance','Keselamatan Siber & Tadbir Urus PDPA Defensif','网络安全与 PDPA 防护治理'],
    ['Zero-trust verification and cryptographic privacy preservation.','Pengesahan sifar kepercayaan dan perlindungan privasi kriptografi.','零信任验证与加密隐私保护。'],
    ['Distributed High-Throughput Resilience','Ketahanan Teragih Berdaya Pemprosesan Tinggi','分布式高吞吐韧性'],
    ['Complex concurrency, distributed tracing, and zero-downtime migrations.','Keserentakan kompleks, penjejakan teragih dan migrasi tanpa masa henti.','复杂并发、分布式追踪和零停机迁移。'],
    ['Level up from code author to systems architect: focus on data pipelines, security, and cloud scalability.','Beralih daripada penulis kod kepada arkitek sistem dengan memberi tumpuan pada saluran data, keselamatan dan kebolehskalaan awan.','从代码编写者成长为系统架构师，专注于数据流程、安全和云端扩展能力。'],
    ['Integrate LLM eval harnesses and guardrails into production CI/CD.','Integrasikan rangka kerja penilaian LLM dan kawalan keselamatan dalam CI/CD produksi.','将 LLM 评估框架与安全护栏整合到生产 CI/CD 流程中。'],
    ['Highlight end-to-end domain problem-solving over generic language syntax.','Tonjolkan penyelesaian masalah bidang secara menyeluruh, bukan sekadar sintaks bahasa umum.','突出端到端的领域问题解决能力，而非只强调通用语言语法。'],
    ['Generic SEO Blog & Social Caption Writing','Penulisan Blog SEO Umum & Kapsyen Media Sosial','通用 SEO 博客与社交媒体文案撰写'],
    ['Commoditized by multi-modal generative engines.','Tugas ini semakin mudah digantikan oleh enjin generatif multimodal.','多模态生成式引擎正在使这类工作趋于商品化。'],
    ['Routine Social Calendar Scheduling','Penjadualan Kalendar Media Sosial Rutin','常规社交媒体日历排程'],
    ['Automated tools optimize post timing and format automatically.','Alat automatik mengoptimumkan masa dan format hantaran.','自动化工具会优化帖文发布时间和格式。'],
    ['Basic Stock Image Sourcing & Cropping','Carian & Pemotongan Imej Stok Asas','基础图库图片搜寻与裁剪'],
    ['AI generative image models replace standard stock photography.','Model imej generatif AI menggantikan fotografi stok standard.','AI 图像生成模型正在取代常规图库摄影。'],
    ['Omnichannel AI Attribution & Growth Analytics','Atribusi AI Omnikanal & Analitik Pertumbuhan','全渠道 AI 归因与增长分析'],
    ['Synthesizes customer LTV across cookieless tracking environments.','Menggabungkan nilai hayat pelanggan merentas persekitaran penjejakan tanpa kuki.','在无 Cookie 追踪环境中整合客户生命周期价值。'],
    ['Brand Authenticity & Influencer Partnerships','Keaslian Jenama & Kerjasama Pempengaruh','品牌真实性与网红合作'],
    ['Human relational trust and authentic community engagement.','Kepercayaan hubungan manusia dan penglibatan komuniti yang tulen.','建立人际信任并真诚地经营社群。'],
    ['High-Stakes Crisis PR & Brand Governance','Perhubungan Awam Krisis Berisiko Tinggi & Tadbir Urus Jenama','高风险危机公关与品牌治理'],
    ['Deep cultural nuance and strategic stakeholder communications.','Kepekaan budaya yang mendalam dan komunikasi strategik dengan pihak berkepentingan.','需要深入理解文化差异，并与利益相关方进行战略沟通。'],
    ['Transform into a quantitative growth strategist combining creative vision with SQL/Attribution data.','Beralih menjadi ahli strategi pertumbuhan kuantitatif dengan menggabungkan kreativiti, SQL dan data atribusi.','转型为量化增长策略师，将创意构想与 SQL/归因数据结合。'],
    ['Build proprietary creator relationships that cannot be algorithmically replicated.','Bina hubungan eksklusif dengan pencipta kandungan yang tidak boleh ditiru oleh algoritma.','建立无法由算法复制的创作者合作关系。'],
    ['Lead AI-assisted content pipelines with strict brand voice governance.','Pimpin saluran kandungan berbantukan AI dengan kawalan suara jenama yang ketat.','管理 AI 辅助内容流程，并严格维护品牌语调。'],
    ['Repetitive Data Entry & Report Formatting','Kemasukan Data Berulang & Pemformatan Laporan','重复数据录入与报告格式整理'],
    ['RPA and LLM document processors ingest data directly.','RPA dan pemproses dokumen LLM memasukkan data secara terus.','RPA 和大型语言模型文档处理工具可直接录入数据。'],
    ['First-Line Inquiry Routing & Email Sorting','Penghalaan Pertanyaan Barisan Hadapan & Pengisihan E-mel','一线咨询分流与邮件分类'],
    ['Intelligent agent triage routes and resolves common tickets.','Triage ejen pintar menghala dan menyelesaikan tiket biasa.','智能体分流可处理并解决常见工单。'],
    ['Standard Document Drafting & Transcription','Penyediaan Draf Dokumen & Transkripsi Standard','标准文档起草与转录'],
    ['Multi-modal audio-to-text models summarize meetings in real time.','Model audio-ke-teks multimodal merumuskan mesyuarat secara masa nyata.','多模态语音转文本模型可实时总结会议内容。'],
    ['Strategic Workflow & AI Tool Orchestration','Aliran Kerja Strategik & Orkestrasi Alat AI','战略工作流程与 AI 工具编排'],
    ['Connecting human business requirements with automated agent tools.','Menghubungkan keperluan perniagaan manusia dengan alat ejen automatik.','将人的业务需求与自动化智能体工具连接起来。'],
    ['Cross-Functional Stakeholder Negotiation','Rundingan Pihak Berkepentingan Rentas Fungsi','跨职能利益相关方协商'],
    ['High emotional intelligence and alignment across executive teams.','Kecerdasan emosi tinggi dan penyelarasan antara pasukan eksekutif.','需要高情商，并协调不同管理团队的目标。'],
    ['Domain Ethics, Privacy (PDPA) & Quality Control','Etika Bidang, Privasi (PDPA) & Kawalan Kualiti','领域伦理、隐私（PDPA）与质量控制'],
    ['Accountability and human-in-the-loop verification.','Kebertanggungjawaban dan pengesahan dengan penglibatan manusia.','确保责任落实，并由人工参与核验。'],
    ['Focus on strategic problem framing and cross-functional leadership.','Fokus pada pembingkaian masalah strategik dan kepimpinan rentas fungsi.','专注于战略问题定义和跨职能领导力。'],
    ['Adopt AI tools to 3x your individual productivity while becoming the team champion.','Gunakan alat AI untuk meningkatkan produktiviti individu sehingga 3 kali ganda dan menjadi peneraju AI pasukan.','采用 AI 工具将个人效率提升至 3 倍，同时成为团队中的 AI 推动者。'],
    ['Specialize in high-context domain decisions where automated confidence is low.','Kuasai keputusan bidang yang memerlukan konteks mendalam dan tahap keyakinan automasi yang rendah.','专注于高度依赖领域背景、自动化系统把握度较低的决策。'],
    ['Recruitment Analytics & Charts','Analitik & Carta Pengambilan Pekerja','招聘分析与图表'],
    ['AI Growth & Expansion Advisory','Nasihat Pertumbuhan & Pengembangan AI','AI 增长与业务拓展建议'],
    ['Top Recommendations Podium','Senarai Tiga Cadangan Teratas','热门推荐榜'],
    ['Company Pulse & Vacancies','Status Syarikat & Jawatan Kosong','公司动态与职位空缺'],
    ['Trained AI Strategic Workforce & Expansion Advisory','Nasihat Strategik Tenaga Kerja & Pengembangan Berasaskan AI Terlatih','经训练的 AI 战略人才与业务拓展建议'],
    ['Macro-economic data models & talent pipeline growth forecasts (IT 2030 & Future Demand)','Model data makroekonomi & ramalan pertumbuhan saluran bakat (IT 2030 & Permintaan Masa Depan)','宏观经济数据模型与人才管道增长预测（IT 2030 与未来需求）'],
    ['Model: Trained Workforce Forecaster','Model: Peramal Tenaga Kerja Terlatih','模型：经训练的人才预测器'],
    ['Is Current Hiring Beneficial to Growth?','Adakah Pengambilan Pekerja Semasa Menyokong Pertumbuhan?','目前的招聘是否有助于业务增长？'],
    ['Yes, exceptionally positive.','Ya, kesannya amat positif.','是的，效果非常显著。'],
    ['78% of current candidate matches cluster in quantitative data engineering and cloud workflows. This direct alignment prevents costly recruitment cycles and reduces onboarding overhead by an estimated 32 days per hire.','78% padanan calon semasa tertumpu pada kejuruteraan data kuantitatif dan aliran kerja awan. Padanan ini mengurangkan proses pengambilan yang mahal serta menjimatkan anggaran 32 hari bagi orientasi setiap pekerja.','目前 78% 的候选人匹配集中在量化数据工程和云端工作流程领域。直接匹配可减少高成本的招聘流程，并预计每位新员工的入职准备时间可缩短 32 天。'],
    ['Recommended Market Expansion Vectors','Cadangan Bidang Pengembangan Pasaran','建议拓展的市场方向'],
    ['1. AI Financial Auditing & Automation:','1. Audit Kewangan & Automasi AI:','1. AI 财务审计与自动化：'],
    ['Combine Python and database talent to offer high-margin continuous compliance auditing.','Gabungkan bakat Python dan pangkalan data untuk menawarkan audit pematuhan berterusan yang memberikan margin tinggi.','整合 Python 与数据库人才，提供高利润的持续合规审计服务。'],
    ['2. ASEAN ESG & Green Finance Analytics:','2. Analitik ESG ASEAN & Kewangan Hijau:','2. 东盟 ESG 与绿色金融分析：'],
    ['Capitalize on mandatory sustainability reporting mandates by pairing data analysts with ESG frameworks.','Manfaatkan kewajipan pelaporan kemampanan dengan menggabungkan penganalisis data dan rangka kerja ESG.','结合数据分析人才与 ESG 框架，把握强制可持续发展报告带来的机会。'],
    ['Company Specialization & Hiring Moat','Pengkhususan Syarikat & Kelebihan Daya Saing Pengambilan','公司专业优势与招聘护城河'],
    ['Your company currently maintains deep core strength in','Syarikat anda kini mempunyai kepakaran teras yang kukuh dalam','贵公司目前在以下领域拥有深厚的核心优势：'],
    ['Cloud Application Architecture & Quantitative Modeling','Seni Bina Aplikasi Awan & Pemodelan Kuantitatif','云应用架构与量化建模'],
    ['To unlock high-tier institutional enterprise accounts, prioritize recruiting 1 Principal Solutions Architect.','Untuk mendapatkan pelanggan perusahaan institusi bertaraf tinggi, utamakan pengambilan seorang Arkitek Penyelesaian Utama.','为拓展高端机构及企业客户，建议优先招聘一名首席解决方案架构师。'],
    ['Applicant Screening','Saringan Pemohon','候选人筛选'],
    ['Skills & Heatmap Comparison','Perbandingan Kemahiran & Peta Haba','技能与热力图比较'],
    ['Shortlisting & Pipeline','Senarai Pendek & Saluran Pengambilan','候选人入围与招聘流程'],
    ['Total screened','Jumlah disaring','已筛选总数'],
    ['Priority review','Semakan keutamaan','优先审核'],
    ['Confirm skills','Pengesahan kemahiran','确认技能'],
    ['Average match','Purata padanan','平均匹配度'],
    ['HR Decision Status Legend & Review Workflow','Petunjuk Status Keputusan HR & Aliran Kerja Semakan','HR 决策状态说明与审核流程'],
    ['Decisions update pipeline instantly & sync to shortlisted candidates','Keputusan mengemas kini saluran serta-merta dan disegerakkan kepada calon dalam senarai pendek','决策会即时更新招聘流程，并同步至入围候选人'],
    ['Default Status','Status Lalai','默认状态'],
    ['Interview Ready','Sedia untuk Temu Duga','可安排面试'],
    ['Clarification','Penjelasan','待确认'],
    ['Talent Reserve','Simpanan Bakat','人才储备'],
    ['Initial Queue:','Barisan Awal:','初始队列：'],
    ['Newly received CV profile awaiting primary HR criteria review.','Profil CV yang baru diterima sedang menunggu semakan awal berdasarkan kriteria HR.','新收到的简历档案，等待 HR 按照基本条件进行初审。'],
    ['Qualified Profile:','Profil Layak:','合格档案：'],
    ['Exceeds core requirements; unlocked for 1st/2nd round interviews.','Melebihi keperluan teras; layak dipertimbangkan untuk temu duga pusingan pertama atau kedua.','符合并超过核心要求，可进入第一轮或第二轮面试。'],
    ['Verification Needed:','Pengesahan Diperlukan:','需要核实：'],
    ['High potential with specific CV gaps requiring interviewer confirmation.','Berpotensi tinggi dengan jurang khusus dalam CV yang perlu disahkan oleh penemu duga.','候选人潜力较高，但简历中有些具体信息需要面试官确认。'],
    ['Passive Pool:','Kumpulan Simpanan:','储备人才库：'],
    ['Retained in company database for adjacent or future department openings.','Disimpan dalam pangkalan data syarikat untuk jawatan berkaitan atau kekosongan jabatan pada masa hadapan.','保留在公司人才库中，以便匹配相关岗位或未来部门职位。'],
    ['Pending','Menunggu','待处理'],
    ['Shortlist','Senarai Pendek','列入候选名单'],
    ['Needs Review','Perlu Disemak','需要审核'],
    ['Hold','Ditangguhkan','暂缓'],
    ['Create or select a vacancy to screen candidates.','Cipta atau pilih jawatan kosong untuk menyaring calon.','请创建或选择一个职位以筛选候选人。'],
    ['Candidate','Calon','候选人'],
    ['Relevant exp.','Pengalaman berkaitan','相关经验'],
    ['Match','Padanan','匹配度'],
    ['To confirm','Untuk disahkan','待确认'],
    ['Suggested action','Tindakan dicadangkan','建议操作'],
    ['HR decision','Keputusan HR','HR 决策'],
    ['Actions','Tindakan','操作'],
    ['Invite','Jemput','邀请'],
    ['All','Semua','全部'],
    ['Fresh Graduate','Graduan Baharu','应届毕业生'],
    ['Experienced','Berpengalaman','有经验者'],
    ['Career Changer','Penukar Kerjaya','转行人士'],
    ['Workforce Intelligence & Recruitment Analytics','Perisikan Tenaga Kerja & Analitik Pengambilan','人才情报与招聘分析'],
    ['Live aggregation across your active vacancies and applicant talent pool','Pengumpulan data langsung bagi jawatan kosong aktif dan kumpulan calon anda','实时汇总当前职位空缺与候选人才库数据'],
    ['Generate Executive Report','Jana Laporan Eksekutif','生成管理层报告'],
    ['Applications per Vacancy','Permohonan bagi Setiap Jawatan','每个职位的申请数'],
    ['Live Inflow','Aliran Masuk Langsung','实时申请'],
    ['Applicant volume distributed across open engineering and finance postings.','Jumlah pemohon mengikut iklan jawatan kejuruteraan dan kewangan yang dibuka.','工程与金融职位空缺的申请人数分布。'],
    ['Talent Skill Clusters','Kelompok Kemahiran Bakat','人才技能群组'],
    ['Core Competencies','Kecekapan Teras','核心能力'],
    ['Breakdown of primary skills present across candidate profiles.','Pecahan kemahiran utama dalam profil calon.','候选人档案中主要技能的分布情况。'],
    ['Experience & Seniority Mix','Gabungan Pengalaman & Tahap Senioriti','经验与资历构成'],
    ['Seniority Levels','Tahap Senioriti','资历级别'],
    ['Distribution between fresh talent, mid-level executors, and senior leads.','Taburan bakat baharu, tenaga kerja peringkat pertengahan dan ketua kanan.','应届人才、中级执行人员与高级主管的分布。'],
    ['Top 3 candidate recommendations','3 Cadangan Calon Teratas','排名前三的候选人推荐'],
    ['Ranking follows comparison filters and selected vacancy. Scores use job criteria; equal scores use candidate ID for stable ordering. HR makes the final decision.','Kedudukan mengikut penapis perbandingan dan jawatan yang dipilih. Skor berdasarkan kriteria kerja; ID calon digunakan untuk menyusun skor yang sama. Keputusan akhir dibuat oleh HR.','排名根据比较筛选条件和所选职位生成。分数依据岗位标准；分数相同时按候选人编号排序。最终决定由 HR 作出。'],
    ['Open vacancies','Jawatan kosong','职位空缺'],
    ['Candidate pool','Kumpulan calon','候选人才库'],
    ['Avg match','Purata padanan','平均匹配度'],
    ['Candidate CV coverage','Liputan CV calon','候选人简历覆盖率'],
    ['Screen','Saring','筛选'],
    ['No open vacancies. Create one to start screening.','Tiada jawatan kosong. Cipta jawatan untuk memulakan saringan.','目前没有职位空缺。请创建职位以开始筛选。'],
    ['Screen a vacancy to see the pipeline.','Saring jawatan kosong untuk melihat saluran pengambilan.','筛选职位后即可查看招聘流程。'],
    ['Fresh Graduate Experience Builder','Pembina Pengalaman Graduan Baharu','应届生经历整理工具'],
    ['Turn an assignment, final-year project, club activity, volunteering or internship into clear evidence of what you can do.','Tukarkan tugasan, projek tahun akhir, aktiviti kelab, kerja sukarela atau latihan industri kepada bukti jelas tentang kebolehan anda.','把课程作业、毕业项目、社团活动、志愿服务或实习经历整理成能力证明。'],
    ['Experience or project name','Nama pengalaman atau projek','经历或项目名称'],
    ['Type of experience','Jenis pengalaman','经历类型'],
    ['Assignment','Tugasan','课程作业'],
    ['Final-year project','Projek tahun akhir','毕业项目'],
    ['Club activity','Aktiviti kelab','社团活动'],
    ['Volunteering','Kerja sukarela','志愿服务'],
    ['Personal project','Projek peribadi','个人项目'],
    ['What did you personally do?','Apakah sumbangan khusus anda?','你本人具体做了什么？'],
    ['Describe your own tasks and contribution. You can write in your own words.','Terangkan tugas dan sumbangan anda sendiri. Anda boleh menulis dengan ayat sendiri.','请描述你亲自完成的任务和贡献，可以用自己的话填写。'],
    ['Tools or skills you used','Alat atau kemahiran yang digunakan','使用的工具或技能'],
    ['Outcome or result (optional)','Hasil atau pencapaian (pilihan)','成果或结果（选填）'],
    ['Create an editable CV bullet','Cipta poin CV yang boleh diedit','生成可编辑的简历要点'],
    ['This draft only uses the details you enter. Review it before adding it to your profile.','Draf ini hanya menggunakan butiran yang anda masukkan. Semak sebelum menambahkannya ke profil.','草稿只会使用你填写的资料。请先检查，再添加到个人档案。'],
    ['Review and edit your CV bullet','Semak dan edit poin CV anda','检查并编辑简历要点'],
    ['Add to Projects & achievements','Tambah ke Projek & pencapaian','添加到项目与成就'],
    ['Copy draft','Salin draf','复制草稿'],
    ['Add a project name and describe what you personally did.','Masukkan nama projek dan terangkan perkara yang anda lakukan sendiri.','请填写项目名称，并描述你本人完成的工作。'],
    ['Draft created. Check that every detail is accurate before saving.','Draf disediakan. Pastikan setiap butiran tepat sebelum menyimpan.','草稿已生成。保存前请确认每项内容准确无误。'],
    ['Upload a CV and create your profile before adding this to it.','Muat naik CV dan cipta profil sebelum menambahkannya.','请先上传简历并创建个人档案，再添加这项内容。'],
    ['This draft is already in Projects & achievements.','Draf ini sudah ada dalam Projek & pencapaian.','这份草稿已在“项目与成就”中。'],
    ['Added to Projects & achievements. Review and save your profile below.','Ditambah ke Projek & pencapaian. Semak dan simpan profil anda di bawah.','已添加到“项目与成就”。请在下方检查并保存个人档案。'],
    ['Draft copied.','Draf disalin.','草稿已复制。'],
    ['Select and copy the highlighted draft.','Pilih dan salin draf yang diserlahkan.','请选中并复制已选中的草稿。'],
    ['e.g. Final-year data analysis project','cth. Projek analisis data tahun akhir','例如：毕业数据分析项目'],
    ['e.g. Excel, data cleaning, teamwork','cth. Excel, pembersihan data, kerja berpasukan','例如：Excel、数据清理、团队合作'],
    ['e.g. Presented findings to the class','cth. Membentangkan dapatan kepada kelas','例如：向全班展示分析结果'],
    ['Prepare follow-up','Sediakan susulan','准备跟进邮件'],
    ['Prepare a polite follow-up','Sediakan e-mel susulan yang sopan','撰写礼貌的跟进邮件'],
    ['Email subject','Subjek e-mel','邮件主题'],
    ['Email draft','Draf e-mel','邮件草稿'],
    ['Copy follow-up','Salin e-mel susulan','复制跟进邮件'],
    ['the hiring team','pasukan pengambilan','招聘团队'],
    ['the role','jawatan tersebut','该职位'],
    ['Your name','Nama anda','你的姓名'],
    ['Follow-up:','Susulan:','跟进：'],
    ['Dear','Kepada','尊敬的'],
    ['hiring team,','pasukan pengambilan,','招聘团队：'],
    ['I hope you are well. I am following up on my application for','Saya harap anda sihat. Saya ingin membuat susulan tentang permohonan saya bagi','您好！我想跟进我申请的'],
    ['Application submitted:','Permohonan dihantar:','申请提交时间：'],
    ['I remain interested in the opportunity and would appreciate any update you can share about next steps.','Saya masih berminat dengan peluang ini dan menghargai sebarang maklumat tentang langkah seterusnya.','我仍然对这个机会感兴趣。如方便，烦请告知后续安排。'],
    ['Thank you for your time.','Terima kasih atas masa anda.','感谢您抽出时间。'],
    ['Kind regards,','Salam hormat,','此致'],
    ['recently','baru-baru ini','近期'],
    ['Follow-up draft copied.','Draf e-mel susulan disalin.','跟进邮件草稿已复制。'],
  ];
  const byEnglish = new Map(vocabulary.map(row => [row[0], row]));
  const reverse = new Map(vocabulary.flatMap(row => row.map(text => [text, row[0]])));
  let language = 'en';
  try { language = localStorage.getItem('careerlens_language') || localStorage.getItem('cl_language') || 'en'; } catch (_) {}
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
  function updateLanguageButtons() {
    document.querySelectorAll('.lang-opt-btn[data-lang]').forEach(button => {
      const selected = button.dataset.lang === language;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('!bg-white', selected);
      button.classList.toggle('!text-indigo-700', selected);
      button.classList.toggle('ring-2', selected);
      button.classList.toggle('ring-indigo-500', selected);
      button.classList.toggle('shadow-sm', selected);
    });
  }
  function setLanguage(nextLanguage) {
    if (!['en', 'ms', 'zh'].includes(nextLanguage)) return;
    language = nextLanguage;
    selector.value = language;
    try {
      localStorage.setItem('cl_language', language);
      localStorage.setItem('careerlens_language', language);
    } catch (_) {}
    updateLanguageButtons();
    apply();
  }
  selector.addEventListener('change', () => setLanguage(selector.value));
  updateLanguageButtons();
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
  window.careerLensLocale = {apply, translate, setLanguage, getLanguage: () => language};
  apply();
})();
