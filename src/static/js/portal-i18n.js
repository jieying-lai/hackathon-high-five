/* Catalog and dynamic portal copy. Canonical API data is never modified. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.portalI18n = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const rows = `
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
