/* Catalog and dynamic portal copy. Canonical API data is never modified. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.portalI18n = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const rows = `
Trained strictly on CV, Reskilling & Fair HR|Dilatih khusus untuk CV, latihan semula & HR adil|专注于简历、技能提升与公平招聘
Chat with Lumi — Domain-Scoped CareerLens AI Mascot|Berbual dengan Lumi — pembantu AI khusus CareerLens|与 Lumi 对话 — CareerLens 专业 AI 助手
Lumi AI Copilot|Pembantu AI Lumi|Lumi AI 助手
Test out-of-scope guardrail|Uji perlindungan luar skop|测试超出服务范围的保护
Ask about your PDF CV, role match, courses, or HR...|Tanya tentang CV PDF, padanan jawatan, kursus atau HR...|询问 PDF 简历、岗位匹配、课程或人力资源问题……
AI is unavailable. Please retry.|AI tidak tersedia. Sila cuba lagi.|AI 暂不可用，请重试。

My Profile|Profil Saya|我的资料
Explore Careers|Terokai Kerjaya|探索职业
My Growth|Perkembangan Saya|我的成长
Nearby Jobs & Map|Pekerjaan Berdekatan & Peta|附近岗位与地图
Nearby hiring companies & open roles|Syarikat berdekatan yang mengambil pekerja & jawatan kosong|附近招聘企业与开放岗位
Hiring|Pengambilan Pekerja|招聘管理
Candidate Development|Pembangunan Calon|候选人发展
Our Portals|Portal Kami|我们的门户
Menu|Menu|菜单
Main navigation|Navigasi utama|主导航
Section navigation|Navigasi bahagian|页面导航
Toggle navigation|Buka/tutup navigasi|展开或收起导航
All basic fields are required. Choose your field before selecting a role.|Semua medan asas wajib diisi. Pilih bidang sebelum memilih jawatan.|所有基本资料均为必填。请先选择行业，再选择岗位。
Generate questions using your uploaded CV summary and chosen role. Your CV summary and basic answers are sent to Google Gemini when you press Generate.|Jana soalan berdasarkan ringkasan CV dan jawatan pilihan. Ringkasan CV dan jawapan asas dihantar ke Google Gemini apabila anda menekan Jana.|根据已上传的简历摘要和目标岗位生成问题。点击生成时，简历摘要和基本回答将发送至 Google Gemini。
AI executive summary extracted from your PDF CV...|Ringkasan AI yang diekstrak daripada CV PDF anda...|从 PDF 简历提取的 AI 摘要……
🔍 Search any role, skill, company, or sector...|🔍 Cari jawatan, kemahiran, syarikat atau sektor...|🔍 搜索岗位、技能、公司或行业……
Highlight why you are interested in this role...|Nyatakan sebab anda berminat dengan jawatan ini...|说明你对这个岗位感兴趣的原因……
Accountant|Akauntan|会计师
Accounts Assistant|Pembantu Akaun|会计助理
Tax Associate|Eksekutif Percukaian|税务专员
Payroll Executive|Eksekutif Penggajian|薪资专员
Financial Analyst|Penganalisis Kewangan|财务分析师
Management Accountant|Akauntan Pengurusan|管理会计师
Software Engineer|Jurutera Perisian|软件工程师
Frontend Developer|Pembangun Bahagian Hadapan|前端开发人员
Backend Developer|Pembangun Bahagian Belakang|后端开发人员
QA Engineer|Jurutera Jaminan Kualiti|质量保证工程师
Data Analyst|Penganalisis Data|数据分析师
Cybersecurity Analyst|Penganalisis Keselamatan Siber|网络安全分析师
IT Support Specialist|Pakar Sokongan IT|IT 支持专员
Cloud Engineer|Jurutera Awan|云计算工程师
Marketing Executive|Eksekutif Pemasaran|市场营销专员
Digital Marketing Specialist|Pakar Pemasaran Digital|数字营销专员
Content Writer|Penulis Kandungan|内容撰稿人
Public Relations Executive|Eksekutif Perhubungan Awam|公共关系专员
SEO Specialist|Pakar SEO|搜索引擎优化专员
Recruiter|Perekrut|招聘专员
HR Analyst|Penganalisis Sumber Manusia|人力资源分析师
Office Administrator|Pentadbir Pejabat|办公室行政人员
Learning & Development Executive|Eksekutif Pembelajaran & Pembangunan|学习与发展专员
Civil Engineer|Jurutera Awam|土木工程师
Mechanical Engineer|Jurutera Mekanikal|机械工程师
Electrical Engineer|Jurutera Elektrik|电气工程师
Process Engineer|Jurutera Proses|工艺工程师
Quality Engineer|Jurutera Kualiti|质量工程师
Healthcare|Penjagaan Kesihatan|医疗保健
Registered Nurse|Jururawat Berdaftar|注册护士
Pharmacist|Ahli Farmasi|药剂师
Medical Laboratory Technologist|Juruteknologi Makmal Perubatan|医学检验技师
Healthcare Administrator|Pentadbir Penjagaan Kesihatan|医疗行政人员
Teacher|Guru|教师
Lecturer|Pensyarah|讲师
Training Executive|Eksekutif Latihan|培训专员
Instructional Designer|Pereka Bentuk Pengajaran|教学设计师
Sales & Retail|Jualan & Peruncitan|销售与零售
Sales Executive|Eksekutif Jualan|销售专员
Account Manager|Pengurus Akaun Pelanggan|客户经理
Retail Supervisor|Penyelia Peruncitan|零售主管
Customer Success Executive|Eksekutif Kejayaan Pelanggan|客户成功专员
Hospitality & Tourism|Hospitaliti & Pelancongan|酒店与旅游
Hotel Executive|Eksekutif Hotel|酒店行政专员
Front Office Executive|Eksekutif Kaunter Hadapan|前台专员
Travel Consultant|Perunding Pelancongan|旅游顾问
Food & Beverage Supervisor|Penyelia Makanan & Minuman|餐饮主管
Logistics & Supply Chain|Logistik & Rantaian Bekalan|物流与供应链
Logistics Executive|Eksekutif Logistik|物流专员
Procurement Executive|Eksekutif Perolehan|采购专员
Supply Chain Analyst|Penganalisis Rantaian Bekalan|供应链分析师
Warehouse Supervisor|Penyelia Gudang|仓库主管
Banking & Insurance|Perbankan & Insurans|银行与保险
Banking Operations Executive|Eksekutif Operasi Perbankan|银行运营专员
Credit Analyst|Penganalisis Kredit|信贷分析师
Insurance Claims Executive|Eksekutif Tuntutan Insurans|保险理赔专员
Risk Analyst|Penganalisis Risiko|风险分析师
Design & Creative|Reka Bentuk & Kreatif|设计与创意
Graphic Designer|Pereka Grafik|平面设计师
UI/UX Designer|Pereka UI/UX|用户界面与体验设计师
Product Designer|Pereka Produk|产品设计师
Video Editor|Penyunting Video|视频剪辑师
Legal|Perundangan|法律
Legal Associate|Peguam Bersekutu|法律专员
Paralegal|Pembantu Guaman|律师助理
Compliance Executive|Eksekutif Pematuhan|合规专员
Manufacturing|Pembuatan|制造业
Production Executive|Eksekutif Pengeluaran|生产专员
Production Planner|Perancang Pengeluaran|生产计划员
Quality Assurance Executive|Eksekutif Jaminan Kualiti|质量保证专员
Manufacturing Technician|Juruteknik Pembuatan|制造技术员
Agriculture|Pertanian|农业
Agricultural Officer|Pegawai Pertanian|农业专员
Farm Supervisor|Penyelia Ladang|农场主管
Agronomist|Ahli Agronomi|农艺师
Agricultural Technician|Juruteknik Pertanian|农业技术员
Construction & Property|Pembinaan & Hartanah|建筑与房地产
Quantity Surveyor|Juruukur Bahan|工料测量师
Site Supervisor|Penyelia Tapak|工地主管
Property Executive|Eksekutif Hartanah|物业专员
Building Manager|Pengurus Bangunan|楼宇经理
Below RM 3,000|Bawah RM 3,000|低于 RM 3,000
Johor|Johor|柔佛
Kedah|Kedah|吉打
Kelantan|Kelantan|吉兰丹
Melaka|Melaka|马六甲
Negeri Sembilan|Negeri Sembilan|森美兰
Pahang|Pahang|彭亨
Pulau Pinang|Pulau Pinang|槟城
Penang|Pulau Pinang|槟城
Perak|Perak|霹雳
Perlis|Perlis|玻璃市
Sabah|Sabah|沙巴
Sarawak|Sarawak|砂拉越
Terengganu|Terengganu|登嘉楼
Selangor|Selangor|雪兰莪
Kuala Lumpur|Kuala Lumpur|吉隆坡
Johor Bahru|Johor Bahru|新山
W.P. Kuala Lumpur|W.P. Kuala Lumpur|吉隆坡联邦直辖区
W.P. Putrajaya|W.P. Putrajaya|布城联邦直辖区
Kuala Lumpur (KLCC)|Kuala Lumpur (KLCC)|吉隆坡（KLCC）
User|Pengguna|用户
PDPA Protected|Dilindungi PDPA|受 PDPA 保护
PDF-Only Upload|Muat Naik PDF Sahaja|仅支持上传 PDF
only for anonymised statistical trend analysis and your personal job/reskilling recommendations|hanya untuk analisis trend statistik tanpa identiti dan cadangan pekerjaan/latihan semula peribadi anda|仅用于匿名统计趋势分析及你的个性化岗位与技能提升推荐
. Employers|. Majikan|。雇主
cannot|tidak boleh|无法
1. Upload your PDF CV|1. Muat naik CV PDF anda|1. 上传 PDF 简历
.PDF ONLY|PDF SAHAJA|仅限 PDF
Drop your PDF CV here or|Letakkan CV PDF anda di sini atau|将 PDF 简历拖到此处，或
browse|pilih fail|浏览文件
Synthetic sample PDF CVs (for instant testing)|Contoh CV PDF sintetik (untuk ujian segera)|模拟 PDF 简历（用于快速测试）
1-click AI parse or download|Hurai dengan AI atau muat turun dengan satu klik|一键 AI 解析或下载
Employer CV access log|Log akses CV oleh majikan|雇主简历访问记录
Every company view of your CV is audited here|Setiap akses syarikat kepada CV anda direkodkan di sini|每次企业查看你的简历，都会在此记录
2. AI-Organised CV Summary|2. Ringkasan CV Disusun AI|2. AI 整理的简历摘要
Stored in private vault|Disimpan dalam simpanan peribadi|存储于私人文件库
Upload a PDF CV on the left to extract your structured profile|Muat naik CV PDF di sebelah kiri untuk mengekstrak profil berstruktur|在左侧上传 PDF 简历以提取结构化资料
👁️ View Original PDF|👁️ Lihat PDF Asal|👁️ 查看原始 PDF
✨ AI Executive Summary (Captured from PDF)|✨ Ringkasan AI (Daripada PDF)|✨ AI 简历摘要（从 PDF 提取）
Qualification level|Tahap kelayakan|学历等级
Years of experience|Tahun pengalaman|工作年限
💼 Work Experience|💼 Pengalaman Kerja|💼 工作经历
🎓 Education|🎓 Pendidikan|🎓 教育背景
🚀 Key Projects|🚀 Projek Utama|🚀 主要项目
🛰️ Use My GPS|🛰️ Gunakan GPS Saya|🛰️ 使用我的定位
🗺️ Nearby Hiring Companies Map|🗺️ Peta Syarikat Berdekatan yang Mengambil Pekerja|🗺️ 附近招聘企业地图
You|Anda|你
CV-Matched Sector|Sektor Sepadan CV|与简历匹配的行业
Other Sector|Sektor Lain|其他行业
🎯 Zoom Near Me|🎯 Zum Berdekatan Saya|🎯 查看我的附近
🌐 Fit All|🌐 Papar Semua|🌐 显示全部
Hover or click to inspect on map|Tuding atau klik untuk melihat pada peta|悬停或点击以在地图上查看
💼 Open Job Vacancies|💼 Jawatan Kosong Terbuka|💼 开放招聘岗位
🔒 Consent-Gated Apply|🔒 Permohonan dengan Persetujuan|🔒 授权后申请
Detailed role openings. Employers only receive your CV when you click Apply.|Butiran jawatan kosong. Majikan hanya menerima CV apabila anda mengklik Mohon.|查看岗位详情。只有点击申请后，雇主才会收到你的简历。
🎯 Matched to My CV|🎯 Sepadan dengan CV Saya|🎯 与我的简历匹配
🌐 All Open Roles|🌐 Semua Jawatan Terbuka|🌐 所有开放岗位
Consent-Gated Application|Permohonan dengan Persetujuan|授权申请
Apply for Role|Mohon Jawatan|申请岗位
🔒 Choose what to share with this employer:|🔒 Pilih maklumat untuk dikongsi dengan majikan ini:|🔒 选择向该雇主分享的内容：
Share AI-Organised CV Summary|Kongsi Ringkasan CV Disusun AI|分享 AI 整理的简历摘要
Allow employer to view Original Uploaded PDF CV|Benarkan majikan melihat CV PDF asal yang dimuat naik|允许雇主查看上传的原始 PDF 简历
Expected salary (RM)|Gaji dijangka (RM)|期望薪资（RM）
Notice period / availability|Tempoh notis / ketersediaan|离职通知期／可入职时间
Brief note to hiring manager (optional)|Nota ringkas kepada pengurus pengambilan (pilihan)|给招聘经理的简短留言（选填）
Cancel|Batal|取消
⬇ PDF|⬇ PDF|⬇ PDF
No employer has viewed your CV.|Tiada majikan melihat CV anda.|尚无雇主查看你的简历。
No entries extracted|Tiada entri diekstrak|未提取到记录
Classified Profile:|Profil Dikategorikan:|资料分类：
No employer has viewed your CV yet. Your CV stays private until you apply.|Belum ada majikan melihat CV anda. CV kekal peribadi sehingga anda memohon.|尚无雇主查看你的简历。申请前，简历保持私密。
No skills yet — upload a PDF CV or add below.|Belum ada kemahiran — muat naik CV PDF atau tambah di bawah.|尚无技能，请上传 PDF 简历或在下方添加。
Switch city...|Tukar bandar...|切换城市……
No hiring companies match this filter. Try clearing the search or sector filter.|Tiada syarikat sepadan. Cuba kosongkan carian atau penapis sektor.|没有符合条件的招聘企业。请尝试清除搜索或行业筛选。
Open hiring roles|Jawatan terbuka|开放招聘岗位
Show all open roles across all sectors →|Papar semua jawatan terbuka dalam semua sektor →|查看所有行业的开放岗位 →
✓ Applied|✓ Telah Memohon|✓ 已申请
★ CV Match|★ Padanan CV|★ 简历匹配
CV Shared|CV Dikongsi|简历已分享
· Status:|· Status:|· 状态：
Permissions|Kebenaran|授权范围
Withdraw|Tarik Balik|撤回
🔒 Private until you apply|🔒 Peribadi sehingga anda memohon|🔒 申请前保持私密
Save your profile to generate matches.|Simpan profil untuk menjana padanan.|保存资料后生成岗位匹配。
Zero PII Exposed|Tiada Maklumat Peribadi Didedahkan|未披露个人身份信息
No opted-in CVs yet|Belum ada CV dengan persetujuan|暂无已授权简历
Save your profile to generate your passport.|Simpan profil untuk menjana pasport anda.|保存资料后生成职业护照。
No PDF uploaded yet|Belum ada PDF dimuat naik|尚未上传 PDF
Upload a .pdf CV to unlock AI extraction and job applications|Muat naik CV .pdf untuk pengekstrakan AI dan permohonan pekerjaan|上传 PDF 简历以启用 AI 提取与岗位申请
✓ Stored in Private Vault|✓ Disimpan dalam Simpanan Peribadi|✓ 已存入私人文件库
Passport|Pasport|职业护照
Create or select a vacancy to screen candidates.|Cipta atau pilih jawatan kosong untuk menyaring calon.|创建或选择招聘岗位以筛选候选人。
Organised CV|CV Tersusun|整理后的简历
Original PDF|PDF Asal|原始 PDF
🔓 Candidate Applied · CV Access Granted|🔓 Calon Memohon · Akses CV Dibenarkan|🔓 候选人已申请 · 已获简历访问权限
This candidate explicitly applied to|Calon ini telah memohon secara jelas kepada|该候选人已主动申请
📋 View AI-Organised CV Summary|📋 Lihat Ringkasan CV Disusun AI|📋 查看 AI 整理的简历摘要
Organised CV not shared|CV tersusun tidak dikongsi|未分享整理后的简历
📄 Open Original PDF CV ↗|📄 Buka CV PDF Asal ↗|📄 打开原始 PDF 简历 ↗
🔒 Original PDF withheld by candidate|🔒 PDF asal tidak dikongsi oleh calon|🔒 候选人未授权分享原始 PDF
Audit Logged|Audit Direkodkan|已记录审计日志
Original PDF withheld|PDF asal tidak dikongsi|未分享原始 PDF
✨ AI Executive Summary (Captured from Candidate PDF)|✨ Ringkasan AI (Daripada PDF Calon)|✨ AI 简历摘要（从候选人 PDF 提取）
Contact (Shared via Application)|Maklumat Hubungan (Dikongsi melalui Permohonan)|联系方式（通过申请授权分享）
PDF Document Verification|Pengesahan Dokumen PDF|PDF 文件验证
🔒 Access to this CV has been recorded in the candidate's PDPA transparency log.|🔒 Akses CV ini telah direkodkan dalam log ketelusan PDPA calon.|🔒 本次简历访问已记录在候选人的 PDPA 透明度日志中。
🛡️ Out-of-Scope Guardrail|🛡️ Perlindungan Luar Skop|🛡️ 超出服务范围保护
🦉 Lumi AI · In-Scope|🦉 Lumi AI · Dalam Skop|🦉 Lumi AI · 服务范围内
Ask Lumi AI|Tanya Lumi AI|咨询 Lumi AI
Lumi · AI Owl Copilot|Lumi · Pembantu AI Burung Hantu|Lumi · AI 猫头鹰助手
Scoped AI|AI Berfokus|专用 AI 助手
🛡️ Domain-Trained: Answers Career/HR queries only|🛡️ Terlatih Khusus: Menjawab soalan kerjaya/HR sahaja|🛡️ 专业领域：仅回答职业与人力资源问题
Test Guardrail|Uji Perlindungan|测试范围保护
🦉 Lumi is analysing your live workspace data...|🦉 Lumi sedang menganalisis data ruang kerja anda...|🦉 Lumi 正在分析当前工作区数据……
Send|Hantar|发送
Could not update|Tidak dapat mengemas kini|更新失败
Your browser could not save this draft. Keep this page open.|Pelayar tidak dapat menyimpan draf. Pastikan halaman ini kekal terbuka.|浏览器无法保存草稿，请保持此页面打开。
Could not load the questionnaire. Please refresh and retry.|Tidak dapat memuatkan soal selidik. Sila muat semula dan cuba lagi.|无法加载问卷，请刷新后重试。
Your CV or basic information changed. Generate fresh questions to continue.|CV atau maklumat asas berubah. Jana soalan baharu untuk meneruskan.|简历或基本资料已改变，请重新生成问题以继续。
Upload your PDF CV in Profile & Skills first.|Muat naik CV PDF dalam Profil & Kemahiran dahulu.|请先在个人资料与技能页面上传 PDF 简历。
Choose your field first.|Pilih bidang anda dahulu.|请先选择行业。
Reading your CV and preparing a response…|Membaca CV dan menyediakan respons…|正在读取简历并准备回复……
Finding your best matching role…|Mencari jawatan paling sepadan…|正在寻找最适合你的岗位……
Suggestion unavailable. You can still choose your role.|Cadangan tidak tersedia. Anda masih boleh memilih jawatan.|暂时无法提供推荐，你仍可自行选择岗位。
Retry|Cuba Lagi|重试
Please enter at least 10 characters for every answer.|Sila masukkan sekurang-kurangnya 10 aksara bagi setiap jawapan.|每个回答请至少输入 10 个字符。
Questionnaire saved on this device. You can return to edit it at any time.|Soal selidik disimpan pada peranti ini. Anda boleh kembali untuk mengedit pada bila-bila masa.|问卷已保存到此设备，可随时返回编辑。
Upload your CV to receive a role suggestion.|Muat naik CV untuk mendapatkan cadangan jawatan.|上传简历以获取岗位推荐。
Choose a field to see your suggested role.|Pilih bidang untuk melihat cadangan jawatan.|选择行业以查看推荐岗位。
No suitable role found in this field.|Tiada jawatan sesuai ditemui dalam bidang ini.|该行业中暂未找到合适岗位。
Request stopped or timed out. Your draft is saved. Please retry.|Permintaan dihentikan atau tamat masa. Draf disimpan. Sila cuba lagi.|请求已停止或超时。草稿已保存，请重试。
Career & HR Copilot|Pembantu Kerjaya & HR|职业与人力资源助手

High match|Padanan tinggi|高匹配
★ High match|★ Padanan tinggi|★ 高匹配
Gold highlight: match score 85% or above. HR review required.|Sorotan emas: skor padanan 85% atau lebih. Semakan HR diperlukan.|金色标记：匹配度达到 85% 及以上，仍需 HR 审核。

Professional background|Latar belakang profesional|个人职业背景
Career preferences|Pilihan kerjaya|职业方向与偏好
Industry insights|Wawasan industri|行业趋势洞察
Career opportunities|Peluang kerjaya|职业机会探索
Learning & development|Pembelajaran & pembangunan|学习与技能提升
Sustainable career impact|Impak kerjaya lestari|职业发展与可持续影响
Explore employers|Terokai majikan|探索招聘企业
Hiring insights|Wawasan pengambilan|招聘洞察
Vacancy management|Pengurusan jawatan kosong|招聘职位管理
Applicant assessment|Penilaian pemohon|申请者评估
Skills & qualifications|Kemahiran & kelayakan|技能与资质分析
Candidate development|Pembangunan calon|候选人成长与培养

Scrollable data table|Jadual data boleh ditatal|可横向滚动的数据表格

CareerLens connects multiple companies and candidates. You are managing the employer workspace shown above.|CareerLens menghubungkan pelbagai syarikat dan calon. Anda mengurus ruang kerja majikan yang ditunjukkan di atas.|CareerLens 连接多家公司与求职者。您当前管理的是上方标示的雇主工作区。

Company workspace|Ruang kerja syarikat|公司工作区
Manage only your company’s vacancies and applicants.|Urus jawatan dan pemohon syarikat anda sahaja.|在此仅管理当前公司的职位与申请者。
Published under your current company workspace.|Disiarkan di bawah ruang kerja syarikat semasa.|职位将发布在当前公司工作区名下。

Hiring snapshot|Ringkasan pengambilan|招聘摘要
Average match score|Purata skor padanan|平均匹配度
Qualifications to confirm|Kelayakan perlu disahkan|资质待确认人数
Priority interview check|Semakan utama temu duga|面试优先确认项
Not listed in CV; ask for a project example.|Tidak disenaraikan dalam CV; minta contoh projek.|简历未列出，建议询问具体项目实例。
Calculated from current filters; missing skills need interview confirmation.|Dikira daripada penapis semasa; kemahiran yang tiada perlu disahkan dalam temu duga.|根据当前筛选计算；简历未列出的技能需通过面试确认。

IT Department|Jabatan IT|资讯科技部
Finance & Audit Department|Jabatan Kewangan & Audit|财务与审计部
Marketing Department|Jabatan Pemasaran|市场营销部
Compliance Department|Jabatan Pematuhan|合规部
Human Resources Department|Jabatan Sumber Manusia|人力资源部
Sustainability Department|Jabatan Kelestarian|可持续发展部
Data Privacy & Compliance Analyst|Penganalisis Privasi Data & Pematuhan|数据隐私与合规分析师

Top 3 CV skill coverage|Liputan kemahiran CV 3 calon terbaik|前三名岗位技能覆盖率

Candidate Skills & Qualifications Comparison|Perbandingan Kemahiran & Kelayakan Calon|候选人技能与资质对比
Include labelled demo candidates|Sertakan calon demo berlabel|包含已标注的演示候选人
Field / Industry|Bidang / Industri|业务领域
Position|Jawatan|目标岗位
Experience years|Tahun pengalaman|相关经验年数
Education Qualification|Kelayakan pendidikan|学历门槛
Any experience|Sebarang pengalaman|不限经验
Any qualification|Sebarang kelayakan|不限学历
Doctor|Kedoktoran|博士
Master|Sarjana|硕士
Undergraduate|Sarjana muda|本科
SPM / UEC|SPM / UEC|SPM／UEC
Intern / Trainee|Pelatih|实习／培训生
Other / To confirm|Lain-lain / Perlu disahkan|其他／待确认
Sort by|Susun mengikut|排序方式
Match score|Skor padanan|匹配度
Experience: high to low|Pengalaman: tinggi ke rendah|经验：从高到低
Education: high to low|Pendidikan: tinggi ke rendah|学历：从高到低
Name or skill|Nama atau kemahiran|姓名或技能
Matching candidates|Calon sepadan|符合条件的候选人
All positions|Semua jawatan|全部岗位
All fields|Semua bidang|全部领域
Education distribution|Taburan pendidikan|学历分布
CV evidence for required skills|Bukti CV untuk kemahiran diperlukan|岗位技能简历覆盖情况
Number of filtered candidates listing each skill; not a proficiency assessment.|Bilangan calon ditapis yang menyenaraikan kemahiran; bukan penilaian kecekapan.|显示筛选后简历列出各技能的人数，不代表已验证的熟练度。
Department / Position|Jabatan / Jawatan|部门／岗位
Education / Institution / Major|Pendidikan / Institusi / Pengkhususan|学历／院校／专业
CV details|Butiran CV|简历详情
Skills & experience|Kemahiran & pengalaman|技能与经历
Hard skills|Kemahiran teknikal|硬技能
Soft skills|Kemahiran insaniah|软技能
No candidates match these filters.|Tiada calon sepadan dengan penapis ini.|没有符合当前筛选条件的候选人。
No comparison data.|Tiada data perbandingan.|暂无对比数据。
No candidate for this position.|Tiada calon untuk kedudukan ini.|该名次暂无候选人。
Top 3 candidate recommendations|Cadangan 3 calon terbaik|前三名候选人推荐
Ranking follows comparison filters and selected vacancy. Scores use job criteria; equal scores use candidate ID for stable ordering. HR makes the final decision.|Kedudukan mengikut penapis dan jawatan terpilih. Skor menggunakan kriteria kerja; seri disusun mengikut ID calon. HR membuat keputusan akhir.|排名随对比筛选和职位更新。分数依据岗位条件，同分按候选人编号稳定排序，由 HR 最终决定。
Missing CV details need confirmation. Experience is CV-stated, not independently verified. Intern / Trainee is a status, not a degree; highest known qualification takes precedence.|Butiran CV yang tiada perlu disahkan. Pengalaman dinyatakan dalam CV dan belum disahkan. Pelatih ialah status, bukan ijazah; kelayakan tertinggi diutamakan.|简历缺失信息需确认，经验年数来自简历且未经独立验证。实习／培训生属于状态，统计优先使用已知最高学历。
Loading comparison…|Memuatkan perbandingan…|正在加载对比数据…
Demo mode: synthetic candidates are labelled.|Mod demo: calon sintetik dilabelkan.|演示模式：合成候选人已明确标注。
Only candidates who applied to your company and shared their CV summary.|Hanya calon yang memohon kepada syarikat anda dan berkongsi ringkasan CV.|仅显示投递本公司职位且授权分享简历摘要的候选人。
Could not load comparison. Please retry.|Gagal memuatkan perbandingan. Cuba lagi.|无法加载对比数据，请重试。
Application|Permohonan|真实投递
Demo|Demo|演示数据

Refresh overview|Muat semula gambaran keseluruhan|刷新概览
Could not load screening pipeline. Please refresh.|Gagal memuatkan aliran saringan. Muat semula.|无法加载筛选流程，请刷新概览。
Could not load vacancies. Please refresh.|Gagal memuatkan jawatan kosong. Muat semula.|无法加载招聘职位，请刷新概览。

Default test candidate|Calon ujian lalai|默认测试候选人
Invite default candidate|Jemput calon lalai|邀请默认候选人
Test the invitation flow with the default candidate account.|Uji aliran jemputan dengan akaun calon lalai.|使用默认候选人账号测试邀请与回复流程。
Invitations go directly to the candidate account. Use Aisha Rahman for the demo.|Jemputan dihantar terus ke akaun calon. Gunakan Aisha Rahman untuk demo.|邀请直接送达候选人账号。演示时请使用 Aisha Rahman。
This demo candidate has no account. Use Aisha Rahman to test invitations.|Calon demo ini tiada akaun. Gunakan Aisha Rahman untuk menguji jemputan.|此示例候选人尚无账号，请使用 Aisha Rahman 测试邀请。
No linked account|Tiada akaun terpaut|尚未关联账号
Cancel invitation|Batalkan jemputan|取消邀请
Cancelled|Dibatalkan|已取消

Invitation saved|Jemputan disimpan|邀请已保存
Save this private code before refreshing or leaving this page.|Simpan kod peribadi sebelum memuat semula atau meninggalkan halaman ini.|刷新或离开页面前，请保存此专属领取码。
Interview responses|Jawapan temu duga|面试回复状态
Refresh notifications|Muat semula pemberitahuan|刷新通知
Interview notifications|Pemberitahuan temu duga|面试通知
Notifications|Pemberitahuan|通知
Claim an invitation|Tuntut jemputan|领取邀请
Claim invitation|Tuntut jemputan|领取邀请
Invitation code|Kod jemputan|邀请领取码
Enter the private code provided by HR. Only claim invitations intended for you.|Masukkan kod peribadi daripada HR. Tuntut jemputan untuk anda sahaja.|输入 HR 提供的专属领取码，仅领取发给您本人的邀请。
Send an in-app invitation. Share the private claim code with the candidate if they have no linked account.|Hantar jemputan dalam aplikasi. Kongsi kod peribadi jika calon belum mempunyai akaun terpaut.|发送站内邀请。若候选人尚未关联账号，请将专属领取码交给本人。
Send in-app invitation|Hantar jemputan dalam aplikasi|发送站内邀请
Invitation saved. Copy this private code and share it with the candidate. They must sign in and claim it in Interview notifications.|Jemputan disimpan. Kongsi kod peribadi dengan calon untuk dituntut selepas log masuk.|邀请已保存。请复制专属领取码交给候选人，由本人登录后在面试通知中领取。
Keep this code before closing.|Simpan kod ini sebelum menutup.|关闭前请保存此领取码。
Invitation delivered to the candidate inbox.|Jemputan dihantar ke peti masuk calon.|邀请已送达候选人通知栏。
Awaiting claim|Menunggu tuntutan|等待领取
Pending|Menunggu jawapan|待回复
Accepted|Diterima|已接受
Declined|Ditolak|已拒绝
Accept interview|Terima temu duga|接受面试
Decline interview|Tolak temu duga|拒绝面试
No interview invitations yet.|Belum ada jemputan temu duga.|暂无面试邀请。
Could not load invitations. Please retry.|Gagal memuatkan jemputan. Cuba lagi.|无法加载邀请，请重试。
Invalid or already claimed code.|Kod tidak sah atau telah dituntut.|领取码无效或已被其他账号领取。
Candidate not found.|Calon tidak ditemui.|找不到候选人。
Please complete the interview details.|Lengkapkan butiran temu duga.|请完整填写面试信息。
This invitation already exists.|Jemputan ini sudah wujud.|此邀请已存在，请查看回复状态。

Invite to interview|Jemput temu duga|邀请面试
Close|Tutup|关闭
Recipient email|E-mel penerima|收件人邮箱
Interview role|Jawatan temu duga|面试岗位
Interview date and time (Malaysia, UTC+8)|Tarikh dan masa temu duga (Malaysia, UTC+8)|面试日期与时间（马来西亚，UTC+8）
Location or meeting link|Lokasi atau pautan mesyuarat|地点或会议链接
Additional message|Mesej tambahan|补充留言
Open invitation email|Buka e-mel jemputan|打开邀请邮件
Interview invitation|Jemputan temu duga|面试邀请
We would like to invite you to an interview.|Kami ingin menjemput anda untuk temu duga.|我们诚邀您参加面试。
Please reply to confirm your availability.|Sila balas untuk mengesahkan ketersediaan anda.|请回复邮件确认您是否能出席。
Enter the candidate's confirmed email. This opens an email draft; send it from your email app.|Masukkan e-mel calon yang disahkan. Ini membuka draf e-mel; hantar melalui aplikasi e-mel anda.|请填写已确认的候选人邮箱。此操作会打开邮件草稿，请在邮件程序中发送。
Email app requested. If it opens, review and send the draft there. Delivery is not tracked here.|Aplikasi e-mel telah diminta. Jika dibuka, semak dan hantar draf di sana. Penghantaran tidak dijejak di sini.|已请求打开邮件程序。若成功打开，请检查并发送草稿。此处不跟踪送达状态。

Candidate recommendation summary|Ringkasan cadangan calon|候选人推荐总结
Based on selected CV skills only. Top three positions include ties. Confirm skills in an interview; HR makes the final decision.|Berdasarkan kemahiran CV terpilih sahaja. Tiga kedudukan teratas termasuk seri. Sahkan kemahiran dalam temu duga; HR membuat keputusan akhir.|仅依据当前所选技能的简历记录，展示前三名（含并列）。请通过面试确认技能，由 HR 作最终决定。
Recommendation evidence|Bukti cadangan|推荐依据
Confirm at interview|Sahkan semasa temu duga|面试需确认
All selected skills are listed. Verify with project examples.|Semua kemahiran terpilih disenaraikan. Sahkan melalui contoh projek.|已列出全部所选技能，请结合项目实例核实。
No recommendations for this selection. Choose candidates and skills with CV evidence.|Tiada cadangan untuk pilihan ini. Pilih calon dan kemahiran dengan bukti CV.|当前筛选下暂无推荐人选。请选择候选人和简历中有记录的技能。

Confirm missing CV skills before recommending training.|Sahkan kemahiran yang tiada dalam CV sebelum mencadangkan latihan.|建议培训前，请先确认简历未列出的技能。
Candidate skills comparison|Perbandingan kemahiran calon|候选人技能对比
Candidates|Calon|候选人
Candidate|Calon|候选人
Candidate learning suggestions|Cadangan pembelajaran calon|候选人学习建议
Find candidate|Cari calon|查找候选人
Choose candidates|Pilih calon|选择候选人
Candidates compared|Calon dibandingkan|参与对比候选人数
CV skill coverage|Liputan kemahiran CV|简历技能覆盖率
Candidates listing this skill|Calon menyenaraikan kemahiran ini|简历列出该技能的比例
Candidates below 60% coverage|Calon dengan liputan bawah 60%|技能覆盖率低于 60% 的候选人
Candidate CV coverage|Liputan CV calon|候选人简历技能覆盖率
Most to confirm|Paling perlu disahkan|最需确认的技能
Listed in CV|Disenaraikan dalam CV|简历已列出
Listed in CV · To confirm|Disenaraikan dalam CV · Perlu disahkan|简历已列出 · 待确认
Field|Bidang|领域
No comparison data. Select candidates and skills or reset filters.|Tiada data. Pilih calon dan kemahiran atau tetapkan semula penapis.|暂无对比数据。请选择候选人与技能，或重置筛选。
Demo candidate CVs, shared with candidate screening. Listed skills are unverified; missing skills need confirmation. Real resume submissions are not connected yet.|CV calon demo, sama dengan saringan calon. Kemahiran belum disahkan; kemahiran yang tiada perlu disahkan. Penghantaran resume sebenar belum disambungkan.|候选人简历演示数据，与候选人筛选共用。已列技能未经验证，未列技能需确认。目前尚未接入真实简历投递。

All industries|Semua industri|全部行业
Accounting & audit|Perakaunan & audit|会计与审计
Insurance|Insurans|保险
Technology|Teknologi|科技
Find employee|Cari pekerja|查找员工
Name or role|Nama atau jawatan|姓名或岗位
Reset comparison|Tetapkan semula perbandingan|重置对比
Choose employees|Pilih pekerja|选择对比员工
Choose skills|Pilih kemahiran|选择对比技能
Selected skill readiness|Kesediaan kemahiran terpilih|所选技能就绪度
Employees compared|Pekerja dibandingkan|参与对比员工数
Selected team coverage|Liputan pasukan terpilih|所选员工达标率
Claims Executive|Eksekutif Tuntutan|保险理赔专员
Underwriting Analyst|Penganalisis Pengunderaitan|保险核保分析师
No comparison data. Select employees and skills or reset filters.|Tiada data perbandingan. Pilih pekerja dan kemahiran atau tetapkan semula penapis.|暂无对比数据。请选择员工和技能，或重置筛选。
Synthetic team data. Compare selected employees and skills; all summaries follow your filters. Industry presets cover shared AI skills, not professional certification.|Data pasukan sintetik. Bandingkan pekerja dan kemahiran terpilih; semua ringkasan mengikut penapis. Pratetap industri meliputi kemahiran AI bersama, bukan pensijilan profesional.|合成团队演示数据。可选择员工与技能进行比较，所有摘要随筛选更新。行业预设涵盖通用 AI 技能，不代表专业资格评估。

SDG Career Passport|Pasport Kerjaya SDG|SDG 职业护照
Contribution to the SDGs|Sumbangan kepada SDG|对可持续发展目标的贡献
Skills to build|Kemahiran untuk dibina|待提升的技能
match|padanan|匹配度
to close gap|untuk menutup jurang|补足技能差距所需时间
courses|kursus|门课程
course|kursus|门课程
None — fully matched|Tiada — padanan penuh|无，已完全匹配
Estimates only. Demo data is synthetic; not a guarantee of employment or salary.|Anggaran sahaja. Data demo adalah sintetik; bukan jaminan pekerjaan atau gaji.|数值仅供估算。演示数据为合成数据，不保证就业或薪资。
Print / save as PDF|Cetak / simpan sebagai PDF|打印／另存为 PDF
Complete your profile to generate your passport.|Lengkapkan profil untuk menjana pasport anda.|完善个人资料以生成职业护照。
AI Financial Compliance & ESG Risk Auditor|Juruaudit Pematuhan Kewangan AI & Risiko ESG|AI 金融合规与 ESG 风险审计师
Generative AI Marketing & Workflow Architect|Arkitek Pemasaran AI Generatif & Aliran Kerja|生成式 AI 营销与工作流程架构师
AI Agent & RAG Systems Engineer|Jurutera Sistem Ejen AI & RAG|AI 智能体与 RAG 系统工程师
AI Workforce Reskilling & People Analytics Specialist|Pakar Latihan Semula Tenaga Kerja AI & Analitik Pekerja|AI 员工技能提升与人力分析专家
Python Data Analysis|Analisis Data Python|Python 数据分析
AI Risk Model Auditing|Pengauditan Model Risiko AI|AI 风险模型审计
ESG & Carbon Reporting Standards|Piawaian Pelaporan ESG & Karbon|ESG 与碳排放报告标准
Prompt Engineering|Kejuruteraan Prompt|提示词工程
AI Workflow Automation (Make/Zapier)|Automasi Aliran Kerja AI (Make/Zapier)|AI 工作流程自动化（Make/Zapier）
AI Copyright & Ethics Governance|Tadbir Urus Hak Cipta & Etika AI|AI 版权与伦理治理
LLM Orchestration (LangChain/LlamaIndex)|Orkestrasi LLM (LangChain/LlamaIndex)|LLM 编排（LangChain/LlamaIndex）
Vector Databases & RAG|Pangkalan Data Vektor & RAG|向量数据库与 RAG
AI Guardrails & Evaluation|Kawalan Keselamatan & Penilaian AI|AI 安全防护与评估
Skills Architecture Mapping|Pemetaan Seni Bina Kemahiran|技能架构映射
AI Bias & Fairness Auditing|Pengauditan Bias & Keadilan AI|AI 偏见与公平性审计
Change Management|Pengurusan Perubahan|变革管理
People Data Analytics|Analitik Data Pekerja|人力数据分析
Decent Work & Economic Productivity|Pekerjaan Wajar & Produktiviti Ekonomi|体面工作与经济生产力
Responsible Corporate Sustainability Reporting|Pelaporan Kemampanan Korporat Bertanggungjawab|负责任的企业可持续发展报告
Full and Productive Employment|Pekerjaan Penuh dan Produktif|充分且富有生产力的就业
Social & Economic Inclusion|Keterangkuman Sosial & Ekonomi|社会与经济包容
Skills for Employment & Decent Jobs|Kemahiran untuk Pekerjaan Wajar|就业与体面工作技能
Enhance Technological Capabilities|Meningkatkan Keupayaan Teknologi|提升技术能力
Lifelong Technical & Vocational Learning|Pembelajaran Teknikal & Vokasional Sepanjang Hayat|终身技术与职业学习
Decent Work for All|Pekerjaan Wajar untuk Semua|人人享有体面工作
Transitions routine auditors into high-value AI governance specialists.|Membantu juruaudit rutin beralih menjadi pakar tadbir urus AI bernilai tinggi.|帮助常规审计人员转型为高价值的 AI 治理专家。
Uses AI to verify corporate ESG and carbon disclosures.|Menggunakan AI untuk mengesahkan pendedahan ESG dan karbon korporat.|使用 AI 核查企业 ESG 与碳排放披露。
Protects creative workers from displacement via human-AI co-creation.|Melindungi pekerja kreatif daripada kehilangan kerja melalui penciptaan bersama manusia dan AI.|通过人机共同创作降低创意工作者被替代的风险。
Enables multilingual inclusive outreach for local SMEs.|Membolehkan jangkauan inklusif berbilang bahasa untuk PKS tempatan.|帮助本地中小企业开展多语言、包容性的推广。
Builds core digital infrastructure for Malaysia's AI economy.|Membina infrastruktur digital teras untuk ekonomi AI Malaysia.|为马来西亚 AI 经济建设核心数字基础设施。
Accelerates industrial innovation and safe AI deployment.|Mempercepat inovasi industri dan pelaksanaan AI yang selamat.|推动产业创新与安全的 AI 部署。
Designs continuous reskilling pathways for workers at risk.|Mereka bentuk laluan latihan semula berterusan untuk pekerja berisiko.|为面临职业风险的员工设计持续的技能提升路径。
Ensures fair, bias-free internal mobility.|Memastikan mobiliti dalaman yang adil dan bebas bias.|支持公平、减少偏见的内部职业流动。
Data Analysis with Python|Analisis Data dengan Python|使用 Python 进行数据分析
AI & Law / Responsible AI Governance|AI & Undang-undang / Tadbir Urus AI Bertanggungjawab|AI 与法律／负责任的 AI 治理
Introduction to Sustainability & ESG Reporting|Pengenalan kepada Kemampanan & Pelaporan ESG|可持续发展与 ESG 报告入门
ChatGPT Prompt Engineering for Developers|Kejuruteraan Prompt ChatGPT untuk Pembangun|面向开发者的 ChatGPT 提示词工程
AI Automation & No-Code Workflows for Business|Automasi AI & Aliran Kerja Tanpa Kod untuk Perniagaan|商业 AI 自动化与无代码工作流程
Ethics of Artificial Intelligence|Etika Kecerdasan Buatan|人工智能伦理
LangChain for LLM Application Development|LangChain untuk Pembangunan Aplikasi LLM|使用 LangChain 开发 LLM 应用
Building and Evaluating Advanced RAG Applications|Membina dan Menilai Aplikasi RAG Lanjutan|构建与评估高级 RAG 应用
Quality and Safety for LLM Applications|Kualiti dan Keselamatan Aplikasi LLM|LLM 应用的质量与安全
Free|Percuma|免费
Free Audit|Akses pembelajaran percuma|免费旁听
Free Audit / HRD Corp Eligible|Akses percuma / Layak HRD Corp|免费旁听／符合 HRD Corp 条件
Free / Low-Cost|Percuma / Kos Rendah|免费／低费用
Open Global Certificate|Sijil Global Terbuka|开放全球证书
HRD Corp Claimable Track|Laluan Tuntutan HRD Corp|HRD Corp 费用申领课程
Green Skills Priority|Keutamaan Kemahiran Hijau|绿色技能优先
MDEC Digital Skills|Kemahiran Digital MDEC|MDEC 数字技能
Responsible AI Badge|Lencana AI Bertanggungjawab|负责任 AI 徽章
MDEC Premier Digital Tech|Teknologi Digital Premier MDEC|MDEC 卓越数字技术
Open Global Resource|Sumber Global Terbuka|开放全球资源
Easy (1-2 wks)|Mudah (1–2 minggu)|入门（1–2 周）
Moderate (2-3 wks)|Sederhana (2–3 minggu)|中等（2–3 周）
You already cover every core skill for this role.|Anda sudah menguasai semua kemahiran teras jawatan ini.|你已具备该岗位的全部核心技能。
Profile|Profil|个人资料
Matches|Padanan|岗位匹配
Here is where you stand today and what to do next.|Inilah kedudukan anda hari ini dan langkah seterusnya.|了解你当前的技能状况及下一步行动。
Complete your profile to unlock matches and a learning plan.|Lengkapkan profil untuk mendapatkan padanan dan pelan pembelajaran.|完善资料以获取岗位匹配和学习计划。
Best match|Padanan terbaik|最佳匹配
Run analysis|Jalankan analisis|运行分析
Skills in gap|Jurang kemahiran|待补足的技能
Learning hours|Jam pembelajaran|学习时数
SDGs linked|SDG berkaitan|关联的 SDG
for selected role|untuk jawatan dipilih|针对所选岗位
verified courses|kursus dalam katalog|目录课程
No matches yet.|Belum ada padanan.|尚无匹配结果。
Hybrid|Hibrid|混合办公
Remote|Jarak jauh|远程办公
On-site|Di pejabat|现场办公
AI Literacy|Literasi AI|AI 素养
Workflow Automation|Automasi Aliran Kerja|工作流程自动化
AI Risk & Compliance|Risiko & Pematuhan AI|AI 风险与合规
Data Privacy (PDPA)|Privasi Data (PDPA)|数据隐私（PDPA）
ESG Reporting|Pelaporan ESG|ESG 报告
Audit & Assurance|Audit & Jaminan|审计与鉴证
Marketing|Pemasaran|市场营销
Engineering|Kejuruteraan|工程
Finance|Kewangan|财务
Operations|Operasi|运营
Human Resources|Sumber Manusia|人力资源
Junior Financial Auditor|Juruaudit Kewangan Junior|初级财务审计师
Digital Copywriter|Penulis Iklan Digital|数字营销文案
Graduate Software Engineer|Jurutera Perisian Graduan|应届软件工程师
Accounts Executive|Eksekutif Akaun|会计专员
Operations Planner|Perancang Operasi|运营规划师
HR Executive|Eksekutif HR|人力资源专员
Senior Auditor|Juruaudit Kanan|高级审计师
Social Media Executive|Eksekutif Media Sosial|社交媒体专员
All|Semua|全部
Experienced|Berpengalaman|有经验人士
Experienced Worker|Pekerja Berpengalaman|有经验人士
Fresh graduate|Graduan baharu|应届毕业生
Pending|Menunggu|待处理
Shortlist|Senarai pendek|列入候选名单
Needs review|Perlu semakan|需要审核
Hold|Tangguh|暂缓
Priority human review|Semakan manusia keutamaan|优先人工审核
Confirm skills with follow-up|Sahkan kemahiran melalui susulan|通过跟进确认技能
Consider for junior / adjacent role|Pertimbangkan jawatan junior / berkaitan|考虑初级／相近岗位
Keep in talent pool|Simpan dalam kumpulan bakat|保留在人才库
Screen candidates →|Saring calon →|筛选候选人 →
Close|Tutup|关闭
Reopen|Buka semula|重新开放
Delete|Padam|删除
Open|Terbuka|开放中
Closed|Ditutup|已关闭
General|Umum|通用
No vacancies|Tiada kekosongan|暂无职位
No vacancies yet. Create your first one on the left.|Belum ada kekosongan. Cipta yang pertama di sebelah kiri.|暂无职位，请在左侧创建首个职位。
Create or select a vacancy to scrn candidates.|Cipta atau pilih kekosongan untuk menyaring calon.|创建或选择职位以筛选候选人。
No candidates in this group.|Tiada calon dalam kumpulan ini.|此类别中暂无候选人。
All covered|Semua diliputi|全部覆盖
Candidate insight|Wawasan calon|候选人详情
Synthetic profile|Profil sintetik|合成资料
Why this score|Sebab skor ini|评分依据
Strengths backed by CV evidence|Kekuatan disokong bukti CV|简历证据支持的优势
None matched yet|Belum ada padanan|暂无匹配项
Not on the CV does not mean the candidate cannot do it. Ask first.|Tiada dalam CV tidak bermakna calon tidak boleh melakukannya. Tanya dahulu.|简历未提及不代表候选人不具备该能力，请先询问确认。
Everything required is evidenced|Semua keperluan disokong bukti|所有必需能力均有证据支持
Salary expectation|Jangkaan gaji|期望薪资
Availability · Mode|Ketersediaan · Mod|入职时间 · 工作模式
Career motivation|Motivasi kerjaya|职业动机
Projects on CV|Projek dalam CV|简历项目
Suggested follow-up questions|Soalan susulan dicadangkan|建议跟进问题
· editable|· boleh disunting|· 可编辑
Copy|Salin|复制
Your decision|Keputusan anda|你的决策
AI suggests; a person decides.|AI mencadangkan; manusia membuat keputusan.|AI 提供建议，最终由人工决策。
Required skills|Kemahiran wajib|必需技能
Relevant experience|Pengalaman berkaitan|相关经验
Education|Pendidikan|学历
Work mode fit|Padanan mod kerja|工作模式适配
Salary fit|Padanan gaji|薪资适配
Within budget|Dalam bajet|预算范围内
Below budget range|Di bawah julat bajet|低于预算范围
Above budget — confirm flexibility|Melebihi bajet — sahkan fleksibiliti|高于预算，请确认协商空间
Approved · Revoke|Diluluskan · Batalkan|已批准 · 撤销
No verified reskilling recommendations right now.|Tiada cadangan latihan daripada katalog buat masa ini.|目前暂无目录课程建议。
Approve training to see SDG impact.|Luluskan latihan untuk melihat impak SDG.|批准培训以查看 SDG 影响。
View ↗|Lihat ↗|查看 ↗
No open vacancies. Create one to start screening.|Tiada kekosongan terbuka. Cipta satu untuk mula menyaring.|暂无开放职位，请创建职位后开始筛选。
Screen a vacancy to see the pipeline.|Saring kekosongan untuk melihat aliran.|筛选职位以查看招聘流程。
Your company|Syarikat anda|你的公司
Job-relevant criteria only|Kriteria berkaitan kerja sahaja|仅使用岗位相关标准
Protected attributes excluded|Atribut terlindung dikecualikan|排除受保护属性
CV gaps = “To confirm”|Jurang CV = “Untuk disahkan”|简历缺项视为“待确认”
Explainable scores|Skor boleh dijelaskan|可解释评分
HR final decision|Keputusan akhir HR|HR 最终决策
LLM Orchestration & RAG|Orkestrasi LLM & RAG|LLM 编排与 RAG
AI Risk & Compliance Auditing|Pengauditan Risiko & Pematuhan AI|AI 风险与合规审计
Prompt Engineering & Workflow Automation|Kejuruteraan Prompt & Automasi Aliran Kerja|提示词工程与工作流程自动化
ESG & Sustainability Data Analytics|Analitik Data ESG & Kemampanan|ESG 与可持续发展数据分析
Manual Invoice & Ledger Reconciliation|Penyelarasan Invois & Lejar Manual|人工发票与账本核对
Generic SEO & Basic Social Copywriting|SEO Umum & Penulisan Sosial Asas|通用 SEO 与基础社交文案
Manual First-Round CV Keyword Screening|Saringan Kata Kunci CV Peringkat Pertama Manual|人工首轮简历关键词筛选
Demo|Demo|演示
Undated demo fixture|Data demo tanpa tarikh|无日期的演示数据
Diploma / TVET|Diploma / TVET|文凭／技术与职业教育
Bachelor's Degree|Ijazah Sarjana Muda|学士学位
Master's / Postgraduate|Sarjana / Pascasiswazah|硕士／研究生
AI Financial Compliance Analyst|Penganalisis Pematuhan Kewangan AI|AI 金融合规分析师
Software Developer|Pembangun Perisian|软件开发人员
Protected attributes excluded. Statistical parity has not been audited.|Atribut terlindung dikecualikan. Kesetaraan statistik belum diaudit.|不使用受保护属性；尚未进行统计公平性审计。
Scored on job-relevant criteria only. Age, gender, ethnicity and other protected attributes are not collected or used. Missing CV items are marked 'To confirm', never auto-rejected. HR makes the final decision.|Skor berdasarkan kriteria berkaitan kerja sahaja. Umur, jantina, etnik dan atribut terlindung lain tidak dikumpul atau digunakan. Maklumat CV yang tiada ditanda 'Untuk disahkan', bukan ditolak secara automatik. HR membuat keputusan akhir.|仅依据岗位相关标准评分，不收集或使用年龄、性别、族裔等受保护属性。简历缺项标为“待确认”，不会自动淘汰。最终决策由 HR 作出。
Illustrative demo signals (offline); not verified research citations|Isyarat demo ilustrasi (luar talian); bukan petikan penyelidikan yang disahkan|示例演示信号（离线）；非已核实的研究引用
ArXiv live paper feed; trend percentages are illustrative benchmarks|Suapan kertas ArXiv langsung; peratus trend ialah penanda aras ilustrasi|ArXiv 实时论文信号；趋势百分比为示例基准
LIVE CONNECTED|BERSAMBUNG LANGSUNG|实时已连接
CACHED FALLBACK|DEMO LUAR TALIAN|离线演示回退
Remove|Buang|移除
Type a skill, e.g. Financial Auditing|Taip kemahiran, cth. Pengauditan Kewangan|输入技能，例如财务审计
Skill directly needed for the job|Kemahiran yang diperlukan untuk kerja|岗位直接需要的技能
Nice-to-have skill|Kemahiran tambahan|加分技能
e.g. Software Developer|cth. Pembangun Perisian|例如：软件开发人员
Financial Auditing|Pengauditan Kewangan|财务审计
Finance & Accounting|Kewangan & Perakaunan|金融与会计
Marketing & PR|Pemasaran & Perhubungan Awam|市场营销与公关
IT & Software|IT & Perisian|信息技术与软件
HR & Administration|Sumber Manusia & Pentadbiran|人力资源与行政
Risk Assessment|Penilaian Risiko|风险评估
SQL Basics|Asas SQL|SQL 基础
Excel Pivot & Macros|Jadual Pangsi & Makro Excel|Excel 数据透视表与宏
Immediately|Serta-merta|可立即入职
If this role needed a tool you have never used, how would you get productive in the first month?|Jika jawatan ini memerlukan alat yang belum pernah anda gunakan, bagaimanakah anda akan bekerja secara produktif pada bulan pertama?|如果岗位要求使用你从未接触过的工具，你会如何在第一个月内掌握并投入工作？
Which parts of your previous experience transfer most directly to this role?|Bahagian manakah dalam pengalaman terdahulu anda yang paling berkaitan dengan jawatan ini?|你过去的哪些经验最能直接应用于这个岗位？
Describe a problem you solved that was blocking your team's delivery.|Terangkan masalah yang anda selesaikan yang pernah menghalang penyampaian pasukan anda.|请描述一次你解决了阻碍团队交付的问题的经历。
`.trim().split('\n').map(line => line.split('|'));
  const dictionary = new Map(rows.map(row => [row[0],row]));
  function translate(text, language) {
    const i = language === 'zh' ? 2 : language === 'ms' ? 1 : 0;
    if (!i) return text;
    const row = dictionary.get(text);
    if (row) return row[i];
    let dynamic = text.match(/^(\d+) (?:views?|companies|company)$/);
    if (dynamic) return `${dynamic[1]} ${/view/.test(text) ? (i===2?'次查看':'paparan') : (i===2?'家公司':'syarikat')}`;
    dynamic = text.match(/^(\d+) of (\d+) answered · draft saved on this device$/);
    if (dynamic) return i===2 ? `已回答 ${dynamic[1]} / ${dynamic[2]} 题 · 草稿已保存到此设备` : `${dynamic[1]} daripada ${dynamic[2]} dijawab · draf disimpan pada peranti ini`;
    dynamic = text.match(/^Preparing a response… (\d+)s$/);
    if (dynamic) return i===2 ? `正在准备回复……${dynamic[1]} 秒` : `Menyediakan respons… ${dynamic[1]}s`;
    dynamic = text.match(/^Still working on your CV \((\d+)s\). You can go back; your draft is saved\.$/);
    if (dynamic) return i===2 ? `仍在处理简历（${dynamic[1]} 秒）。你可以返回，草稿已保存。` : `Masih memproses CV (${dynamic[1]}s). Anda boleh kembali; draf disimpan.`;
    dynamic = text.match(/^Ready · Generated by (.+)$/);
    if (dynamic) return i===2 ? `已就绪 · 由 ${dynamic[1]} 生成` : `Sedia · Dijana oleh ${dynamic[1]}`;
    dynamic = text.match(/^(.*?)(\s*\*)$/);
    if (dynamic) return translate(dynamic[1],language) + dynamic[2];
    const feature = text.match(/^Function (\d{2})$/);
    if(feature) return i===2 ? `功能 ${feature[1]}` : `Fungsi ${feature[1]}`;
    const skillQuestion=text.match(/^Your CV does not mention (.+)\. Have you used it in a project or at work\? Please describe your role\.$/);
    if(skillQuestion)return i===2 ? `你的简历未提及${translate(skillQuestion[1],language)}。你是否曾在项目或工作中运用它？请描述你承担的职责。` : `CV anda tidak menyebut ${translate(skillQuestion[1],language)}. Pernahkah anda menggunakannya dalam projek atau di tempat kerja? Sila terangkan peranan anda.`;
    const projectQuestion=text.match(/^In "(.+)", which part did you personally own and what was the hardest problem\?$/);
    if(projectQuestion)return i===2 ? `在“${projectQuestion[1]}”项目中，你亲自负责哪一部分？最难解决的问题是什么？` : `Dalam projek "${projectQuestion[1]}", bahagian manakah yang anda kendalikan sendiri dan apakah masalah yang paling sukar?`;
    const source = text.match(/^Source: (.+) · Updated (.+) · (LIVE CONNECTED|CACHED FALLBACK)$/);
    if(source) return i===2 ? `来源：${translate(source[1],language)} · 更新：${translate(source[2],language)} · ${translate(source[3],language)}` : `Sumber: ${translate(source[1],language)} · Dikemas kini: ${translate(source[2],language)} · ${translate(source[3],language)}`;
    if(text.includes('; '))return text.split('; ').map(part=>translate(part,language)).join('; ');
    const chartValue=text.match(/^(.+): (\d+)%$/);
    if(chartValue)return `${translate(chartValue[1],language)}: ${chartValue[2]}%`;
    // Each text node can contain punctuation, icons, numbers or embedded catalog labels.
    const icon = text.match(/^([✓⚖️🌱⏳🎉🖨️🇲🇾★+]+\s*)(.+)$/u);
    if (icon) return icon[1] + translate(icon[2],language);
    const units = text.match(/^(\d+(?:\.\d+)?\+?)\s*(hours?|h|steps?|courses?|yrs?|weeks?|months?)$/);
    if (units) {
      const kind = /^(h|hour)/.test(units[2]) ? ['jam','小时'] : /^step/.test(units[2]) ? ['langkah','个步骤'] : /^course/.test(units[2]) ? ['kursus','门课程'] : /^yr/.test(units[2]) ? ['tahun','年'] : /^week/.test(units[2]) ? ['minggu','周'] : ['bulan','个月'];
      return `${units[1]} ${kind[i-1]}`;
    }
    let match = text.match(/^Phase (\d+) \(Week (\d+)–(\d+)\)$/);
    if (match) return i===2 ? `阶段 ${match[1]}（第 ${match[2]}–${match[3]} 周）` : `Fasa ${match[1]} (Minggu ${match[2]}–${match[3]})`;
    match = text.match(/^Market demand (\d+)\/100$/);
    if (match) return i===2 ? `市场需求 ${match[1]}/100` : `Permintaan pasaran ${match[1]}/100`;
    match = text.match(/^(\d+) skills to build$/);
    if (match) return i===2 ? `${match[1]} 项待提升技能` : `${match[1]} kemahiran untuk dibina`;
    match = text.match(/^gap (\d+)$/);
    if (match) return i===2 ? `差距 ${match[1]}` : `jurang ${match[1]}`;
    if (/^courses? approved · (\d+) learning hours$/.test(text)) {
      const hours=text.match(/(\d+) learning/)[1];
      return i===2 ? `门课程已批准 · ${hours} 学习小时` : `kursus diluluskan · ${hours} jam pembelajaran`;
    }
    match = text.match(/^Match for (.+)$/);
    if (match) return i===2 ? `目标岗位：${translate(match[1],language)}` : `Padanan untuk ${translate(match[1],language)}`;
    // The separators also occur in role selectors, salary rows and learning cards.
    for (const separator of [' · ', ' / ', ', ']) {
      if (text.includes(separator)) return text.split(separator).map(part=>translate(part,language)).join(separator);
    }
    return text;
  }
  return {translate, rows};
});
