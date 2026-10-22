/* Catalog and dynamic portal copy. Canonical API data is never modified. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.portalI18n = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const rows = `
Not enough free memory to start local AI. Close unused apps to free at least 4 GB of RAM, then retry.|Memori bebas tidak mencukupi. Tutup aplikasi yang tidak digunakan untuk membebaskan sekurang-kurangnya 4 GB RAM, kemudian cuba lagi.|可用内存不足，暂时无法启动本地 AI。请关闭不用的程序，释放至少 4 GB 可用内存后重试。
The local AI service has stopped. Restart the project with Start.cmd, then use the page it opens.|Perkhidmatan AI tempatan telah berhenti. Mulakan semula dengan Start.cmd dan gunakan halaman yang dibuka.|本地 AI 服务已停止。请用 Start.cmd 重新启动项目，并使用它自动打开的页面。
The local AI runtime is missing. Run Start.cmd to install and start it.|Persekitaran AI tempatan tiada. Jalankan Start.cmd untuk memasang dan memulakannya.|缺少本地 AI 运行环境，请运行 Start.cmd 安装并启动。
The trained interview adapter is missing. Restore models/interview-adapter and restart Start.cmd.|Penyesuai temu duga terlatih tiada. Pulihkan models/interview-adapter dan mulakan Start.cmd semula.|缺少训练后的面试模型，请恢复 models/interview-adapter，再用 Start.cmd 启动。
The base model is missing. Run Start.cmd to finish the model setup.|Model asas tiada. Jalankan Start.cmd untuk melengkapkan persediaan model.|缺少基础模型，请运行 Start.cmd 完成模型配置。
The local AI service failed during startup. See state/interview-model/server-error.log, then restart with Start.cmd.|AI tempatan gagal bermula. Lihat state/interview-model/server-error.log, kemudian mulakan dengan Start.cmd.|本地 AI 启动失败，详情见 state/interview-model/server-error.log；请用 Start.cmd 重新启动。
The local AI model is still loading. Keep its startup window open and retry shortly.|Model AI tempatan masih dimuatkan. Biarkan tetingkap permulaan terbuka dan cuba sebentar lagi.|本地 AI 模型仍在加载，请保留启动窗口，稍后重试。
No replacement available. Try another topic or a new batch.|Tiada pengganti tersedia. Cuba topik lain atau kumpulan baharu.|暂时没有可替换课程，试试其他主题或换一批推荐。
All users’ accumulated pledges|Jumlah ikrar semua pengguna|所有用户共同累积
This shared total combines all registered users on this platform. Transfers are recorded after receipt confirmation.|Jumlah bersama ini merangkumi semua pengguna berdaftar di platform ini. Pemindahan direkodkan selepas pengesahan resit.|此扑满汇总平台所有注册用户的累计承诺，确认凭证后才登记为已汇出。
registered users|pengguna berdaftar|位注册用户
badge contributors|penyumbang lencana|位徽章贡献者
Includes a USD 5 demo opening balance.|Termasuk baki permulaan demo USD 5.|包含 USD 5 演示初始余额。
Selected recipient: WFP. Transfer dates are awaiting confirmation. Listing a recipient does not imply a formal partnership.|Penerima dipilih: WFP. Tarikh pemindahan menunggu pengesahan. Penyenaraian bukan perkongsian rasmi.|已选择 WFP 为接收机构，汇款日期待确认；展示接收机构不代表已建立正式合作。
Learning milestones|Pencapaian pembelajaran|学习里程碑
Syncing your learning milestones…|Menyegerakkan pencapaian pembelajaran…|正在同步学习里程碑……
Could not sync learning milestones. Please retry.|Tidak dapat menyegerakkan pencapaian. Sila cuba lagi.|暂时无法同步学习里程碑，请重试。
Learning badge unlocked! View your milestones in Completed Learning.|Lencana pembelajaran dibuka! Lihat di Pembelajaran Selesai.|已解锁学习徽章！到“已完成学习”查看。
Small steps, shared kindness|Langkah kecil, kebaikan bersama|小小进步，汇聚善意
Learn. Earn a badge. Make a little difference.|Belajar. Raih lencana. Bawa sedikit perubahan.|学习、获得徽章，让善意多一点。
Complete 10, 20, 30, 40 and 50 courses to collect five milestone badges.|Lengkapkan 10, 20, 30, 40 dan 50 kursus untuk mengumpul lima lencana.|完成 10、20、30、40、50 门课程，逐步收集五枚里程碑徽章。
1 badge = USD 1 company pledge|1 lencana = USD 1 ikrar syarikat|1 枚徽章 = 公司承诺捐出 USD 1
Earned|Diperoleh|已获得
Not yet earned|Belum diperoleh|尚未获得
Next milestone|Pencapaian seterusnya|下个里程碑
more courses to go|kursus lagi|门课程后达成
You have collected all five learning badges!|Anda telah mengumpul semua lima lencana!|你已集齐五枚学习徽章！
A little piggy bank for shared kindness|Tabung kecil untuk kebaikan bersama|汇聚善意的小扑满
Your unlocked pledge|Ikrar yang anda buka|你已解锁的捐款承诺
Funded by CareerLens, not charged to you.|Dibiayai CareerLens, tiada caj kepada anda.|由 CareerLens 公司出资，不向你收费。
Our kindness piggy bank|Tabung kebaikan kita|我们的爱心扑满
For every milestone badge earned, CareerLens pledges USD 1 towards hunger relief.|Bagi setiap lencana, CareerLens berikrar USD 1 untuk bantuan kelaparan.|每获得一枚里程碑徽章，CareerLens 承诺捐出 USD 1 支持抗饥饿援助。
Company total pledged|Jumlah ikrar syarikat|公司累计承诺
Awaiting transfer|Menunggu pemindahan|待汇出
Recorded as sent|Direkodkan dihantar|已登记汇出
Next transfer|Pemindahan seterusnya|下次汇款
Recipient|Penerima|接收机构
To be announced|Akan diumumkan|待公布
Totals cover accounts using this server. Transfers are recorded only after the company provides a receipt.|Jumlah meliputi akaun pada pelayan ini. Pemindahan direkodkan selepas syarikat menyediakan resit.|合计涵盖本服务器的账号；公司提供汇款凭证后才登记为已汇出。
Demo campaign: these are demonstration pledges. No money is transferred automatically.|Kempen demo: ini ikrar demonstrasi. Tiada wang dipindahkan secara automatik.|演示活动：此处为演示承诺记录，系统不会自动转账。
Donation plans & transparency|Pelan derma & ketelusan|捐款安排与透明记录
Milestones use self-reported, unique completed courses. Each badge is awarded once per account and remains earned.|Pencapaian menggunakan kursus unik yang dilaporkan sendiri. Setiap lencana diberi sekali dan kekal diperoleh.|里程碑按自行记录的独立已完成课程累计；每枚徽章每账号只授予一次，获得后永久保留。
Recipient and transfer dates will be announced by CareerLens. The organisations below are suggestions, not confirmed partners.|Penerima dan tarikh akan diumumkan CareerLens. Organisasi di bawah ialah cadangan, bukan rakan yang disahkan.|接收机构及汇款日期由 CareerLens 公布；下列机构为候选，尚未确认合作。
Transfer receipts|Resit pemindahan|汇款凭证
No transfer receipts have been recorded yet.|Belum ada resit pemindahan direkodkan.|目前尚无已登记的汇款凭证。
These courses are recommended based on your selected target role and the skills you still need to improve.|Kursus ini dicadangkan berdasarkan jawatan sasaran yang dipilih dan kemahiran yang masih perlu anda tingkatkan.|这些课程根据你选择的目标职位及当前尚需提升的技能差距推荐。
Your little study companion: 25 minutes of focus, then a 5-minute break.|Teman belajar kecil anda: fokus selama 25 minit, kemudian rehat 5 minit.|你的小小学习伙伴：专注 25 分钟，再休息 5 分钟。
Click to open. Drag the tomato to move.|Klik untuk membuka. Seret tomato untuk bergerak.|点击番茄展开，拖动番茄移动。
Resize Pomodoro buddy|Ubah saiz Pomodoro buddy|调整番茄钟大小
Drag to resize. Arrow keys adjust size; Home resets.|Seret untuk ubah saiz. Kekunci anak panah melaras saiz; Home menetapkan semula.|拖动调整大小；聚焦后可用方向键调整，按 Home 恢复默认大小。
Your career courses and additional courses, saved in one place.|Kursus kerjaya dan kursus tambahan anda, disimpan di satu tempat.|职业路径课程与额外课程，统一收藏在这里。
Added to Saved Courses.|Ditambah ke Kursus Disimpan.|已加入课程收藏。
Removed from Saved Courses. Your learning progress is kept.|Dikeluarkan daripada Kursus Disimpan. Kemajuan pembelajaran dikekalkan.|已移除收藏，学习进度仍保留。
Save any course from your plan or Explore Learning to find it here.|Simpan kursus daripada pelan atau Teroka Pembelajaran untuk mencarinya di sini.|在学习计划或探索学习中收藏课程，即可在这里找到。
Save course|Simpan kursus|收藏课程
Saved to courses|Disimpan dalam kursus|已收藏
Move Pomodoro buddy with arrow keys. Press Home to return to the left.|Gerakkan Pomodoro buddy dengan kekunci anak panah. Tekan Home untuk kembali ke kiri.|聚焦标题栏后，用方向键移动番茄钟，按 Home 回到左侧。
Drag here to move your buddy|Seret di sini untuk menggerakkan buddy|拖动标题栏移动番茄钟
Completed Learning|Pembelajaran Selesai|已完成学习
Your learning journey|Perjalanan pembelajaran anda|你的学习历程
See what you have achieved|Lihat pencapaian anda|看看你已完成的学习
See what you have achieved →|Lihat pencapaian anda →|查看学习成果 →
Follow the cards from left to right. Open a step for details.|Ikuti kad dari kiri ke kanan. Buka langkah untuk butiran.|从左往右逐步学习，展开卡片可查看推荐理由。
Completed courses|Kursus selesai|已完成课程
Recorded course hours|Jam kursus direkodkan|已记录课程学时
Additional courses completed|Kursus tambahan selesai|已完成额外课程
Completion is self-reported. Hours use available course estimates, not tracked study time.|Penyelesaian dilaporkan sendiri. Jam berdasarkan anggaran kursus yang tersedia, bukan masa belajar dijejaki.|完成状态由你自行记录；学时采用课程已有估算，并非实际计时。
All learning|Semua pembelajaran|全部学习
Career plan|Pelan kerjaya|职业学习计划
Completed on|Selesai pada|完成于
Completion date not recorded|Tarikh selesai tidak direkodkan|未记录完成日期
Your completed learning will appear here.|Pembelajaran yang selesai akan dipaparkan di sini.|完成的课程会汇总在这里。
Mark a course Completed after you finish learning.|Tandakan kursus Selesai selepas tamat belajar.|学完后，将课程状态设为“已完成”。
Explore Learning|Teroka Pembelajaran|探索学习
Saved Courses|Kursus Disimpan|课程收藏
Explore learning beyond your career|Teroka pembelajaran di luar kerjaya anda|探索职业以外的新兴趣
Your saved courses|Kursus yang anda simpan|你收藏的课程
Build the skills for your target role. Start with your next learning goal, then follow the path below.|Bina kemahiran untuk jawatan sasaran. Mulakan dengan matlamat seterusnya, kemudian ikuti laluan di bawah.|为目标职位提升技能：先查看下一步学习目标，再沿着下方路径逐步学习。
Focus timer|Pemasa fokus|专注番茄钟
How this path connects to the SDGs|Hubungan laluan ini dengan SDG|这条学习路径与 SDG 的关联
Discover interests beyond your career plan.|Temui minat di luar pelan kerjaya anda.|探索职业学习计划之外的新兴趣。
Return to the additional courses you saved.|Kembali ke kursus tambahan yang anda simpan.|找回已收藏的额外课程，继续学习。
See the learning stamps you have collected.|Lihat cop pembelajaran yang telah anda kumpul.|查看学习过程中收集的印章。
Explore courses →|Teroka kursus →|探索课程 →
Open wishlist →|Buka senarai hasrat →|打开收藏 →
Open passport →|Buka pasport →|打开护照 →
Your learning wishlist|Senarai hasrat pembelajaran anda|你的学习愿望清单
Additional courses|Kursus tambahan|额外课程
Saved beyond your career plan. Find them here whenever you are ready.|Disimpan di luar pelan kerjaya anda. Cari di sini apabila anda bersedia.|职业学习计划之外的收藏课程，随时回来继续学习。
Revisit course ↗|Lihat semula kursus ↗|重温课程 ↗
Start learning ↗|Mula belajar ↗|开始学习 ↗
Remove from wishlist|Keluarkan daripada senarai hasrat|移除收藏
Your wishlist is ready for a little curiosity.|Senarai hasrat anda sedia untuk diterokai.|为你的好奇心留一个位置。
Tap Save for later on any additional course to keep it here.|Tekan Simpan untuk kemudian pada kursus tambahan untuk menyimpannya di sini.|点击额外课程的“稍后学习”，就能收藏到这里。
Removed from Additional courses. Your learning progress is kept.|Dikeluarkan daripada Kursus tambahan. Kemajuan pembelajaran dikekalkan.|已移除收藏，学习进度仍保留。
Added to Additional courses.|Ditambah ke Kursus tambahan.|已加入额外课程收藏。
Arts & creativity|Seni & kreativiti|艺术与创意
Technology|Teknologi|科技
What would you like to learn?|Apakah yang anda ingin pelajari?|你想学习什么？
e.g. psychology, photography, personal finance (English keywords)|cth. psychology, photography, personal finance (kata kunci Inggeris)|例如 psychology、photography、personal finance（请输入英文关键词）
Recommend for me|Cadangkan untuk saya|为我推荐
Recommendations adapt to your interests, saved learning and feedback.|Cadangan disesuaikan mengikut minat, pembelajaran disimpan dan maklum balas anda.|推荐会根据你的兴趣、收藏和反馈调整。
Finding courses for you…|Mencari kursus untuk anda…|正在为你寻找课程……
Courses in the recommendation model|Kursus dalam model cadangan|推荐模型中的课程数
For you|Untuk anda|为你推荐
About this course|Tentang kursus ini|课程介绍
Open the provider page for course details.|Buka laman penyedia untuk butiran kursus.|请打开课程网站查看详情。
Check the provider page for current fees, language and availability.|Semak laman penyedia untuk yuran, bahasa dan ketersediaan terkini.|最新费用、语言和开放情况请以课程网站为准。
Not interested|Tidak berminat|不感兴趣
No more matching courses. Change your interests or reset feedback to explore again.|Tiada lagi kursus sepadan. Ubah minat atau tetapkan semula maklum balas untuk meneroka lagi.|暂无更多匹配课程。试试其他兴趣，或重置反馈后继续探索。
Suggestions come from the course dataset. Your feedback is saved on this device for your account.|Cadangan daripada set data kursus. Maklum balas disimpan pada peranti ini untuk akaun anda.|课程来自学习数据集。反馈按账号保存在这台设备上。
Recommend another batch|Cadangkan pilihan lain|换一批推荐
Reset feedback|Tetapkan semula maklum balas|重置反馈
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
  rows.push(
    ['Auto generate', 'Jana automatik', '自动生成'],
    ['Pomodoro buddy', 'Teman Pomodoro', '番茄学习搭子'],
    ['Open my passport', 'Buka pasport saya', '打开我的护照'],
    ['Follow your curiosity', 'Ikuti rasa ingin tahu anda', '跟随你的好奇心'],
    ['Explore a new side of you', 'Terokai sisi baharu diri anda', '探索不一样的自己'],
    ['Choose your interests. Discover learning beyond your current career path.', 'Pilih minat anda. Terokai pembelajaran di luar laluan kerjaya semasa.', '选择感兴趣的主题，发现职业方向以外的学习机会。'],
    ['View my passport', 'Lihat pasport saya', '查看我的护照'],
    ['Psychology', 'Psikologi', '心理学'],
    ['Money & everyday life', 'Wang & kehidupan harian', '理财与日常生活'],
    ['Nature & ecology', 'Alam & ekologi', '自然与生态'],
    ['People & inclusion', 'Masyarakat & keterangkuman', '人际与包容'],
    ['Sustainable living', 'Kehidupan lestari', '可持续生活'],
    ['Suggestions adapt to your interests, saved learning and stamps.', 'Cadangan mengikut minat, pembelajaran tersimpan dan cop anda.', '推荐会随你的兴趣、收藏和已有印章调整。'],
    ['Matches an interest you chose.', 'Sepadan dengan minat pilihan anda.', '符合你选择的兴趣。'],
    ['You saved this for later.', 'Anda menyimpannya untuk kemudian.', '你之前收藏过这项学习。'],
    ['Builds on a topic you have explored.', 'Meneruskan topik yang pernah anda terokai.', '延续你曾探索的主题。'],
    ['Explore a new SDG learning stamp.', 'Terokai cop pembelajaran SDG baharu.', '尝试获得一枚新的 SDG 学习印章。'],
    ['Try a fresh perspective.', 'Cuba perspektif baharu.', '尝试一个新的视角。'],
    ['Show all goals', 'Tunjuk semua matlamat', '查看所有目标'],
    ['Free learning', 'Pembelajaran percuma', '免费学习'],
    ['Self-paced', 'Mengikut kadar sendiri', '按自己的节奏学习'],
    ['Try this after learning', 'Cuba selepas belajar', '学完可以尝试'],
    ['This SDG stamp is already in your passport.', 'Cop SDG ini sudah ada dalam pasport anda.', '你的护照已经拥有这枚 SDG 印章。'],
    ['Complete this learning to collect its SDG stamp.', 'Selesaikan pembelajaran ini untuk mengumpul cop SDGnya.', '完成这项学习，即可收集对应的 SDG 印章。'],
    ['SDG links are learning mappings by CareerLens. Mark Completed after finishing the resource.', 'Pemetaan SDG dibuat oleh CareerLens. Tandakan Selesai selepas menamatkan pembelajaran.', 'SDG 对应关系由 CareerLens 作学习主题映射，学完后再标记 Completed。'],
    ['Show recommendations', 'Tunjuk cadangan', '显示推荐'],
    ['Explore all topics', 'Terokai semua topik', '探索全部主题'],
    ['Learning recorded. Open your passport to see your stamp.', 'Pembelajaran direkodkan. Buka pasport untuk melihat cop anda.', '学习已记录，打开护照查看你的印章吧。'],
    ['Explore your interests', 'Terokai minat anda', '探索兴趣'],
    ['Keep a short reflection on how context, thoughts and behaviour can influence everyday wellbeing.', 'Tulis refleksi ringkas tentang pengaruh konteks, pemikiran dan tingkah laku terhadap kesejahteraan harian.', '写一段小反思，说明环境、想法与行为如何影响日常幸福感。'],
    ['Compare two explanations of a familiar human behaviour using ideas from the lectures.', 'Bandingkan dua penjelasan tentang tingkah laku manusia berdasarkan idea kuliah.', '用课程里的观点，比较两种对日常行为的不同解释。'],
    ['Create a sample monthly budget and explain the costs and risks of different borrowing choices.', 'Sediakan contoh belanjawan bulanan dan jelaskan kos serta risiko pilihan pinjaman.', '制作一份示例月度预算，并说明不同借贷选择的成本和风险。'],
    ['Map the relationships between living things in a small ecosystem near you.', 'Petakan hubungan antara hidupan dalam ekosistem kecil berhampiran anda.', '画出身边一个小生态系统里，不同生物之间的关系。'],
    ['Suggest three practical ways to make a study group or community activity more inclusive.', 'Cadangkan tiga cara praktikal menjadikan kumpulan belajar atau aktiviti komuniti lebih inklusif.', '提出三个小办法，让学习小组或社区活动更包容。'],
    ['Review a week of household waste and propose one change to reduce, reuse or recycle resources.', 'Semak sisa isi rumah selama seminggu dan cadangkan perubahan untuk mengurang, mengguna semula atau mengitar semula sumber.', '观察一周的家庭垃圾，提出一项减少浪费、重复使用或回收的改变。'],
    ['Close passport', 'Tutup pasport', '合上护照'],
    ['A little learning. A lasting journey.', 'Sedikit pembelajaran. Perjalanan bermakna.', '学一点，留下成长的足迹。'],
    ['learning stamps collected', 'cop pembelajaran dikumpul', '枚学习印章已收集'],
    ['Every small step leaves a mark.', 'Setiap langkah kecil meninggalkan kesan.', '每一小步，都值得留下印记。'],
    ['Your personal SDG learning journey', 'Perjalanan pembelajaran SDG peribadi anda', '你的专属 SDG 学习旅程'],
    ['Passport holder', 'Pemegang pasport', '护照持有人'],
    ['completed courses', 'kursus selesai', '门课程已完成'],
    ['recorded learning', 'pembelajaran direkodkan', '已记录学习'],
    ['learning stamps', 'cop pembelajaran', '学习印章'],
    ['Gold stamp = completed learning. Empty circle = a milestone to explore.', 'Cop emas = pembelajaran selesai. Bulatan kosong = pencapaian untuk diteroka.', '金色印章代表已完成的学习，空白圆圈等待下一段成长。'],
    ['Stamp earned', 'Cop diperoleh', '已获得印章'],
    ['Not yet earned', 'Belum diperoleh', '等待解锁'],
    ['Your completed learning behind this stamp', 'Pembelajaran selesai bagi cop ini', '这枚印章对应的已完成学习'],
    ['Complete a mapped course and mark it Completed to collect this stamp.', 'Lengkapkan kursus berkaitan dan tandakannya Selesai untuk mengumpul cop ini.', '完成对应课程，并将学习状态设为 Completed，即可获得这枚印章。'],
    ['No course in your current learning paths maps to this goal yet. It stays open for a future milestone.', 'Belum ada kursus dalam laluan semasa yang dipetakan kepada matlamat ini. Ruang ini menanti pencapaian akan datang.', '当前学习路径还没有对应这个目标的课程，先为未来的成长留一个位置。'],
    ['Go to my learning plan', 'Ke pelan pembelajaran saya', '前往我的学习计划'],
    ['Self-reported learning milestones, saved on this device.', 'Pencapaian pembelajaran dilaporkan sendiri dan disimpan pada peranti ini.', '根据你自行记录的学习进度生成，保存在当前设备。'],
    ['My career details', 'Butiran kerjaya saya', '我的职业成长资料'],
    ['estimated learning', 'anggaran pembelajaran', '预计学习'],
    ['Role alignment suggests a direction; completed learning earns a stamp.', 'Penjajaran kerjaya memberi arah; pembelajaran yang selesai memperoleh cop.', '职业方向提供参考，完成对应学习后才会获得印章。'],
    ['Focus · 25 min', 'Fokus · 25 min', '专注 · 25 分钟'],
    ['Break · 5 min', 'Rehat · 5 min', '休息 · 5 分钟'],
    ['Start focus', 'Mula fokus', '开始专注'],
    ['Start break', 'Mula rehat', '开始休息'],
    ['Pause', 'Jeda', '暂停'],
    ['Resume', 'Sambung', '继续'],
    ['Reset', 'Tetap semula', '重置'],
    ['Focus sessions', 'Sesi fokus', '完成专注'],
    ['Sound on', 'Bunyi hidup', '声音已开'],
    ['Sound off', 'Bunyi mati', '声音已关'],
    ['One tomato, one small step.', 'Satu tomato, satu langkah kecil.', '一颗小番茄，进步一小步。'],
    ['One small step. You have got this!', 'Satu langkah kecil. Anda boleh!', '专注一小步，你可以的！'],
    ['Paused. Your tomato will wait.', 'Dijeda. Tomato anda menunggu.', '已暂停，小番茄等你回来。'],
    ['Relax your eyes and stretch a little.', 'Rehatkan mata dan regangkan badan.', '让眼睛休息一下，伸个懒腰。'],
    ['A fresh start, whenever you are ready.', 'Mula semula apabila anda bersedia.', '准备好了，就重新开始吧。'],
    ['Time for a little breather.', 'Masa untuk berehat sebentar.', '给自己一个小小的休息。'],
    ['Nice work! Your tomato is ready. Take a little break.', 'Bagus! Tomato anda sudah siap. Berehat sebentar.', '做得好！小番茄成熟啦，休息一下吧。'],
    ['Break is over. Ready for another small step?', 'Rehat tamat. Sedia untuk langkah seterusnya?', '休息结束啦，准备再进步一小步吗？'],
    ['Welcome back. Your timer is still running.', 'Selamat kembali. Pemasa anda masih berjalan.', '欢迎回来，番茄钟还在计时。'],
    ['AI question generation is not connected yet. Please try again later.', 'Penjanaan soalan AI belum disambungkan. Sila cuba lagi kemudian.', 'AI 问题生成功能尚未接入，请稍后再试。'],
    ['Uses shared skills and project evidence to generate questions.', 'Menggunakan kemahiran dan bukti projek yang dikongsi untuk menjana soalan.', '根据已分享的技能和项目依据生成问题。'],
    ['New AI interview questions are ready. Review before use.', 'Soalan temu duga AI baharu tersedia. Semak sebelum digunakan.', '新的 AI 面试问题已生成，请在使用前审核。'],
    ['AI is not configured yet. Set GEMINI_API_KEY on the server, then retry.', 'AI belum dikonfigurasi. Tetapkan GEMINI_API_KEY pada pelayan, kemudian cuba lagi.', 'AI 尚未配置，请在服务器设置 GEMINI_API_KEY 后重试。'],
    ['The AI model configuration is invalid.', 'Konfigurasi model AI tidak sah.', 'AI 模型配置无效。'],
    ['Interview focus (optional)', 'Fokus temu duga (pilihan)', '追问方向（选填）'],
    ['e.g. technical depth, project ownership, problem solving', 'cth. kedalaman teknikal, tanggungjawab projek, penyelesaian masalah', '例如：技术深度、项目职责、解决问题的能力'],
    ['Generate new questions with AI', 'Jana soalan baharu dengan AI', 'AI 重新生成问题'],
    ['Uses shared skills and project evidence with Google Gemini.', 'Menggunakan kemahiran dan bukti projek yang dikongsi dengan Google Gemini.', '通过 Google Gemini，使用已分享的技能和项目依据生成。'],
    ['Generating new interview questions…', 'Menjana soalan temu duga baharu…', '正在生成新的面试问题……'],
    ['New questions generated by Google Gemini. Review before use.', 'Soalan baharu dijana oleh Google Gemini. Semak sebelum digunakan.', '新问题由 Google Gemini 生成，请在使用前审核。'],
    ['AI took too long. Your current questions are unchanged. Please retry.', 'AI mengambil masa terlalu lama. Soalan semasa dikekalkan. Sila cuba lagi.', 'AI 响应超时，已保留原来的问题，请重试。'],
    ['Could not generate new questions. Your current questions are unchanged. Please retry.', 'Soalan baharu tidak dapat dijana. Soalan semasa dikekalkan. Sila cuba lagi.', '新问题生成失败，已保留原来的问题，请重试。'],
    ['Invalid interview question request.', 'Permintaan soalan temu duga tidak sah.', '面试问题请求无效。'],
    ['Select a valid vacancy.', 'Pilih kekosongan jawatan yang sah.', '请选择有效职位。'],
    ['Your saved skills are waiting', 'Kemahiran yang anda simpan sedang menanti', '你收藏的技能正在等你学习'],
    ['Pick up a saved skill when you are ready.', 'Teruskan kemahiran yang disimpan apabila anda bersedia.', '准备好时，从收藏的技能开始学习吧。'],
    ['View saved skills', 'Lihat kemahiran disimpan', '查看收藏技能'],
    ['Dismiss learning reminder', 'Tutup peringatan pembelajaran', '关闭学习提醒'],
    ['Learn skill ↗', 'Pelajari kemahiran ↗', '学习技能 ↗'],
    ['Continue learning ↗', 'Teruskan pembelajaran ↗', '继续学习 ↗'],
    ['Learning progress', 'Kemajuan pembelajaran', '学习进度'],
    ['Progress is self-reported and saved on this device for your account.', 'Kemajuan dilaporkan sendiri dan disimpan pada peranti ini untuk akaun anda.', '学习进度由你自行记录，按账号保存在当前设备。'],
    ['Why this is recommended', 'Mengapa ini disyorkan', '为什么推荐给你'],
    ['Your profile already includes', 'Profil anda sudah merangkumi', '你的资料已包含'],
    ['Skill to build for your target role', 'Kemahiran untuk dibina bagi jawatan sasaran', '目标岗位需要补充的技能'],
    ['Suggested practice outcome', 'Cadangan hasil latihan', '建议练习成果'],
    ['Create a small portfolio example using this skill and explain your decisions.', 'Cipta contoh portfolio kecil menggunakan kemahiran ini dan jelaskan keputusan anda.', '运用这项技能制作一个小型作品，并说明你的设计思路。'],
    ['Build a small AI assistant that connects a language model to a tool.', 'Bina pembantu AI kecil yang menghubungkan model bahasa dengan alat.', '制作一个能连接语言模型与工具的小型 AI 助手。'],
    ['Build a prototype that answers questions using a PDF and cites its sources.', 'Bina prototaip yang menjawab soalan menggunakan PDF dan menyatakan sumbernya.', '制作一个根据 PDF 回答问题并标注来源的原型。'],
    ['Create a small evaluation set to check an AI assistant for unsafe or unsupported answers.', 'Cipta set penilaian kecil untuk menyemak jawapan pembantu AI yang tidak selamat atau tidak berasas.', '设计一组测试问题，检查 AI 助手是否给出不安全或缺乏依据的回答。'],
    ['Create a Python script that automates a repetitive task and document the result.', 'Cipta skrip Python yang mengautomasikan tugas berulang dan dokumentasikan hasilnya.', '编写一个自动处理重复任务的 Python 脚本，并记录成果。'],
    ['Write queries that answer a practical business question using a sample dataset.', 'Tulis pertanyaan yang menjawab soalan perniagaan praktikal menggunakan set data contoh.', '使用示例数据编写查询，回答一个实际业务问题。'],
    ['Build a small application that reads and displays data from an API.', 'Bina aplikasi kecil yang membaca dan memaparkan data daripada API.', '制作一个读取并展示 API 数据的小型应用。'],
    ['Save for later', 'Simpan untuk kemudian', '收藏，稍后学'],
    ['Saved for later', 'Disimpan untuk kemudian', '已收藏'],
    ['Learning status', 'Status pembelajaran', '学习状态'],
    ['Completed', 'Selesai', '已完成'],
    ['Not started', 'Belum bermula', '未开始'],
    ['Learning', 'Sedang belajar', '学习中'],
    ['Your next learning goal', 'Matlamat pembelajaran seterusnya', '你的下一个学习目标'],
    ['Estimated study time', 'Anggaran masa belajar', '预计学习时间'],
    ['All learning steps are complete. Add your practice project to your CV.', 'Semua langkah pembelajaran selesai. Tambahkan projek latihan anda pada CV.', '所有学习步骤已完成，可以把练习项目加入简历。'],
    ['Could not save learning progress. Please retry.', 'Kemajuan pembelajaran tidak dapat disimpan. Sila cuba lagi.', '无法保存学习进度，请重试。'],
    ['Loading notifications…', 'Memuatkan pemberitahuan…', '正在加载通知……'],
    ['Double-click the bell to open all notifications.', 'Klik dua kali pada loceng untuk membuka semua pemberitahuan.', '双击铃铛可进入完整通知页面。'],
    ['Open notifications', 'Buka pemberitahuan', '打开通知页面'],
    ['Candidate Learning', 'Pembelajaran Calon', '候选人学习'],
    ['View CV-based interview questions ↻', 'Lihat soalan temu duga berdasarkan CV ↻', '查看根据简历定制的面试问题 ↻'],
    ['CV-based interview questions', 'Soalan temu duga berdasarkan CV', '根据简历定制的面试问题'],
    ['Back to candidate ↻', 'Kembali ke calon ↻', '翻回候选人资料 ↻'],
    ['Suggested prompts based on shared CV evidence and role requirements. Adapt them during the interview.', 'Cadangan soalan berdasarkan bukti CV yang dikongsi dan keperluan jawatan. Sesuaikan semasa temu duga.', '根据已分享的简历依据和岗位要求准备的建议问题，可在面试中调整。'],
    ['Not enough shared CV evidence to tailor questions. Review the candidate profile first.', 'Bukti CV yang dikongsi tidak mencukupi untuk menyesuaikan soalan. Semak profil calon dahulu.', '已分享的简历依据不足，请先查看候选人资料。'],
    ['Shortlisting', 'Senarai pendek', '入选名单'],
    ['Interview preparation', 'Persediaan temu duga', '面试准备'],
    ['Shortlisting & interviews', 'Senarai pendek & temu duga', '入选名单与面试'],
    ['Candidate skills & qualifications', 'Kemahiran & kelayakan calon', '候选人技能与资历'],
    ['Compare CV evidence before making your shortlist decision.', 'Bandingkan bukti CV sebelum membuat keputusan senarai pendek.', '对比简历依据后，再决定入选名单。'],
    ['Shortlist filters', 'Penapis senarai pendek', '入选名单筛选'],
    ['Shortlisted candidates', 'Calon disenarai pendek', '已入选候选人'],
    ['Review your shortlist and arrange interviews here.', 'Semak senarai pendek anda dan aturkan temu duga di sini.', '在这里查看入选名单并安排面试。'],
    ['Refresh shortlist', 'Muat semula senarai pendek', '刷新入选名单'],
    ['Back to screening', 'Kembali ke saringan', '返回候选人筛选'],
    ['Shortlist decisions are saved on this device for your account and vacancy.', 'Keputusan senarai pendek disimpan pada peranti ini mengikut akaun dan kekosongan jawatan anda.', '入选决定按账号和职位保存在此设备上。'],
    ['No shortlisted candidates yet.', 'Belum ada calon disenarai pendek.', '暂无入选候选人。'],
    ['Select Shortlist in Candidate Screening to add candidates here.', 'Pilih Senarai pendek dalam Saringan Calon untuk menambah calon di sini.', '在候选人筛选中选择“入选”，即可将候选人加入这里。'],
    ['Remove from shortlist', 'Keluarkan daripada senarai pendek', '移出入选名单'],
    ['Shortlist candidate', 'Senarai pendekkan calon', '将候选人加入入选名单'],
    ['Could not save your decision. Please retry.', 'Keputusan anda tidak dapat disimpan. Sila cuba lagi.', '无法保存决定，请重试。'],
    ['Could not refresh some shortlisted candidates. Please retry.', 'Sesetengah calon dalam senarai pendek tidak dapat dimuat semula. Sila cuba lagi.', '部分入选候选人刷新失败，请重试。'],
    ['Collapse page guide', 'Kecilkan panduan halaman', '折叠页面导航'],
    ['Expand page guide', 'Kembangkan panduan halaman', '展开页面导航'],
    ['Experience & qualifications', 'Pengalaman & kelayakan', '经验与资历'],
    ['Sharing & access', 'Perkongsian & akses', '分享与访问权限'],
    ['Job vacancies', 'Kekosongan jawatan', '招聘职位'],
    ['Common questions', 'Soalan umum', '基本资料'],
    ['Target role', 'Jawatan sasaran', '目标岗位'],
    ['Company profile', 'Profil syarikat', '企业资料'],
    ['Candidate screening', 'Saringan calon', '候选人筛选'],
    ["On this page", "Pada halaman ini", "本页位置"],
    ["Current section", "Bahagian semasa", "当前区块"],
    ["Account profile", "Profil akaun", "账号资料"],
    ["CV upload", "Muat naik CV", "上传简历"],
    ["Review your organised profile", "Semak profil tersusun anda", "审核整理后的资料"],
    ["Your career journey", "Perjalanan kerjaya anda", "你的职业旅程"],
    ["Career snapshot", "Ringkasan kerjaya", "职业概览"],
    ["Top role matches", "Padanan jawatan terbaik", "最佳匹配岗位"],
    ["Skill verification", "Pengesahan kemahiran", "技能验证"],
    ["AI adoption scenario", "Senario penggunaan AI", "AI 采用情景"],
    ["Skills & automation risks", "Kemahiran & risiko automasi", "技能与自动化风险"],
    ["Rising skills", "Kemahiran meningkat", "增长中的技能"],
    ["Automation risks", "Risiko automasi", "自动化风险"],
    ["Research signals", "Isyarat penyelidikan", "研究信号"],
    ["Role matches", "Padanan jawatan", "岗位匹配"],
    ["Learning pathway", "Laluan pembelajaran", "学习路径"],
    ["Your SDG passport", "Pasport SDG anda", "你的 SDG 护照"],
    ["Location & search", "Lokasi & carian", "位置与搜索"],
    ["Nearby companies", "Syarikat berdekatan", "附近企业"],
    ["Interview invitations", "Jemputan temu duga", "面试邀请"],
    ["Hiring overview", "Gambaran pengambilan", "招聘概览"],
    ["Hiring & screening", "Pengambilan & saringan", "招聘与筛选"],
    ["Candidate ranking", "Kedudukan calon", "候选人排名"],
    ["Screening filters", "Penapis saringan", "筛选条件"],
    ["Screening summary", "Ringkasan saringan", "筛选概况"],
    ["Comparison filters", "Penapis perbandingan", "对比条件"],
    ["Skills & qualifications", "Kemahiran & kelayakan", "技能与资历"],
    ["Candidate details", "Butiran calon", "候选人详情"],
    ["Learning suggestions", "Cadangan pembelajaran", "学习建议"],
    ['Scenario intensity', 'Keamatan senario', '情景强度'],
    ['Blended AI adoption scenario', 'Senario penggunaan AI campuran', 'AI 采用混合情景'],
    ['Drag to explore a continuous blend between Moderate and Fast. Illustrative estimates, not predictions.', 'Seret untuk meneroka peralihan berterusan antara Sederhana dan Pesat. Anggaran ilustrasi, bukan ramalan.', '拖动滑杆，连续查看中等与快速情景之间的变化。数值为示例估算，并非预测。'],
    ['Suggested', 'Cadangan', '推荐'],
    ['skill coverage', 'liputan kemahiran', '技能覆盖'],
    ['Use', 'Pilih', '采用'],
    ['Selected', 'Dipilih', '已选'],
    ['Limited evidence', 'Bukti terhad', '依据不足'],
    ['Why this role?', 'Mengapa jawatan ini?', '推荐依据'],
    ['Why this score?', 'Mengapa skor ini?', '分数依据'],
    ['Fit score uses profile-listed skills and stated preferences. CV mentions are not proof of proficiency. Market demand is shown separately.', 'Skor kesesuaian menggunakan kemahiran dalam profil dan pilihan yang dinyatakan. Sebutan dalam CV bukan bukti kemahiran. Permintaan pasaran dipaparkan secara berasingan.', '匹配分根据个人资料中的技能和填写的偏好计算。简历提及不等于能力证明。市场需求会单独展示。'],
    ['Direct role skills', 'Kemahiran teras jawatan', '岗位核心技能'],
    ['Transferable skills', 'Kemahiran boleh pindah', '可迁移技能'],
    ['Industry alignment', 'Padanan industri', '行业匹配'],
    ['Work mode fit', 'Padanan cara kerja', '工作方式匹配'],
    ['Core skills still to build', 'Kemahiran teras untuk dibina', '仍需提升的核心技能'],
    ['Still needed', 'Masih diperlukan', '仍需具备'],
    ['Not specified', 'Tidak dinyatakan', '未填写'],
    ['matched', 'sepadan', '项匹配'],
    ['points', 'mata', '分'],
    ['None', 'Tiada', '无'],
  );
  const dictionary = new Map(rows.map(row => [row[0],row]));
  // Additional English/Chinese UI copy; original data and API values stay unchanged.
  const chineseRows = `
Edit Profile ⚙️|编辑资料 ⚙️
Talent Account|求职者账号
Account registered|账号已注册
Email:|邮箱：
Email|邮箱
Phone|电话
Joined:|注册日期：
Joined|注册于
Edit Profile & Information|编辑个人资料
Security & Password|安全与密码
Current Role|当前岗位
Career Field|职业领域
Preferred Mode|意向工作模式
Your CV, your sharing choices|你的简历，由你决定如何分享
Private by default|默认不公开
Your PDF and organised profile are available to your signed-in account. An employer receives only the summary and/or PDF you choose to share when applying to its vacancy. Aggregate publication is currently disabled; your optional statistics preference is off by default. You can export your profile, withdraw sharing, or delete your vault below.|PDF 和整理后的资料仅供你登录后查看。申请职位时，雇主只会收到你选择分享的摘要和／或 PDF。目前不发布汇总统计，可选统计偏好默认关闭。你可以在下方导出资料、撤回分享或删除简历库。
Optional statistics preference (publication disabled)|可选统计偏好（目前不发布）
Hackathon demo — use fictional CVs only.|黑客松演示——仅使用虚构简历。
This prototype uses a local, rule-based PDF parser; it is not a trained AI model and does not verify qualifications. Do not upload real names, contact details, identity documents, or confidential information. Text-based PDFs work best; image-only scans need OCR before upload.|此原型使用本地规则式 PDF 解析器，未经 AI 模型训练，也不核实资历。请勿上传真实姓名、联系方式、身份证件或机密信息。建议使用可提取文字的 PDF；纯图片扫描件需先进行文字识别。
Text-based PDF · maximum 8 MB|文字型 PDF · 最大 8 MB
I confirm my custom PDF contains only fictional, synthetic information.|我确认上传的 PDF 仅包含虚构、合成的信息。
Extract, check the evidence, then review your profile before sharing|提取内容并核对依据，审核资料后再分享
1. Check PDF|1. 检查 PDF
2. Extract text|2. 提取文字
3. Review draft|3. 审核草稿
Try without a custom upload|无需上传自己的文件即可试用
2. Review your organised profile|2. 审核整理后的个人资料
No PDF yet|尚未上传 PDF
Upload a PDF CV above to extract your structured profile|请在上方上传 PDF 简历以提取结构化资料
Review required before sharing|分享前须审核资料
Upload a sample or fictional PDF to begin.|上传示例或虚构 PDF 以开始。
Draft professional summary|职业摘要草稿
Personal & career details|个人与职业资料
Check your contact information and work preferences.|核对联系方式和工作偏好。
Current role / headline|当前岗位／职业标题
Industry sector|所属行业
Not specified|未填写
Preferred work mode|意向工作模式
Leave blank if unknown; 0 means no experience.|不确定时请留空；0 表示没有经验。
Experience & qualifications|经验与资历
Keep each entry clear and supported by your CV.|请确保每项内容清晰，且有简历依据。
Work experience|工作经历
Projects|项目经历
Certifications|证书
extracted mentions are not proof of proficiency|提取到的技能名称不代表熟练程度
Original extraction evidence (before your edits)|原始提取依据（编辑前）
Quotes and page numbers explain the parser's draft. Your edits are self-reported and are not independently verified.|原文引用和页码用于说明解析草稿的依据。你编辑的内容属于自行申报，未经独立核实。
I have checked the summary, contact details, sections and skills against the PDF, and corrected any mistakes. Mark this profile as reviewed when I save.|我已对照 PDF 核对摘要、联系方式、各项经历及技能，并修正错误。保存时将此资料标记为已审核。
Browse & Apply Jobs →|浏览并申请职位 →
Save reviewed profile →|保存已审核资料 →
Sharing & access|分享与访问权限
Choose who can view your CV and review their access below.|选择谁可以查看你的简历，并在下方管理访问权限。
Share with someone you choose|分享给指定接收者
The recipient needs a CareerLens account. Only that signed-in account can open the link. No email is sent.|接收者需要拥有 CareerLens 账号，仅该账号登录后可打开链接。系统不会发送邮件。
Recipient account email|接收者账号邮箱
Share reviewed summary, including contact details|分享已审核摘要（包含联系方式）
Share complete original PDF|分享完整原始 PDF
Access expires after|访问有效期
1 day|1 天
7 days|7 天
30 days|30 天
Create recipient access|授权接收者访问
Editing or replacing the CV ends existing grants. Revoking access cannot retract copies already saved by a recipient.|编辑或替换简历将终止现有授权。撤销访问无法收回接收者已保存的副本。
Recent recipient access|接收者最近的访问记录
3. Manage employer access|3. 管理雇主访问权限
Each application grants access only to that vacancy's company account. Withdrawal blocks future access here; it cannot retract copies already downloaded.|每次申请仅向该职位所属企业账号授权。撤回申请将阻止后续访问，但无法收回已下载的副本。
Export profile JSON|导出资料 JSON
Delete my vault|删除我的简历库
Recorded employer accesses through this app|通过本应用记录的雇主访问
Selected Location|所选位置
Use Current Location|使用当前位置
Search Building, Condo, Street, or Area|搜索建筑、公寓、街道或地区
Search|搜索
Display Scope|显示范围
Matched Only|仅显示匹配项
View All Nearby|查看附近全部职位
Search Radius:|搜索半径：
Nearby Hiring Companies|附近正在招聘的企业
Your Location|你的位置
CV-Matched|与简历匹配
Other Sectors|其他行业
Loading...|正在加载……
Clear Company Filter|清除企业筛选
Matched Roles|匹配岗位
All Nearby Roles|附近全部岗位
All Job Sectors|全部行业
Sort: Best Match|排序：匹配度最高
Sort: Nearest Distance|排序：距离最近
Sort: Highest Salary|排序：薪资最高
Load More Jobs ↓|加载更多职位 ↓
Application Questionnaire & Skill Verification|申请问卷与技能验证
Allow Google Gemini to process my reviewed CV summary, work/project details and questionnaire answers for role suggestions and questions. Optional; local processing sends nothing to Google.|允许 Google Gemini 处理我已审核的简历摘要、工作／项目经历和问卷答案，以推荐岗位并生成问题。此项可选；本地处理不会向 Google 发送数据。
AI Verification|AI 验证
3 Skill Questions|3 道技能问题
3 AI Verification Questions|3 道 AI 技能验证题
Targeted scenarios generated based on your uploaded CV and target role.|根据上传的简历和目标岗位生成针对性情景题。
Generate My 3 Questions|生成我的 3 道题
Click "Generate My 3 Questions" above to load customized skill verification scenarios.|点击上方“生成我的 3 道题”，加载定制的技能验证情景题。
Submit Answers & Get Score →|提交答案并获取评分 →
Refresh Trends|刷新趋势
Data Sources & Citations|数据来源与引用
JobStreet Malaysia Open Labour Index (2026):|JobStreet 马来西亚公开就业指数（2026）：
Aggregated real-time job vacancy signals across 69,000+ postings[cite: 52].|汇总超过 69,000 条招聘信息的实时职位信号[cite: 52]。
World Economic Forum (WEF) Future of Jobs Report:|世界经济论坛（WEF）《未来就业报告》：
Benchmark technology adoption curves and AI disruption velocity models.|技术采用曲线与 AI 变革速度模型基准。
UNESCO & SDG 4 / 8 Frameworks:|联合国教科文组织与 SDG 4／8 框架：
Aligned with Quality Education and Decent Work & Economic Growth guidelines.|对齐优质教育、体面工作和经济增长目标。
Share organised CV summary|分享整理后的简历摘要
(including saved contact details, skills, education, experience, projects and certifications)|（包括已保存的联系方式、技能、教育、工作经历、项目及证书）
Share original PDF CV|分享原始 PDF 简历
(all content in the uploaded file; recipients may save a copy)|（包含上传文件的全部内容；接收者可保存副本）
Permission applies only to the company account that owns this vacancy. Withdrawal stops future access here but cannot retract downloaded copies. Editing the profile or replacing the PDF revokes previous sharing. Review and share again to give access to your updates.|授权仅适用于该职位所属的企业账号。撤回将停止后续访问，但无法收回已下载的副本。编辑资料或替换 PDF 会撤销原有分享。请重新审核并分享，以授权访问更新后的内容。
Confirm & submit application →|确认并提交申请 →
Account Profile & Settings|账号资料与设置
Job Seeker|求职者
User ID:|用户编号：
Profile Information|个人资料
Full Name|姓名
Email Address|邮箱地址
Current Role / Title|当前岗位／职称
Career Field / Industry|职业领域／行业
Engineering & Manufacturing|工程与制造
Healthcare & Life Sciences|医疗与生命科学
Education & EdTech|教育与教育科技
Preferred Work Mode|意向工作模式
Highest Education|最高学历
Location / City|地区／城市
Sharing is your choice|由你决定是否分享
Active|已启用
Your CV stays private until you choose a recipient and access scope. This demo does not verify real-world identity or certify legal compliance.|在你选择接收者和访问范围前，简历保持私密。此演示不会核实真实身份，也不提供法律合规认证。
Save Profile Changes →|保存资料修改 →
Current Password|当前密码
New Password|新密码
Confirm New Password|确认新密码
Update Password →|更新密码 →
View & Edit Account Profile|查看和编辑账号资料
Edit Profile|编辑资料
Edit your account information|编辑账号信息
Update password|更新密码
Choose a fictional PDF CV|选择虚构的 PDF 简历
Upload progress|上传进度
Review the extracted summary. Keep only statements supported by the CV.|审核提取的摘要，仅保留有简历依据的内容。
One entry per line|每行填写一项
Add a skill and press Enter (e.g. Python Data Analysis)|输入技能后按 Enter 添加（例如 Python 数据分析）
Select State or Wilayah Persekutuan|选择州属或联邦直辖区
Enter condo, building, street, or area (e.g. Banyan Mont Kiara, PV128 Setapak, Mount Austin)...|输入公寓、建筑、街道或地区（例如 Banyan Mont Kiara、PV128 Setapak、Mount Austin）……
Clear|清除
Search by job title, skill, or company...|搜索职位、技能或企业……
Filter by job sector|按行业筛选
Sort job vacancies|职位排序
Close application|关闭申请窗口
Your display name|你的显示名称
e.g. Financial Auditor / Software Dev|例如：财务审计员／软件开发人员
Enter current password|输入当前密码
Min. 8 chars with uppercase, lowercase, number & symbol|至少 8 个字符，包含大写、小写字母、数字和符号
Re-type new password|再次输入新密码
Employer Company|雇主企业
Verified Employer|已验证雇主
Company Workspace|企业工作区
Login:|登录邮箱：
Contact:|联系人：
Edit Company Profile|编辑企业资料
Refresh|刷新
Employer Account Profile|雇主账号资料
HR & Employer Portal|人力资源与雇主门户
Account UID:|账号编号：
Company & HR Profile|企业与人力资源资料
HR Contact Name|人力资源联系人姓名
Work Email Address|工作邮箱
Company Name|企业名称
HR / Executive Title|人力资源／管理职称
Company Size|企业规模
1–50 Employees (Small / Startup)|1–50 名员工（小型／初创企业）
51–250 Employees (Medium Enterprise)|51–250 名员工（中型企业）
250+ Employees (Large Enterprise)|250 名以上员工（大型企业）
Industry Sector|所属行业
General Enterprise|综合企业
Company Headquarters / Office Location|企业总部／办公地点
Save Company Changes →|保存企业资料修改 →
Company Profile|企业资料
Edit Company Account & Profile|编辑企业账号与资料
Your full name|你的姓名
e.g. Nexus Digital Sdn Bhd|例如：Nexus Digital Sdn Bhd
e.g. Head of Talent & Reskilling|例如：人才与技能提升主管
e.g. Kuala Lumpur, Malaysia|例如：马来西亚吉隆坡
Shared CV · CareerLens|共享简历 · CareerLens
CareerLens · Private sharing|CareerLens · 私密分享
Access unavailable|无法访问
Sign in / return to CareerLens|登录／返回 CareerLens
Download shared original PDF|下载共享的原始 PDF
Reviewed career summary|已审核的职业摘要
Reviewed by the CV owner. CareerLens has not independently verified these qualifications or skills.|已由简历所有者审核。CareerLens 未独立核实这些资历或技能。
The owner shared only the original PDF. Their structured profile is private.|所有者仅分享了原始 PDF，结构化资料仍为私密。
Return to workspace|返回工作区
PDF|PDF
Try sample|试用示例
No source quote available.|没有可用的原文引用。
No field evidence available.|没有可用的字段依据。
CV wording signals · local keyword heuristics|简历措辞信号 · 本地关键词规则分析
(confidence not validated) · Major:|（置信度未经验证）· 专业：
No recorded employer access.|暂无雇主访问记录。
Withdraw & revoke access|撤回申请并撤销访问
No active applications. No employer has permission to access this CV through an application.|暂无有效申请，没有雇主获准通过申请访问此简历。
No skills extracted. Add only skills supported by the CV.|未提取到技能，请仅添加有简历依据的技能。
Select State / Wilayah...|选择州属／直辖区……
available at this company|该企业正在招聘
Available Positions|正在招聘的职位
View All Nearby Roles →|查看附近全部岗位 →
APPLIED|已申请
Applied|已申请
Choose access for this vacancy owner|选择向该职位所属企业授权的内容
Aggregate demo statistics|汇总演示统计
Analyzing CV and generating 3 targeted verification scenarios...|正在分析简历并生成 3 道针对性验证情景题……
Failed to generate questions. Please try again.|问题生成失败，请重试。
Network error while generating questions.|生成问题时发生网络错误。
Submission failed. Try again.|提交失败，请重试。
Account & Profile|账号与资料
Account & Professional Background|账号与职业背景
Account profile & skills vault|账号资料与技能库
Saving...|正在保存……
Account profile updated successfully!|账号资料更新成功！
Please enter all password fields.|请填写所有密码栏。
New passwords do not match.|两次新密码不一致。
Updating...|正在更新……
Password updated successfully!|密码更新成功！
Unsaved changes. Check your edits and confirm the review before saving.|有未保存的修改。请核对修改并确认审核后再保存。
Unsaved changes|有未保存的修改
Discard unsaved edits and reload the saved profile?|放弃未保存的修改并重新加载已保存的资料？
Replace the current PDF and organised profile?|替换当前 PDF 和整理后的资料？
Your current profile edits will be replaced.|当前资料修改将被替换。
Any links shared with named recipients will also be revoked. Previously downloaded copies cannot be retracted.|分享给指定接收者的链接也会被撤销，已下载的副本无法收回。
Your vault change was saved, but some related data could not refresh. Please reload.|简历库修改已保存，但部分相关数据未能刷新，请重新加载页面。
PDF processed. Review the draft before sharing.|PDF 已处理，请在分享前审核草稿。
Preference saved. Aggregate publication is currently disabled.|偏好已保存，目前不发布汇总统计。
Check your profile against the PDF, then tick the review confirmation.|请对照 PDF 核对资料，然后勾选审核确认。
Enter the name shown on the fictional CV.|请输入虚构简历上的姓名。
Saving these edits will withdraw existing applications and revoke recipient sharing. Continue?|保存这些修改将撤回现有申请并撤销接收者访问授权，是否继续？
Saving your reviewed profile…|正在保存已审核资料……
Reviewed profile saved. Choose employer access when you apply.|已保存审核后的资料，请在申请职位时选择雇主访问权限。
Exported the saved profile. Unsaved edits are not included.|已导出保存的资料，不包含未保存的修改。
Delete your stored PDF and organised profile, withdraw all applications and revoke future employer and recipient access? This cannot be undone. Previously downloaded copies cannot be retracted.|删除已保存的 PDF 和整理后的资料，撤回所有申请并撤销雇主及接收者的后续访问权限？此操作无法撤销，已下载的副本无法收回。
Please enter a building, street, or area name.|请输入建筑、街道或地区名称。
Location services are unavailable in this browser.|此浏览器无法使用定位服务。
Detecting Location...|正在获取位置……
Location access was declined. Please search your address or select a state.|定位权限被拒绝，请搜索地址或选择州属。
Save your reviewed CV before choosing application permissions.|请先保存已审核的简历，再选择申请权限。
Choose what to share before applying.|申请前请选择要分享的内容。
Save your reviewed profile before sharing.|分享前请先保存已审核的资料。
Withdraw application and revoke future employer access? Previously downloaded copies cannot be recalled.|撤回申请并撤销雇主的后续访问权限？已下载的副本无法收回。
3 AI Verification questions successfully generated!|已成功生成 3 道 AI 技能验证题！
Submitting answers...|正在提交答案……
Verification answers evaluated!|验证答案已评分！
Open explicitly shared original PDF|打开已明确授权分享的原始 PDF
Reviewed professional summary|已审核的职业摘要
Review status|审核状态
Reviewed by the CV owner|已由简历所有者审核
Not independently verified|未经独立核实
Access to this CV has been recorded in the candidate's access log.|此次简历访问已记录在候选人的访问日志中。
Employer profile updated successfully!|雇主资料更新成功！
Vacancies unavailable|招聘职位暂不可用
Vacancy created|职位已创建
Delete this vacancy?|删除此招聘职位？
Vacancy deleted|职位已删除
Questions copied|问题已复制
Copy failed|复制失败
Ask Lumi|询问 Lumi
Career Advisor|职业顾问
Preparing your career insights...|正在准备职业建议……
Unable to start a secure session.|无法建立安全会话。
Google processing is off. Choose a role yourself or allow processing above.|Google 处理已关闭，请自行选择岗位，或在上方授权处理。
Recipient-only link|仅限接收者使用的链接
Recipient-only share link|仅限接收者使用的分享链接
Revoke access|撤销访问权限
No active recipient shares.|暂无有效的接收者分享。
Choose the content to share.|请选择要分享的内容。
Recipient access revoked.|已撤销接收者访问权限。
Could not load recipient access.|无法加载接收者访问权限。
Could not create share.|无法创建分享。
Could not revoke access.|无法撤销访问权限。
Profile Information|个人资料
Close Advisor|关闭顾问
Lumi · Talent & Workforce Advisor|Lumi · 人才与团队顾问
Lumi · Career Advisor|Lumi · 职业顾问
Support for candidate screening & workforce planning|提供候选人筛选与团队规划支持
Personalised guidance for your career, skills & job search|为你的职业、技能及求职提供个性化建议
Open Lumi Career Advisor|打开 Lumi 职业顾问
Lumi Career Advisor|Lumi 职业顾问
Online|在线
Allow Google Gemini to rewrite replies using my message and reviewed CV profile. Optional; off by default.|允许 Google Gemini 根据我的消息及已审核简历资料改写回复。此项可选，默认关闭。
Ask about nearby roles, career paths, skills, or courses...|询问附近岗位、职业路径、技能或课程……
Welcome! I am Lumi, your Talent & Workforce Advisor.|欢迎！我是 Lumi，你的人才与团队顾问。
Welcome! I am Lumi, your Career Advisor.|欢迎！我是 Lumi，你的职业顾问。
How may I assist you with|我可以如何帮助你处理
candidate screening|候选人筛选
submitted applications|已提交的申请
team skill readiness|团队技能就绪度
today?|？
I can help you explore|我可以帮你探索
nearby job opportunities|附近的就业机会
future role matches|未来岗位匹配
reskilling pathways|技能提升路径
or review your|或查看你的
CV profile|简历资料
Ask me about|欢迎询问
career pathways, nearby job matching, skill development, or candidate screening|职业路径、附近岗位匹配、技能发展或候选人筛选
Please let me know how I can assist you.|请告诉我你需要什么帮助。
Generating...|正在生成……
Regenerate Questions|重新生成问题
Type your answer or practical approach here...|在此填写你的答案或实际做法……
Scenario-Based|情景题
Medium|中等
Skill Test|技能测试
Domain & Ethics Standard|领域与道德规范
Technical Proficiency|技术能力
Problem Solving|问题解决
How do you ensure data integrity, fairness, or best industry practices when deploying solutions in team environments?|在团队环境中部署方案时，你如何确保数据完整性、公平性或遵循行业最佳实践？
Experience not specified|未填写工作经验
Original PDF withheld|未授权原始 PDF
Audit Logged|访问已记录
Contact (Shared via Application)|联系方式（通过申请分享）
Classified Profile:|分类资料：
Source not specified|未注明来源
unverified|未经验证
full name|姓名
current role|当前岗位
years experience|工作年限
education level|学历
work mode preference|工作模式偏好
executive summary|职业摘要
work experience|工作经历
education history|教育经历
No summary provided.|未提供摘要。
Name|姓名
Role|岗位
Qualification|学历
Work preference|工作偏好
Skills mentioned or owner supplied|简历提及或所有者补充的技能
Experience|工作经历
No linked account|未关联账号
Accept interview|接受面试
Decline interview|拒绝面试
Pending|待回复
Accepted|已接受
Declined|已拒绝
Cancelled|已取消
W.P. Labuan|纳闽联邦直辖区
Kuala Lumpur City Centre|吉隆坡市中心
Practical Problem Solving|实际问题解决
Technical Competency|技术能力
Intermediate|中级
Advanced|高级
Describe a scenario where you optimized a workflow or resolved a critical bug/bottleneck in your past experience.|请描述你过去优化工作流程，或解决重大错误／瓶颈的一次经历。
Counts of words and phrases are prompts for review, not proof of ability or hiring suitability.|词语和短语的统计仅供审核参考，不证明能力或岗位适配性。
Wording signals are prompts for review, not proof of ability or hiring suitability.|措辞信号仅供审核参考，不证明能力或岗位适配性。
Upload a fictional PDF or try a sample to create your profile.|上传虚构 PDF 或试用示例以创建资料。
Upload a fictional PDF or choose a sample to begin.|上传虚构 PDF 或选择示例以开始。
Saved profile is ready for your sharing choices.|资料已保存，可以选择分享权限。
This draft cannot be shared until you review and save it.|审核并保存前，无法分享此草稿。
Checking your PDF…|正在检查 PDF……
Choose a PDF file.|请选择 PDF 文件。
Confirm that this custom PDF contains only fictional information before uploading.|上传前请确认此 PDF 仅包含虚构信息。
Checking sample PDF…|正在检查示例 PDF……
Could not export your profile.|无法导出资料。
Your vault could not be deleted.|无法删除简历库。
Vault deleted and sharing revoked.|已删除简历库并撤销分享。
This discovery listing has no recipient account for an in-app application.|此职位信息没有关联接收账号，无法在应用内申请。
Could not submit application.|无法提交申请。
Could not withdraw.|无法撤回。
Access denied to CV.|无权访问此简历。
Here is your latest career snapshot.|这是你最新的职业概览。
Complete the steps below to unlock your full plan.|完成以下步骤，查看完整计划。
Start by picking a sample persona or listing your skills.|请先选择示例人物或填写技能。
We would like to invite you to an interview.|我们诚邀你参加面试。
Please reply to confirm your availability.|请回复确认你是否可以参加。
Why this role?|为什么推荐此岗位？
Enter the recipient's registered CareerLens email.|请输入接收者注册 CareerLens 时使用的邮箱。
Choose the summary, original PDF, or both to share.|请选择分享摘要、原始 PDF，或两者都分享。
Choose an expiry of 1, 7, or 30 days.|请选择 1、7 或 30 天的有效期。
Upload and review your CV first.|请先上传并审核简历。
Your CV changed. Refresh and review it before sharing.|简历已更改，请刷新并审核后再分享。
Review and save your profile before sharing.|请审核并保存资料后再分享。
No matching recipient account. Ask them to register with this email first.|未找到对应的接收者账号，请让对方先使用此邮箱注册。
Your own CV is already available in your vault.|你可以直接在简历库查看自己的简历。
Account not found.|未找到账号。
Full name must be at least 2 characters.|姓名至少需要 2 个字符。
Please enter a valid email address.|请输入有效的邮箱。
This email address is already in use by another account.|该邮箱已被其他账号使用。
Please enter both your current password and a new password.|请输入当前密码和新密码。
New passwords do not match. Please verify and re-type.|两次新密码不一致，请核对并重新输入。
Current password is incorrect. Please try again.|当前密码不正确，请重试。
This file is not a public synthetic demo CV.|此文件并非公开的合成示例简历。
Your session changed. Refresh this page and try again.|会话已更改，请刷新页面后重试。
This request must come from CareerLens.|此请求必须来自 CareerLens。
Upload one PDF CV, no larger than 8 MB.|请上传一个不超过 8 MB 的 PDF 简历。
The request could not be read. Refresh and try again.|无法读取请求，请刷新后重试。
Please sign in first.|请先登录。
Logged out successfully.|已成功退出登录。
Unknown questionnaire action.|未知的问卷操作。
Invalid questionnaire request.|问卷请求无效。
For this hackathon demo, confirm this is a synthetic CV with no real personal data.|请确认此次黑客松演示使用的简历为合成简历，不含真实个人信息。
Please select a valid .pdf CV file to upload.|请选择有效的 .pdf 简历文件上传。
Analytics consent must be true or false.|统计授权必须选择同意或不同意。
No CV found to export.|没有可导出的简历。
Access revoked.|已撤销访问。
Share not found.|未找到分享记录。
This shared PDF is unavailable for your account.|你的账号无法访问此共享 PDF。
No uploaded PDF CV found.|未找到已上传的 PDF 简历。
lat and lng required|需要提供纬度和经度。
This is a discovery listing without a connected employer account. Your CV has not been sent.|此职位信息未关联雇主账号，你的简历尚未发送。
Trend data successfully updated!|趋势数据更新成功！
Vacancy not found.|未找到招聘职位。
Candidate did not grant access to their organised CV summary.|候选人未授权访问整理后的简历摘要。
Candidate did not share the original PDF CV for this application.|候选人未在此次申请中分享原始 PDF 简历。
Send a text message up to 4,000 characters and a valid location.|请发送不超过 4,000 个字符的文字消息，并提供有效位置。
Choose a city or provide valid latitude and longitude.|请选择城市或提供有效经纬度。
Answers successfully evaluated!|答案已成功评分！
Reviewed by you|已由你审核
Needs your review|等待你审核
Check the draft before sharing with employers|向雇主分享前请核对草稿
Extraction method:|提取方式：
Local PDF text extraction|本地 PDF 文字提取
Missing information is left blank; correct the draft using the original PDF.|缺失信息留空，请根据原始 PDF 修正草稿。
Summary shared|摘要已分享
Summary private|摘要未公开
PDF shared|PDF 已分享
PDF private|PDF 未公开
Summary|摘要
Original PDF|原始 PDF
Organised CV|整理后的简历
Shared via application|通过申请分享
Contact|联系方式
page|页
Name:|姓名：
No applications yet.|暂无申请。
shared a CV with you|与你分享了一份简历
Only your signed-in account can use this link. Access expires|仅你的账号登录后可以使用此链接。访问到期时间：
The owner can revoke access or replace the CV. Please respect the agreed purpose of this share.|所有者可以撤销访问或替换简历，请按约定用途使用分享的内容。
Application|职位申请
Profile|个人资料
Private sharing|私密分享
No original PDF access|无原始 PDF 访问权限
or|或
Access granted for this application and resource.|已授权访问此次申请对应的内容。
Access granted to this account. Copy the link to share it; no email was sent.|已向该账号授权。请复制链接进行分享；系统未发送邮件。
Add at least one required skill directly related to the role.|请至少添加一项与岗位直接相关的必需技能。
Application not found or access denied.|未找到申请，或无权访问。
Application saved with only your selected CV resources shared.|申请已保存，仅分享了你选定的简历内容。
Application withdrawn. Further employer access is revoked; earlier downloaded copies cannot be recalled.|申请已撤回，雇主的后续访问已撤销；之前下载的副本无法收回。
Candidate CV not found.|未找到候选人简历。
Choose at least one CV resource to share, or withdraw the application to revoke access.|请至少选择一项简历内容进行分享，或撤回申请以撤销访问。
Choose whether to include your CV in aggregate statistics.|请选择是否将简历纳入汇总统计。
No CV found.|未找到简历。
No active application found for this vacancy.|未找到此职位的有效申请。
No verified course is available for this skill.|暂无对应此技能的已核实课程。
Only PDF files (.pdf) are accepted. Export your CV as a PDF and try again.|仅接受 PDF 文件（.pdf），请将简历导出为 PDF 后重试。
PDF CVs can contain at most 20 pages. Upload a shorter version.|PDF 简历最多 20 页，请上传较短版本。
PDF extracted locally. Review and confirm the organised draft before sharing.|已在本地提取 PDF，请在分享前审核并确认整理后的草稿。
PDF file exceeds the 8 MB maximum size limit.|PDF 文件超过 8 MB 大小限制。
Please choose a valid minimum education level.|请选择有效的最低学历。
Please choose a valid work mode.|请选择有效的工作模式。
Please upload your PDF CV first.|请先上传 PDF 简历。
Position title must be 2–80 characters.|职位名称须为 2–80 个字符。
Profile updated successfully!|资料更新成功！
Review and confirm your CV details before sharing with an employer.|向雇主分享前，请审核并确认简历内容。
Salary budget and years of experience must be numbers.|薪资预算和经验年限必须为数字。
Salary expectation must be a non-negative number.|期望薪资必须为非负数。
Salary maximum must be greater than or equal to the minimum.|最高薪资必须大于或等于最低薪资。
Send a valid application.|请提交有效的申请。
Send a valid profile update.|请提交有效的资料更新。
Sharing choices must be true or false.|分享选项必须选择同意或不同意。
The CV could not be stored. Please try again; your previous record was kept.|无法保存简历，请重试；之前的记录已保留。
The PDF document contains no pages.|此 PDF 文档没有页面。
The PDF is damaged, malformed, or uses an unsupported format. Open it in a PDF reader and export a fresh text PDF.|PDF 已损坏、格式异常或不受支持。请使用 PDF 阅读器打开，并重新导出文字型 PDF。
The candidate has not shared this CV resource.|候选人未分享此简历内容。
The candidate must review this CV before it can be shared.|候选人须先审核此简历，才能分享。
The cover note or availability is invalid.|申请附言或可入职时间无效。
The review confirmation must be true or false.|审核确认必须选择同意或不同意。
The shared PDF is no longer available.|此共享 PDF 已不可用。
The statistics preference must be true or false.|统计偏好必须选择同意或不同意。
The stored file could not be removed. Please try again.|无法删除已保存的文件，请重试。
The stored file could not be safely removed. Contact the application owner.|无法安全删除已保存的文件，请联系应用所有者。
The uploaded PDF is empty or incomplete. Export it again and retry.|上传的 PDF 为空或不完整，请重新导出后重试。
This CV has changed. Reload the vault before saving or confirming your review.|简历已更改，请重新加载简历库后再保存或确认审核。
This PDF contains an unusually large page. Export a simplified text PDF and retry.|此 PDF 包含过大的页面，请导出简化的文字型 PDF 后重试。
This PDF contains too much text to process safely. Upload a shorter CV (maximum 100,000 characters).|此 PDF 的文字过多，无法安全处理。请上传较短的简历（最多 100,000 个字符）。
This PDF has too little selectable text and may be a scan. Use OCR or export a text-based PDF; automatic OCR is not available here.|此 PDF 可选取的文字过少，可能是扫描件。请先进行文字识别或导出文字型 PDF；此处不提供自动文字识别。
This PDF is password-protected or encrypted. Upload an unencrypted copy that you are authorised to use.|此 PDF 受密码保护或已加密，请上传你有权使用的未加密副本。
This discovery listing has no connected employer account. Your CV has not been sent.|此职位信息未关联雇主账号，你的简历尚未发送。
This file is not a valid PDF. Renaming a file to .pdf does not convert it.|此文件不是有效的 PDF，将扩展名改成 .pdf 并不会转换文件格式。
This vacancy is closed to new applications.|此职位已停止接受新申请。
Training approved.|培训已获批准。
Unknown CV resource.|未知的简历内容。
Upload and review your PDF CV before applying.|申请前请先上传并审核 PDF 简历。
Vacancy created.|职位已创建。
Years of experience must be a number from 0 to 80, or empty.|经验年限须为 0–80 的数字，也可以留空。
Years of relevant experience must be between 0 and 40.|相关经验年限须为 0–40 年。
Your PDF, extracted details, applications and access history were deleted. Earlier downloaded copies cannot be recalled.|已删除 PDF、提取资料、申请和访问记录；之前下载的副本无法收回。
Suggestion unavailable.|推荐暂不可用。
How Lumi Helps|Lumi 如何帮助你
CV Privacy|简历隐私
Emerging Skills|新兴技能
Top Candidates|优秀候选人
Submitted CVs|已提交的简历
Team Skill Gaps|团队技能差距
Retention Insights|人才留任洞察
Nearby Jobs|附近职位
CV Summary|简历摘要
View Reskilling Plan|查看技能提升计划
Search Jobs & Companies|搜索职位与企业
Open Reskilling Plan|打开技能提升计划
Open Candidate Screening|打开候选人筛选
Create Job Vacancy|创建招聘职位
Screen Candidates|筛选候选人
Approve Reskilling|批准技能提升培训
My PDF CV|我的 PDF 简历
Browse Matching Jobs|浏览匹配职位
Upskill for Higher Pay|提升技能以争取更高薪资
Upload CV|上传简历
View CV Profile|查看简历资料
Explore Nearby Jobs|探索附近职位
View Access Audit Log|查看访问审计日志
Manage Applications|管理申请
Upload PDF CV|上传 PDF 简历
View Role Matches|查看岗位匹配
No opted-in CVs yet|尚无同意参与统计的简历
Financial Reporting|财务报告
Professional|专业人员
Contact (Shared via Application)|联系方式（通过申请分享）
No hiring companies within|此半径内没有招聘企业：
No CV-matched hiring companies within|此半径内没有与简历匹配的招聘企业：
No vacancies found within|此半径内没有找到职位：
No CV-matched vacancies found within|此半径内没有找到与简历匹配的职位：
of|位于
No original PDF shared|未分享原始 PDF
Download sample PDF|下载示例 PDF
Consider replacing passive phrasing|建议替换被动措辞
Your Location (Drag to reposition)|你的位置（拖动以调整）
Quantified Impact & Action Verbs|量化成果与行动动词
Extended Lexicon Signals & Telemetry|扩展词库信号与文本指标
Apply & choose access →|申请并选择访问权限 →
Qualification & Arrangement|资历与工作安排
CV evidence for required skills|必需技能的简历依据
This candidate explicitly applied to|此候选人已明确申请
and consented to share their CV below.|并同意分享以下简历内容。
`.trim().split('\n').map(line => line.split('|'));
  const chineseDictionary = new Map(chineseRows);
  function translate(text, language) {
    const i = language === 'zh' ? 2 : language === 'ms' ? 1 : 0;
    if (!i) return text;
    const row = dictionary.get(text);
    if (row) return row[i];
    const intensity = text.match(/^Scenario intensity: (\d+)%$/);
    if (intensity) return i === 2 ? `情景强度：${intensity[1]}%` : `Keamatan senario: ${intensity[1]}%`;
    if (i === 2 && chineseDictionary.has(text)) return chineseDictionary.get(text);
    const trailingColon = text.match(/^(.+?)([:：])$/);
    if (trailingColon) {
      const label = translate(trailingColon[1], language);
      if (label !== trailingColon[1]) return label + (i === 2 ? '：' : ':');
    }
    const coverage = text.match(/^skill coverage: (\d+)\/(\d+)$/);
    if (coverage) return `${translate('skill coverage', language)}: ${coverage[1]}/${coverage[2]}`;
    const coveragePercent = text.match(/^(\d+)% skill coverage$/);
    if (coveragePercent) return `${coveragePercent[1]}% ${translate('skill coverage', language)}`;
    if (i === 2) {
      const patterns = [
        [/^(\d+) open roles?$/, m => `${m[1]} 个开放职位`],
        [/^Location set to (.+)$/, m => `位置已设为 ${m[1]}`],
        [/^Location updated: (.+)$/, m => `位置已更新：${m[1]}`],
        [/^Vacancy (open|closed)$/, m => `职位已${m[1] === 'open' ? '开放' : '关闭'}`],
        [/^on (.+) and consented to share their CV below\.$/, m => `于 ${m[1]} 申请，并同意分享以下简历内容。`],
        [/^Anonymised Talent Pool Skill Distribution \((\d+) Opt-In PDF CVs\)$/, m => `匿名人才库技能分布（${m[1]} 份已授权 PDF 简历）`],
        [/^Explore (.+) Companies$/, m => `探索${translate(m[1], language)}企业`],
        [/^Fly Map to (.+) \((\d+)km\)$/, m => `将地图移至 ${m[1]}（${m[2]} 公里）`],
        [/^Question (\d+) of (\d+)(?: · (.+))?$/, m => `第 ${m[1]} / ${m[2]} 题${m[3] ? ' · ' + translate(m[3], language) : ''}`],
        [/^Verification score: (\d+)\/100$/, m => `验证得分：${m[1]}/100`],
        [/^In a real-world project for a (.+), how would you handle unexpected technical roadblocks or tight deadlines\?$/, m => `在担任${translate(m[1], language)}的实际项目中，你会如何应对意外技术障碍或紧迫的截止日期？`],
        [/^(\d+) matched$/, m => `${m[1]} 个匹配项`],
        [/^(\d+) access(?:es)?$/, m => `${m[1]} 次访问`],
        [/^Keyword coverage (.+)$/, m => `关键词覆盖度 ${translate(m[1], language)}`],
        [/^Impact wording (.+)$/, m => `成果措辞 ${translate(m[1], language)}`],
        [/^(\d+) words · avg ([\d.]+) chars\/word · (\d+) numeric metrics$/, m => `${m[1]} 个词 · 平均每词 ${m[2]} 个字符 · ${m[3]} 项数字指标`],
        [/^(\d+) page\(s\)$/, m => `${m[1]} 页`],
        [/^Updated (.+)$/, m => `更新于 ${m[1]}`],
        [/^File fingerprint \(SHA-256\): (.+)$/, m => `文件指纹（SHA-256）：${m[1]}`],
        [/^Extraction method: (.+)\. Missing information is left blank; correct the draft using the original PDF\.$/, m => `提取方式：${translate(m[1], language)}。缺失信息留空，请根据原始 PDF 修正草稿。`],
        [/^Uploading and extracting (.+)$/, m => `正在上传并提取 ${m[1]}`],
        [/^Expand (?:Radius )?to (\d+) km$/i, m => `将搜索半径扩大至 ${m[1]} 公里`],
        [/^([\d.]+) km away$/, m => `距离 ${m[1]} 公里`],
        [/^([\d.]+) km$/, m => `${m[1]} 公里`],
        [/^page (\d+)$/, m => `第 ${m[1]} 页`],
        [/^(\d+) skills to build$/, m => `${m[1]} 项待提升技能`],
        [/^Market demand (\d+)\/100$/, m => `市场需求 ${m[1]}/100`],
        [/^Match for (.+)$/, m => `与${translate(m[1], language)}的匹配情况`],
        [/^Applied to (.+)$/, m => `已申请：${m[1]}`],
        [/^Owner-reviewed skill mentions \((\d+)\)$/, m => `所有者已审核的技能（${m[1]} 项）`],
        [/^gap (\d+)$/, m => `差距 ${m[1]}`],
        [/^Expires (.+)$/, m => `到期时间：${m[1]}`],
        [/^View CV shared by (.+)$/, m => `查看 ${m[1]} 分享的简历`],
        [/^(.+) accessed (summary|pdf|PDF|original_pdf)$/, m => `${m[1]} 访问了${/pdf/i.test(m[2]) ? '原始 PDF' : '摘要'}`],
        [/^Searching locations for "(.+)"\.\.\.$/, m => `正在搜索“${m[1]}”的位置……`],
        [/^No matching location found for "(.+)"\. Try entering the area or street name\.$/, m => `未找到“${m[1]}”的匹配位置，请尝试输入地区或街道名称。`],
        [/^Opened (.+)$/, m => `已打开：${translate(m[1], language)}`],
        [/^This area is for (.+) Portal accounts only\.$/, m => `此区域仅限${translate(m[1], language)}门户账号访问。`],
        [/^Replace the current PDF and organised profile\? This will withdraw (\d+) active application\(s\) and revoke their access\. You must review and apply again to share the new CV\. Any links shared with named recipients will also be revoked\. Previously downloaded copies cannot be retracted\.$/, m => `替换当前 PDF 和整理后的资料？这将撤回 ${m[1]} 份有效申请并撤销访问权限。你须重新审核并申请才能分享新简历。分享给指定接收者的链接也会被撤销，已下载的副本无法收回。`],
        [/^Replace the current PDF and organised profile\? Your current profile edits will be replaced\. Any links shared with named recipients will also be revoked\. Previously downloaded copies cannot be retracted\.$/, () => '替换当前 PDF 和整理后的资料？当前资料修改将被替换，分享给指定接收者的链接也会被撤销。已下载的副本无法收回。'],
      ];
      for (const [pattern, render] of patterns) {
        const match = text.match(pattern);
        if (match) return render(match);
      }
    }
    const cvSkillPrompt = text.match(/^Your CV lists (.+)\. Describe a project where you used it, your personal contribution, and the result\.$/);
    if (cvSkillPrompt) return i===2 ? `你的简历列出了${translate(cvSkillPrompt[1],language)}。请描述一个运用该技能的项目、你个人的贡献及成果。` : `CV anda menyenaraikan ${translate(cvSkillPrompt[1],language)}. Terangkan projek yang menggunakan kemahiran ini, sumbangan peribadi anda dan hasilnya.`;
    const shortlistCount = text.match(/^(\d+) shortlisted candidates$/);
    if (shortlistCount) return i===2 ? `${shortlistCount[1]} 位入选候选人` : `${shortlistCount[1]} calon disenarai pendek`;
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
  return {translate, rows, chineseRows};
});
