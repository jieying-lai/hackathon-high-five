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
CV-based questions are ready. Review before use.|Soalan berasaskan CV tersedia. Semak sebelum digunakan.|基于简历的问题已生成，请审核后使用。
Learning milestones|Pencapaian pembelajaran|学习里程碑
Syncing your learning milestones…|Menyegerakkan pencapaian pembelajaran…|正在同步学习里程碑……
Could not sync learning milestones. Please retry.|Tidak dapat menyegerakkan pencapaian. Sila cuba lagi.|暂时无法同步学习里程碑，请重试。
Learning badge unlocked! View your milestones in Completed Learning.|Lencana pembelajaran dibuka! Lihat di Pembelajaran Selesai.|已解锁学习徽章！到“已完成学习”查看。
Small steps, shared kindness|Langkah kecil, kebaikan bersama|小小进步，汇聚善意
Learn. Earn a badge. Make a little difference.|Belajar. Raih lencana. Bawa sedikit perubahan.|学习、获得徽章，让善意多一点。
Complete 10, 20, 30, 40 and 50 courses to collect five milestone badges.|Lengkapkan 10, 20, 30, 40 dan 50 kursus untuk mengumpul lima lencana.|完成 10、20、30、40、50 门课程，逐步收集五枚里程碑徽章。
1 badge = USD 0.10 company pledge|1 lencana = ikrar syarikat USD 0.10|1 枚徽章 = 公司承诺捐出 USD 0.10
Earned|Diperoleh|已获得
Not yet earned|Belum diperoleh|尚未获得
Next milestone|Pencapaian seterusnya|下个里程碑
more courses to go|kursus lagi|门课程后达成
You have collected all five learning badges!|Anda telah mengumpul semua lima lencana!|你已集齐五枚学习徽章！
A little piggy bank for shared kindness|Tabung kecil untuk kebaikan bersama|汇聚善意的小扑满
Your unlocked pledge|Ikrar yang anda buka|你已解锁的捐款承诺
Funded by CareerLens, not charged to you.|Dibiayai CareerLens, tiada caj kepada anda.|由 CareerLens 公司出资，不向你收费。
Our kindness piggy bank|Tabung kebaikan kita|我们的爱心扑满
For every milestone badge earned, CareerLens pledges USD 0.10 towards hunger relief.|Bagi setiap lencana, CareerLens berikrar USD 0.10 untuk bantuan kelaparan.|每获得一枚里程碑徽章，CareerLens 承诺捐出 USD 0.10 支持抗饥饿援助。
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
Completion is self-reported. Course estimates are used when available; additional courses without a listed duration are estimated at 2 hours each. These are estimates, not tracked study time.|Penyelesaian dilaporkan sendiri. Anggaran kursus digunakan apabila tersedia; kursus tambahan tanpa tempoh yang disenaraikan dianggarkan selama 2 jam setiap satu. Ini ialah anggaran, bukan masa belajar yang dijejaki.|完成状态由你自行记录；有课程时长时采用已有估算，没有时长的额外课程按每门 2 小时估算。学时仅供估算，并非实际计时。
estimated|anggaran|估算
No Poverty|Tiada Kemiskinan|消除贫困
Zero Hunger|Kelaparan Sifar|零饥饿
Good Health and Well-Being|Kesihatan Baik dan Kesejahteraan|良好健康与福祉
Quality Education|Pendidikan Berkualiti|优质教育
Gender Equality|Kesaksamaan Gender|性别平等
Clean Water and Sanitation|Air Bersih dan Sanitasi|清洁饮水和卫生设施
Affordable and Clean Energy|Tenaga Mampu Milik dan Bersih|经济适用的清洁能源
Decent Work and Economic Growth|Pekerjaan Layak dan Pertumbuhan Ekonomi|体面工作和经济增长
Industry, Innovation and Infrastructure|Industri, Inovasi dan Infrastruktur|产业、创新和基础设施
Reduced Inequalities|Mengurangkan Ketidaksamaan|减少不平等
Sustainable Cities and Communities|Bandar dan Komuniti Mampan|可持续城市和社区
Responsible Consumption and Production|Penggunaan dan Pengeluaran Bertanggungjawab|负责任消费和生产
Climate Action|Tindakan Iklim|气候行动
Life Below Water|Kehidupan di Bawah Air|水下生物
Life on Land|Kehidupan di Darat|陆地生物
Peace, Justice and Strong Institutions|Keamanan, Keadilan dan Institusi Kukuh|和平、正义与强大机构
Partnerships for the Goals|Kerjasama demi Matlamat|促进目标实现的伙伴关系
learning support|sokongan pembelajaran|学习支持
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
Diploma / TVET|Diploma / Pendidikan dan Latihan Teknikal dan Vokasional (TVET)|文凭／技术与职业教育（TVET）
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
View Full Profile Page →|Lihat Halaman Profil Penuh →|查看完整个人资料页 →
Language Setting|Tetapan Bahasa|语言设置
English|Bahasa Inggeris|英语
🔔 Notification Settings|🔔 Tetapan Pemberitahuan|🔔 通知设置
Interview Notifications|Pemberitahuan Temu Duga|面试通知
Job Match Alerts|Makluman Padanan Kerja|职位匹配提醒
Edit Profile Details|Edit Butiran Profil|编辑个人资料
Forgot Password? (Code Reset)|Lupa Kata Laluan? (Tetapan Semula Kod)|忘记密码？（验证码重置）
Help Desk & Feedback|Pusat Bantuan & Maklum Balas|帮助与反馈
Sign Out|Log Keluar|退出登录
Gender|Jantina|性别
Prefer not to say|Tidak mahu menyatakan|不愿透露
Contact Phone|Telefon untuk Dihubungi|联系电话
Not added|Belum ditambah|尚未添加
Professional Bio & Aspirations|Profil Profesional & Aspirasi|职业简介与发展目标
Add a short introduction and your career goals.|Tambahkan pengenalan ringkas dan matlamat kerjaya anda.|填写简短介绍和职业目标。
Achievements & professional skills|Pencapaian & kemahiran profesional|成就与专业技能
From your saved CV profile. These details are self-reported, not independently verified.|Daripada profil CV tersimpan anda. Maklumat ini dilaporkan sendiri dan belum disahkan secara bebas.|来自你保存的简历资料。内容由本人填写，未经独立核实。
Edit CV details →|Edit Butiran CV →|编辑简历资料 →
Learning achievements →|Pencapaian Pembelajaran →|学习成果 →
Upload a PDF, then continue to the separate review page to check and edit the extracted details.|Muat naik PDF, kemudian teruskan ke halaman semakan berasingan untuk menyemak dan mengedit maklumat yang diekstrak.|上传 PDF 后，前往独立的审核页面检查并编辑提取出的资料。
Uploads are extracted locally. Optional AI organisation uses the configured pretrained model when connected and authorised on the review page; it does not verify qualifications. Do not upload real personal or confidential information. Text-based PDFs work best; image-only scans need OCR before upload.|Fail dimuat naik diekstrak secara setempat. Jika disambungkan dan dibenarkan pada halaman semakan, model pralatih yang dikonfigurasi boleh menyusun maklumat dengan AI; proses ini tidak mengesahkan kelayakan. Jangan muat naik maklumat peribadi sebenar atau sulit. PDF berasaskan teks paling sesuai; imbasan imej sahaja memerlukan OCR.|上传文件会在本地提取内容。若审核页已连接并授权，可使用配置的预训练模型辅助整理，但不会核实资历。请勿上传真实个人资料或机密信息。文本型 PDF 效果较好；纯图片扫描件需先进行 OCR。
Review my existing CV →|Semak CV sedia ada →|审核现有简历 →
Organised CV Profile|Profil CV Tersusun|整理后的简历资料
Structured career profile extracted from your PDF. Review, polish, and save your details.|Profil kerjaya berstruktur yang diekstrak daripada PDF anda. Semak, kemas kini dan simpan maklumat anda.|从 PDF 提取的结构化职业资料。请检查、修改并保存。
View Original PDF|Lihat PDF Asal|查看原始 PDF
Replace PDF|Gantikan PDF|替换 PDF
Extracted Resume Intelligence|Maklumat Resume yang Diekstrak|简历解析结果
Upload a PDF CV to extract your structured profile|Muat naik CV PDF untuk mengekstrak profil berstruktur anda|上传 PDF 简历以提取结构化资料
AI Extracted|Diekstrak oleh AI|AI 提取
Extraction Details & Notes ▾|Butiran dan Nota Pengekstrakan ▾|提取详情与备注 ▾
Professional Summary|Ringkasan Profesional|职业摘要
Personal & Career Details|Butiran Peribadi & Kerjaya|个人与职业资料
Keep your contact information and work preferences up to date.|Pastikan maklumat hubungan dan pilihan kerja anda sentiasa terkini.|请保持联系方式和工作偏好为最新。
Please enter your full name.|Sila masukkan nama penuh anda.|请输入你的姓名。
Occupation *|Pekerjaan *|职业 *
Please enter your occupation.|Sila masukkan pekerjaan anda.|请输入你的职业。
Primary Email *|E-mel Utama *|主要邮箱 *
Contact Phone *|Telefon untuk Dihubungi *|联系电话 *
Enter a valid Malaysian phone (e.g. 11-23456789).|Masukkan nombor telefon Malaysia yang sah (cth. 11-23456789).|请输入有效的马来西亚电话号码（例如 11-23456789）。
Location / State *|Lokasi / Negeri *|地点／州属 *
Location / State|Lokasi / Negeri|地点／州属
🌐 All Sectors|🌐 Semua Sektor|🌐 所有行业
Please enter your location or state.|Sila masukkan lokasi atau negeri anda.|请输入地点或州属。
Select industry sector...|Pilih sektor industri...|选择行业领域……
Supply Chain & Logistics|Rantaian Bekalan & Logistik|供应链与物流
ESG & Sustainability|ESG & Kemampanan|ESG 与可持续发展
Others|Lain-lain|其他
Please select an industry sector.|Sila pilih sektor industri.|请选择行业领域。
Select work mode...|Pilih mod kerja...|选择工作模式……
Hybrid (Remote + Office)|Hibrid (Jarak Jauh + Pejabat)|混合办公（远程＋办公室）
Remote-First|Utamakan Kerja Jarak Jauh|远程优先
On-site Only|Di Pejabat Sahaja|仅限现场办公
Please select a preferred work mode.|Sila pilih mod kerja pilihan.|请选择偏好的工作模式。
Qualification Level *|Tahap Kelayakan *|学历 *
Select qualification level...|Pilih tahap kelayakan...|选择学历……
Bachelor's Degree (Hons)|Ijazah Sarjana Muda (Kepujian)|荣誉学士学位
Professional Cert (ACCA/CFA)|Sijil Profesional (ACCA/CFA)|专业证书（ACCA/CFA）
Please select your qualification level.|Sila pilih tahap kelayakan anda.|请选择你的学历。
Years of Experience *|Tahun Pengalaman *|工作年限 *
0 for fresh graduates / entry-level.|Isi 0 untuk graduan baharu / peringkat permulaan.|应届毕业生／入门级请填 0。
Please enter years of experience (0 or more).|Sila masukkan tahun pengalaman (0 atau lebih).|请输入工作年限（0 或以上）。
Experience & Qualifications|Pengalaman & Kelayakan|工作经历与资历
Structured history extracted from your CV. You can edit or add new entries directly.|Sejarah berstruktur yang diekstrak daripada CV anda. Anda boleh mengedit atau menambah entri baharu.|从简历提取的结构化经历。你可以直接编辑或添加条目。
Work Experience|Pengalaman Kerja|工作经历
Extracted Skills & Competencies|Kemahiran & Kompetensi Diekstrak|提取的技能与能力
Click × on any chip to remove|Klik × pada mana-mana cip untuk membuangnya|点击任一标签上的 × 即可移除
↵ Enter|↵ Enter|↵ 回车
🔍 Original Extraction Quotes & Evidence|🔍 Petikan & Bukti Pengekstrakan Asal|🔍 原始提取语句与依据
View quotes from PDF ▾|Lihat petikan daripada PDF ▾|查看 PDF 引文 ▾
Quotes and page numbers from your PDF that supported the initial draft.|Petikan dan nombor halaman daripada PDF anda yang menyokong draf awal.|支持初始草稿的 PDF 引文及页码。
I have verified the summary, contact details, and qualifications. Mark profile as reviewed.|Saya telah mengesahkan ringkasan, maklumat hubungan dan kelayakan. Tandakan profil sebagai telah disemak.|我已核实摘要、联系方式和资历。将资料标记为已审核。
💼 Browse Jobs →|💼 Layari Kerja →|💼 浏览职位 →
💾 Save Reviewed Profile →|💾 Simpan Profil yang Disemak →|💾 保存已审核资料 →
Track your applications and control who can view your CV.|Jejaki permohonan anda dan kawal pihak yang boleh melihat CV anda.|追踪申请，并管理谁可以查看你的简历。
Find jobs →|Cari Kerja →|查找职位 →
My applications & employer access|Permohonan Saya & Akses Majikan|我的申请与雇主访问记录
Load 10 More Roles|Muatkan 10 Jawatan Lagi|再加载 10 个职位
Edit Profile & Background|Edit Profil & Latar Belakang|编辑资料与背景
📷 Upload|📷 Muat Naik|📷 上传
Upload Photo|Muat Naik Foto|上传照片
Preset Avatars|Avatar Sedia Ada|预设头像
Profile Info|Maklumat Profil|个人资料
Login & Security|Log Masuk & Keselamatan|登录与安全
Please enter your full name (min 2 chars).|Sila masukkan nama penuh anda (min. 2 aksara).|请输入姓名（至少 2 个字符）。
Primary Email Address *|Alamat E-mel Utama *|主要邮箱地址 *
Contact Phone Number|Nombor Telefon untuk Dihubungi|联系电话号码
Enter a valid Malaysian phone number (e.g. 11-23456789).|Masukkan nombor telefon Malaysia yang sah (cth. 11-23456789).|请输入有效的马来西亚电话号码（例如 11-23456789）。
Female|Perempuan|女性
Male|Lelaki|男性
Non-Binary|Bukan Binari|非二元性别
Career Industry|Industri Kerjaya|职业行业
IT & Software Engineering|Kejuruteraan IT & Perisian|信息技术与软件工程
HR & Admin|Sumber Manusia & Pentadbiran|人力资源与行政
Supply Chain|Rantaian Bekalan|供应链
Others (Please specify)|Lain-lain (Sila nyatakan)|其他（请注明）
Secondary (SPM / STPM)|Menengah (SPM / STPM)|中学（SPM／STPM）
Master's Degree|Ijazah Sarjana|硕士学位
Doctorate / PhD|Doktorat / PhD|博士学位
Specify Your Career Industry *|Nyatakan Industri Kerjaya Anda *|请填写你的职业行业 *
Selangor (PJ, Cyberjaya)|Selangor (PJ, Cyberjaya)|雪兰莪（八打灵再也、赛城）
Penang (George Town)|Pulau Pinang (George Town)|槟城（乔治市）
Johor (Johor Bahru)|Johor (Johor Bahru)|柔佛（新山）
Perak (Ipoh)|Perak (Ipoh)|霹雳（怡保）
Sarawak (Kuching)|Sarawak (Kuching)|砂拉越（古晋）
Sabah (Kota Kinabalu)|Sabah (Kota Kinabalu)|沙巴（亚庇）
Remote (Anywhere in Malaysia)|Jarak Jauh (Di Mana-mana di Malaysia)|远程（马来西亚境内）
Work Mode|Mod Kerja|工作模式
Remote-First (Work from Home)|Utamakan Jarak Jauh (Bekerja dari Rumah)|远程优先（居家办公）
On-site Only (Office)|Di Pejabat Sahaja|仅限办公室办公
Professional Pitch / Bio|Pengenalan Profesional / Bio|职业介绍／简介
(Optional)|(Pilihan)|（选填）
Save Changes|Simpan Perubahan|保存更改
Must contain at least 8 characters with letters, numbers, and symbols.|Mesti mengandungi sekurang-kurangnya 8 aksara, termasuk huruf, nombor dan simbol.|至少包含 8 个字符，并含字母、数字和符号。
Forgot your password?|Lupa kata laluan anda?|忘记密码？
Generate a random 6-digit verification code to reset it immediately.|Jana kod pengesahan rawak 6 digit untuk menetapkan semula kata laluan dengan segera.|生成随机 6 位验证码以立即重置密码。
Reset via Code →|Tetapkan Semula melalui Kod →|通过验证码重置 →
Update Password|Kemas Kini Kata Laluan|更新密码
Default public token|Token awam lalai|默认公开令牌
pk.eyJ1...|pk.eyJ1...|pk.eyJ1...
Mapbox Public Token (pk.***)|Token Awam Mapbox (pk.***)|Mapbox 公开令牌（pk.***）
CareerLens Help Desk|Pusat Bantuan CareerLens|CareerLens 帮助中心
Submit feedback, report an issue, or contact platform admin|Hantar maklum balas, laporkan isu atau hubungi pentadbir platform|提交反馈、报告问题或联系平台管理员
Inquiry Category *|Kategori Pertanyaan *|问题类别 *
General Feedback & Suggestions|Maklum Balas & Cadangan Umum|一般反馈与建议
Job Matching & Map Issue|Isu Padanan Kerja & Peta|职位匹配与地图问题
Course Enrollment & Reskilling|Pendaftaran Kursus & Latihan Semula|课程报名与技能提升
Technical Bug Report|Laporan Pepijat Teknikal|技术错误报告
Account & Security Support|Bantuan Akaun & Keselamatan|账号与安全支持
Detailed Message *|Mesej Terperinci *|详细内容 *
Priority|Keutamaan|优先级
Normal|Biasa|普通
High Priority|Keutamaan Tinggi|高优先级
Urgent|Segera|紧急
Company Support Email|E-mel Sokongan Syarikat|企业支持邮箱
Submit Feedback →|Hantar Maklum Balas →|提交反馈 →
Account Email Address (Must match registered email)|Alamat E-mel Akaun (Mesti sama dengan e-mel berdaftar)|账号邮箱（必须与注册邮箱一致）
Confirm New Password|Sahkan Kata Laluan Baharu|确认新密码
`.trim().split('\n').map(line => line.split('|'));
  rows.push(
    ['Security & Password', 'Keselamatan & Kata Laluan', '安全与密码'],
    ['Talent Account', 'Akaun Bakat', '求职者账号'],
    ['Account registered', 'Akaun didaftarkan', '账号已注册'],
    ['Email:', 'E-mel:', '邮箱：'], ['Joined:', 'Tarikh Daftar:', '注册时间：'],
    ['Edit Profile & Information', 'Edit Profil & Maklumat', '编辑资料与信息'],
    ['Current Role', 'Jawatan Semasa', '当前职位'], ['Career Field', 'Bidang Kerjaya', '职业领域'],
    ['Preferred Mode', 'Mod Pilihan', '偏好模式'],
    ['Hackathon demo — use fictional CVs only.', 'Demo hackathon — gunakan CV fiksyen sahaja.', '黑客松演示，请仅使用虚构简历。'],
    ['Text-based PDF · maximum 8 MB', 'PDF berasaskan teks · maksimum 8 MB', '文本型 PDF · 最大 8 MB'],
    ['I confirm my custom PDF contains only fictional, synthetic information.', 'Saya mengesahkan PDF tersuai saya hanya mengandungi maklumat fiksyen dan sintetik.', '我确认自定义 PDF 仅含虚构的合成信息。'],
    ['Extract, check the evidence, then review your profile before sharing', 'Ekstrak, semak bukti, kemudian semak profil anda sebelum berkongsi', '提取内容、核对依据，再审核资料后分享'],
    ['1. Check PDF', '1. Semak PDF', '1. 检查 PDF'], ['2. Extract text', '2. Ekstrak teks', '2. 提取文本'], ['3. Review draft', '3. Semak draf', '3. 审核草稿'],
    ['Try without a custom upload', 'Cuba tanpa muat naik tersuai', '不上传自定义文件先试用'], ['No PDF yet', 'Belum ada PDF', '尚未上传 PDF'],
    ['Check the draft before sharing with employers', 'Semak draf sebelum berkongsi dengan majikan', '分享给雇主前请先检查草稿'],
    ['Upload a sample or fictional PDF to begin.', 'Muat naik PDF contoh atau fiksyen untuk bermula.', '上传示例或虚构 PDF 以开始。'],
    ['Full Name *', 'Nama Penuh *', '姓名 *'], ['Please enter a valid email address.', 'Sila masukkan alamat e-mel yang sah.', '请输入有效的邮箱地址。'],
    ['Industry Sector *', 'Sektor Industri *', '行业领域 *'], ['Engineering & Manufacturing', 'Kejuruteraan & Pembuatan', '工程与制造'],
    ['Healthcare & Life Sciences', 'Penjagaan Kesihatan & Sains Hayat', '医疗保健与生命科学'],
    ['Education & EdTech', 'Pendidikan & Teknologi Pendidikan', '教育与教育科技'],
    ['Preferred Work Mode *', 'Mod Kerja Pilihan *', '偏好的工作模式 *'], ['Projects', 'Projek', '项目'], ['Certifications', 'Pensijilan', '证书'],
    ['Your CV, your sharing choices', 'CV Anda, Pilihan Perkongsian Anda', '你的简历，由你决定如何分享'], ['Private by default', 'Peribadi secara lalai', '默认保持私密'],
    ['Your PDF and organised profile are available to your signed-in account. An employer receives only the summary and/or PDF you choose to share when applying to its vacancy. Aggregate publication is currently disabled; your optional statistics preference is off by default. You can export your profile, withdraw sharing, or delete your vault below.', 'PDF dan profil tersusun anda hanya tersedia kepada akaun yang telah log masuk. Majikan hanya menerima ringkasan dan/atau PDF yang anda pilih semasa memohon jawatannya. Penerbitan agregat kini dinyahaktifkan; pilihan statistik adalah dimatikan secara lalai. Anda boleh mengeksport profil, menarik balik perkongsian atau memadam peti simpanan di bawah.', '只有已登录的账号可以查看你的 PDF 和整理后的资料。申请职位时，雇主只能收到你选择分享的摘要和／或 PDF。目前已关闭汇总发布；统计分享选项默认关闭。你可以在下方导出资料、撤销分享或删除资料库。'],
    ['Optional statistics preference (publication disabled)', 'Pilihan statistik (penerbitan dinyahaktifkan)', '可选统计分享设置（目前未发布）'],
    ['Choose who can view your CV and review their access below.', 'Pilih pihak yang boleh melihat CV anda dan semak akses mereka di bawah.', '选择谁可以查看你的简历，并在下方检查其访问权限。'],
    ["Each application grants access only to that vacancy's company account. Withdrawal blocks future access here; it cannot retract copies already downloaded.", 'Setiap permohonan memberikan akses hanya kepada akaun syarikat bagi jawatan tersebut. Penarikan balik menyekat akses seterusnya di sini; salinan yang telah dimuat turun tidak dapat ditarik balik.', '每次申请仅向该职位所属企业账号授予访问权限。撤回后会阻止后续访问，但无法收回已下载的副本。'],
    ['Export profile JSON', 'Eksport Profil JSON', '导出 JSON 资料'], ['Delete my vault', 'Padam Peti Simpanan Saya', '删除我的资料库'],
    ['Share with someone you choose', 'Kongsi dengan Pihak Pilihan Anda', '分享给指定对象'],
    ['The recipient needs a CareerLens account. Only that signed-in account can open the link. No email is sent.', 'Penerima memerlukan akaun CareerLens. Hanya akaun tersebut yang telah log masuk boleh membuka pautan. Tiada e-mel dihantar.', '接收者需要拥有 CareerLens 账号，且只有该账号登录后才能打开链接。系统不会发送邮件。'],
    ['Recipient account email', 'E-mel Akaun Penerima', '接收者账号邮箱'],
    ['Share reviewed summary, including contact details', 'Kongsi ringkasan yang disemak, termasuk maklumat hubungan', '分享已审核的摘要，包括联系方式'],
    ['Share complete original PDF', 'Kongsi PDF asal yang lengkap', '分享完整的原始 PDF'], ['Access expires after', 'Akses tamat selepas', '访问权限于以下时间后到期'],
    ['1 day', '1 hari', '1 天'], ['7 days', '7 hari', '7 天'], ['30 days', '30 hari', '30 天'], ['Create recipient access', 'Berikan Akses kepada Penerima', '创建接收者访问权限'],
    ['Editing or replacing the CV ends existing grants. Revoking access cannot retract copies already saved by a recipient.', 'Mengedit atau menggantikan CV menamatkan kebenaran sedia ada. Pembatalan akses tidak dapat menarik balik salinan yang telah disimpan oleh penerima.', '编辑或替换简历会终止现有授权。撤销访问权限无法收回接收者已保存的副本。'],
    ['Recent recipient access', 'Akses Penerima Terkini', '接收者最近的访问记录'], ['Recorded employer accesses through this app', 'Akses majikan yang direkodkan melalui aplikasi ini', '此应用记录的雇主访问记录'],
    ['Selected Location', 'Lokasi Dipilih', '已选地点'], ['📍 W.P. Kuala Lumpur', '📍 Wilayah Persekutuan Kuala Lumpur', '📍 吉隆坡联邦直辖区'],
    ['Kuala Lumpur City Centre', 'Pusat Bandar Kuala Lumpur', '吉隆坡市中心'], ['📍 Use Current Location', '📍 Gunakan Lokasi Semasa', '📍 使用当前位置'],
    ['Search Building, Condo, Street, or Area', 'Cari Bangunan, Kondominium, Jalan atau Kawasan', '搜索建筑、公寓、街道或地区'], ['Search', 'Cari', '搜索'], ['Search Radius:', 'Jejari Carian:', '搜索半径：'],
    ['🗺️ Nearby Hiring Companies', '🗺️ Syarikat yang Mengambil Pekerja Berdekatan', '🗺️ 附近招聘企业'], ['0 matched', '0 sepadan', '匹配 0 项'],
    ['🎯 CV-Matched', '🎯 Sepadan dengan CV', '🎯 与简历匹配'], ['CV-Matched', 'Sepadan dengan CV', '与简历匹配'], ['Other Sectors', 'Sektor Lain', '其他行业'],
    ['Loading...', 'Sedang memuatkan...', '加载中……'], ['✕ Clear Company Filter', '✕ Kosongkan Penapis Syarikat', '✕ 清除企业筛选'],
    ['🎯 Matched Roles', '🎯 Jawatan Sepadan', '🎯 匹配职位'], ['🌐 All Nearby Roles', '🌐 Semua Jawatan Berdekatan', '🌐 附近所有职位'],
    ['All Job Sectors', 'Semua Sektor Pekerjaan', '所有职位行业'], ['Sort: Best Match', 'Susun: Padanan Terbaik', '排序：最匹配'],
    ['Sort: Nearest Distance', 'Susun: Jarak Terdekat', '排序：距离最近'], ['Sort: Highest Salary', 'Susun: Gaji Tertinggi', '排序：薪资最高'],
    ['Application Questionnaire & Skill Verification', 'Soal Selidik Permohonan & Pengesahan Kemahiran', '申请问卷与技能核验'],
    ['Allow Google Gemini to process my reviewed CV summary, work/project details and questionnaire answers for role suggestions and questions. Optional; local processing sends nothing to Google.', 'Benarkan Google Gemini memproses ringkasan CV, butiran kerja/projek dan jawapan soal selidik saya yang telah disemak untuk cadangan jawatan dan soalan. Pilihan; pemprosesan setempat tidak menghantar data kepada Google.', '允许 Google Gemini 处理我已审核的简历摘要、工作／项目详情及问卷答案，以提供职位建议和问题。此项为可选；本地处理不会向 Google 发送数据。'],
    ['✨ AI Verification', '✨ Pengesahan AI', '✨ AI 核验'], ['3 Skill Questions', '3 Soalan Kemahiran', '3 个技能问题'], ['3 AI Verification Questions', '3 Soalan Pengesahan AI', '3 个 AI 核验问题'],
    ['Targeted scenarios generated based on your uploaded CV and target role.', 'Senario khusus dijana berdasarkan CV yang dimuat naik dan jawatan sasaran anda.', '根据你上传的简历和目标职位生成针对性情景。'],
    ['✨ Generate My 3 Questions', '✨ Jana 3 Soalan Saya', '✨ 生成我的 3 个问题'],
    ['Click "Generate My 3 Questions" above to load customized skill verification scenarios.', 'Klik "Jana 3 Soalan Saya" di atas untuk memuatkan senario pengesahan kemahiran tersuai.', '点击上方“生成我的 3 个问题”以加载定制的技能核验情景。'],
    ['Submit Answers & Get Score →', 'Hantar Jawapan & Dapatkan Skor →', '提交答案并查看评分 →'], ['🔄 Refresh Trends', '🔄 Muat Semula Trend', '🔄 刷新趋势'],
    ['📚 Data Sources & Citations', '📚 Sumber Data & Rujukan', '📚 数据来源与引用'],
    ['JobStreet Malaysia Open Labour Index (2026):', 'Indeks Pasaran Buruh Terbuka JobStreet Malaysia (2026):', 'JobStreet 马来西亚开放劳动力指数（2026）：'],
    ['Aggregated real-time job vacancy signals across 69,000+ postings[cite: 52].', 'Isyarat kekosongan kerja masa nyata yang diagregatkan daripada lebih 69,000 iklan[cite: 52].', '汇总了 69,000 多条招聘信息的实时职位空缺信号[cite: 52]。'],
    ['World Economic Forum (WEF) Future of Jobs Report:', 'Laporan Masa Depan Pekerjaan Forum Ekonomi Dunia (WEF):', '世界经济论坛（WEF）《未来就业报告》：'],
    ['Benchmark technology adoption curves and AI disruption velocity models.', 'Lengkung penanda aras penggunaan teknologi dan model kadar perubahan akibat AI.', '技术采用曲线及 AI 影响速度模型的基准参考。'],
    ['UNESCO & SDG 4 / 8 Frameworks:', 'Rangka Kerja UNESCO & SDG 4 / 8:', 'UNESCO 与 SDG 4／8 框架：'],
    ['Aligned with Quality Education and Decent Work & Economic Growth guidelines.', 'Selaras dengan panduan Pendidikan Berkualiti serta Pekerjaan Layak dan Pertumbuhan Ekonomi.', '符合优质教育、体面工作与经济增长的相关指引。'],
    ['Share organised CV summary', 'Kongsi Ringkasan CV Tersusun', '分享整理后的简历摘要'],
    ['(including saved contact details, skills, education, experience, projects and certifications)', '(termasuk maklumat hubungan, kemahiran, pendidikan, pengalaman, projek dan pensijilan yang disimpan)', '（包括已保存的联系方式、技能、教育、经历、项目和证书）'],
    ['Share original PDF CV', 'Kongsi CV PDF Asal', '分享原始 PDF 简历'],
    ['(all content in the uploaded file; recipients may save a copy)', '(semua kandungan dalam fail yang dimuat naik; penerima boleh menyimpan salinan)', '（上传文件中的全部内容；接收者可以保存副本）'],
    ['Permission applies only to the company account that owns this vacancy. Withdrawal stops future access here but cannot retract downloaded copies. Editing the profile or replacing the PDF revokes previous sharing. Review and share again to give access to your updates.', 'Kebenaran hanya terpakai kepada akaun syarikat yang memiliki jawatan ini. Penarikan balik menghentikan akses seterusnya di sini, tetapi salinan yang dimuat turun tidak dapat ditarik balik. Mengedit profil atau menggantikan PDF membatalkan perkongsian terdahulu. Semak dan kongsi semula untuk memberikan akses kepada maklumat terkini.', '权限仅适用于发布此职位的企业账号。撤回后会阻止后续访问，但无法收回已下载的副本。编辑资料或替换 PDF 会撤销之前的分享。请重新审核并分享，接收者才能查看更新。'],
    ['Confirm & submit application →', 'Sahkan & Hantar Permohonan →', '确认并提交申请 →'], ['Job Seeker', 'Pencari Kerja', '求职者'], ['✕ Clear', '✕ Kosongkan', '✕ 清除'],
    ['Highest Education', 'Pendidikan Tertinggi', '最高学历'], ['W.P. Kuala Lumpur', 'Wilayah Persekutuan Kuala Lumpur', '吉隆坡联邦直辖区'],
    ['Melaka', 'Melaka', '马六甲'], ['Negeri Sembilan', 'Negeri Sembilan', '森美兰'], ['Pahang', 'Pahang', '彭亨'], ['Kedah', 'Kedah', '吉打'],
    ['Terengganu', 'Terengganu', '登嘉楼'], ['Kelantan', 'Kelantan', '吉兰丹'], ['Perlis', 'Perlis', '玻璃市'], ['W.P. Putrajaya', 'Wilayah Persekutuan Putrajaya', '布城联邦直辖区'],
    ['Current Password *', 'Kata Laluan Semasa *', '当前密码 *'], ['New Password *', 'Kata Laluan Baharu *', '新密码 *'], ['Subject / Summary *', 'Subjek / Ringkasan *', '主题／摘要 *'],
    ['Mapbox HD Map Settings (Optional)', 'Tetapan Peta HD Mapbox (Pilihan)', 'Mapbox 高清地图设置（可选）'],
    ['Use Mapbox’s official vector map for precise roads and smooth zooming.', 'Gunakan peta vektor rasmi Mapbox untuk paparan jalan yang tepat dan zum yang lancar.', '使用 Mapbox 官方矢量地图，查看更精准的道路并流畅缩放。'],
    ['100% free, no credit card required!', 'Percuma sepenuhnya, kad kredit tidak diperlukan!', '完全免费，无需信用卡！'],
    ['Mapbox gives each registered user 50,000 free map loads per month. That is plenty for personal use and development testing. No payment card is required during sign-up, and there are no charges.', 'Setiap pengguna berdaftar Mapbox mendapat 50,000 pemuatan peta percuma sebulan. Jumlah ini mencukupi untuk kegunaan peribadi dan ujian pembangunan. Kad pembayaran tidak diperlukan semasa pendaftaran dan tiada caj dikenakan.', 'Mapbox 为每位注册用户每月提供 50,000 次免费地图加载，足以用于个人使用和开发测试。注册时无需绑定银行卡，也不会产生费用。'],
    ['Mapbox gives each registered user', 'Setiap pengguna berdaftar Mapbox mendapat', 'Mapbox 为每位注册用户提供'],
    ['50,000 free map loads per month', '50,000 pemuatan peta percuma sebulan', '每月 50,000 次免费地图加载'],
    ['. That is plenty for personal use and development testing. No payment card is required during sign-up, and there are no charges.', '. Jumlah ini mencukupi untuk kegunaan peribadi dan ujian pembangunan. Kad pembayaran tidak diperlukan semasa pendaftaran dan tiada caj dikenakan.', '。这足以满足个人使用和开发测试。注册时无需绑定银行卡，也不会产生费用。'],
    ['📖 Get a free key in 3 steps (about 1 minute):', '📖 Dapatkan kunci percuma dalam 3 langkah (kira-kira 1 minit):', '📖 三步获取免费密钥（约 1 分钟）：'],
    ['Open the', 'Buka', '打开'], ['free Mapbox sign-up page ↗', 'halaman pendaftaran percuma Mapbox ↗', 'Mapbox 免费注册页面 ↗'],
    ['(email and password only).', '(hanya memerlukan e-mel dan kata laluan).', '（只需填写邮箱和密码）。'],
    ['After signing in, open your dashboard and copy the', 'Selepas log masuk, buka papan pemuka dan salin', '登录后打开控制台并复制'],
    ['(it looks like', '(formatnya seperti', '（格式类似'], [').', ').', '）。'],
    ['Paste the token below, then select “Save and Enable”.', 'Tampal token di bawah, kemudian pilih “Simpan dan Aktifkan”.', '将令牌粘贴到下方，然后点击“保存并启用”。'],
    ['✕ Clear Key (Restore OpenMap)', '✕ Kosongkan Kunci (Pulihkan OpenMap)', '✕ 清除密钥（恢复 OpenMap）'],
    ['Cancel', 'Batal', '取消'], ['💾 Save and Enable Mapbox', '💾 Simpan dan Aktifkan Mapbox', '💾 保存并启用 Mapbox'],
    ['Generate My 3 Questions', 'Jana 3 Soalan Saya', '生成我的 3 个问题'],
    ['OpenMap is active by default without a token. Paste a Mapbox token to use the HD map.', 'OpenMap digunakan secara lalai tanpa token. Tampal token Mapbox untuk menggunakan peta HD.', '默认使用无需令牌的 OpenMap。如需使用高清地图，请粘贴 Mapbox 令牌。'],
    ['Enter a valid Mapbox token, or select “Clear Key” to use OpenMap without setup.', 'Masukkan token Mapbox yang sah atau pilih “Kosongkan Kunci” untuk menggunakan OpenMap tanpa persediaan.', '请输入有效的 Mapbox 令牌，或点击“清除密钥”以免配置方式使用 OpenMap。'],
    ['🎉 Mapbox HD maps enabled successfully!', '🎉 Peta HD Mapbox berjaya diaktifkan!', '🎉 Mapbox 高清地图已成功启用！'],
    ['Switched back to the setup-free OpenMap.', 'Kembali menggunakan OpenMap tanpa persediaan.', '已切换回无需配置的 OpenMap。'],
    ['Mapbox token failed to load. Switched back to the stable OpenMap automatically.', 'Token Mapbox gagal dimuatkan. Sistem bertukar semula kepada OpenMap yang stabil secara automatik.', 'Mapbox 令牌加载失败，已自动切换回稳定的 OpenMap。'],
    ['Verified Employer', 'Majikan Disahkan', '已核实雇主'], ['Company Workspace', 'Ruang Kerja Syarikat', '企业工作区'],
    ['Login:', 'Log Masuk:', '登录：'], ['Contact:', 'Hubungi:', '联系方式：'], ['Edit Company Profile', 'Edit Profil Syarikat', '编辑企业资料'],
    ['↻ Refresh', '↻ Muat Semula', '↻ 刷新'], ['Employer Account Profile', 'Profil Akaun Majikan', '雇主账号资料'],
    ['HR & Employer Portal', 'Portal HR & Majikan', 'HR 与雇主门户'], ['Account UID:', 'UID Akaun:', '账号 UID：'], ['· Joined', '· Menyertai', '· 加入时间'],
    ['🏢 Company & HR Profile', '🏢 Profil Syarikat & HR', '🏢 企业与 HR 资料'], ['HR Contact Name *', 'Nama Pegawai HR *', 'HR 联系人姓名 *'],
    ['Work Email Address *', 'Alamat E-mel Kerja *', '工作邮箱 *'], ['Company Name *', 'Nama Syarikat *', '企业名称 *'],
    ['HR / Executive Title *', 'Jawatan HR / Eksekutif *', 'HR／管理职位 *'], ['Company Size', 'Saiz Syarikat', '企业规模'],
    ['1–50 Employees (Small / Startup)', '1–50 Pekerja (Kecil / Syarikat Pemula)', '1–50 名员工（小型／初创企业）'],
    ['51–250 Employees (Medium Enterprise)', '51–250 Pekerja (Perusahaan Sederhana)', '51–250 名员工（中型企业）'],
    ['250+ Employees (Large Enterprise)', '250+ Pekerja (Perusahaan Besar)', '250 名以上员工（大型企业）'],
    ['Industry Sector', 'Sektor Industri', '行业领域'], ['General Enterprise', 'Perusahaan Umum', '综合企业'],
    ['Company Headquarters / Office Location', 'Ibu Pejabat / Lokasi Pejabat Syarikat', '企业总部／办公地点'],
    ['Save Company Changes →', 'Simpan Perubahan Syarikat →', '保存企业信息 →'], ['Update Password →', 'Kemas Kini Kata Laluan →', '更新密码 →'],
    ['CareerLens · Private sharing', 'CareerLens · Perkongsian Peribadi', 'CareerLens · 私密分享'],
    ['Access unavailable', 'Akses tidak tersedia', '无法访问'], ['Sign in / return to CareerLens', 'Log masuk / kembali ke CareerLens', '登录／返回 CareerLens'],
    ['shared a CV with you', 'berkongsi CV dengan anda', '与你分享了一份简历'],
    ['Only your signed-in account can use this link. Access expires', 'Hanya akaun anda yang telah log masuk boleh menggunakan pautan ini. Akses tamat', '只有已登录的账号可以使用此链接。访问权限到期时间'],
    ['The owner can revoke access or replace the CV. Please respect the agreed purpose of this share.', 'Pemilik boleh membatalkan akses atau menggantikan CV. Sila hormati tujuan perkongsian yang dipersetujui.', '所有者可以撤销访问权限或替换简历。请遵守双方约定的分享用途。'],
    ['Download shared original PDF', 'Muat Turun PDF Asal yang Dikongsi', '下载分享的原始 PDF'], ['Reviewed career summary', 'Ringkasan Kerjaya yang Disemak', '已审核的职业摘要'],
    ['No summary provided.', 'Tiada ringkasan diberikan.', '未提供摘要。'], ['Not specified', 'Tidak dinyatakan', '未填写'],
    ['Reviewed by the CV owner. CareerLens has not independently verified these qualifications or skills.', 'Disemak oleh pemilik CV. CareerLens tidak mengesahkan kelayakan atau kemahiran ini secara bebas.', '由简历所有者审核。CareerLens 未独立核实这些资历或技能。'],
    ['The owner shared only the original PDF. Their structured profile is private.', 'Pemilik hanya berkongsi PDF asal. Profil berstruktur mereka kekal peribadi.', '所有者只分享了原始 PDF，其结构化资料仍为私密。'],
    ['Return to workspace', 'Kembali ke ruang kerja', '返回工作区'],
    ['Account Settings & Profile', 'Tetapan Akaun & Profil', '账号设置与个人资料'],
    ['Write or review your executive summary. Highlight your core expertise and career background.', 'Tulis atau semak ringkasan profesional anda. Nyatakan kepakaran utama dan latar belakang kerjaya.', '填写或检查职业摘要，突出你的核心专长和职业背景。'],
    ['e.g. Aisha Rahman', 'cth. Aisha Rahman', '例如：Aisha Rahman'], ['e.g. Junior Financial Auditor', 'cth. Juruaudit Kewangan Junior', '例如：初级财务审计师'],
    ['e.g. W.P. Kuala Lumpur', 'cth. Wilayah Persekutuan Kuala Lumpur', '例如：吉隆坡联邦直辖区'],
    ['e.g. Senior Auditor at ABC Corp (2022 - Present)', 'cth. Juruaudit Kanan di ABC Corp (2022 - Kini)', '例如：ABC 公司高级审计师（2022 年至今）'],
    ['e.g. Bachelor of Accounting, Universiti Malaya', 'cth. Ijazah Sarjana Muda Perakaunan, Universiti Malaya', '例如：马来亚大学会计学学士'],
    ['e.g. Automated ESG Compliance Audit Pipeline', 'cth. Aliran Kerja Audit Pematuhan ESG Automatik', '例如：自动化 ESG 合规审计流程'],
    ['e.g. ACCA Member, AWS Certified Cloud Practitioner', 'cth. Ahli ACCA, AWS Certified Cloud Practitioner', '例如：ACCA 会员、AWS 云从业者认证'],
    ['Type a skill and press Enter (e.g. Financial Modeling, Python, IFRS)...', 'Taip kemahiran dan tekan Enter (cth. Pemodelan Kewangan, Python, IFRS)...', '输入技能并按回车（例如财务建模、Python、IFRS）……'],
    ['Your learning overview', 'Ringkasan pembelajaran anda', '你的学习概览'], ['Pomodoro study timer', 'Pemasa belajar Pomodoro', '番茄钟学习计时器'],
    ['Learning steps, scroll horizontally', 'Langkah pembelajaran, tatal secara mendatar', '学习步骤，可横向滚动'],
    ['Click to upload custom photo', 'Klik untuk memuat naik foto tersuai', '点击上传自定义照片'], ['Upload your profile picture', 'Muat naik gambar profil anda', '上传个人头像'],
    ['Woman', 'Wanita', '女性'], ['Man', 'Lelaki', '男性'], ['Tech', 'Teknologi', '科技'], ['Graduate', 'Graduan', '毕业生'],
    ['Remove custom photo', 'Buang foto tersuai', '移除自定义照片'],
    ['e.g. Artificial Intelligence Ethics & Robotics', 'cth. Etika Kecerdasan Buatan & Robotik', '例如：人工智能伦理与机器人技术'],
    ['Summarize your key strengths, certifications, or career aspirations...', 'Ringkaskan kekuatan utama, pensijilan atau aspirasi kerjaya anda...', '概述你的核心优势、证书或职业目标……'],
    ['Min. 8 characters', 'Min. 8 aksara', '至少 8 个字符'],
    ['e.g. Melaka radius map dot inquiry', 'cth. pertanyaan peta radius Melaka', '例如：询问马六甲附近地图搜索'],
    ['Please describe your question or feedback in detail...', 'Sila terangkan soalan atau maklum balas anda dengan terperinci...', '请详细描述你的问题或反馈……'],
    ['Edit Profile', 'Edit Profil', '编辑资料'], ['Edit your account information', 'Edit maklumat akaun anda', '编辑账号信息'],
    ['Update password', 'Kemas kini kata laluan', '更新密码'], ['Choose a fictional PDF CV', 'Pilih CV PDF fiksyen', '选择虚构的 PDF 简历'],
    ['Upload progress', 'Kemajuan muat naik', '上传进度'], ['Select State or Wilayah Persekutuan', 'Pilih Negeri atau Wilayah Persekutuan', '选择州属或联邦直辖区'],
    ['Enter condo, building, street, or area (e.g. Banyan Mont Kiara, PV128 Setapak, Mount Austin)...', 'Masukkan kondominium, bangunan, jalan atau kawasan (cth. Banyan Mont Kiara, PV128 Setapak, Mount Austin)...', '输入公寓、建筑、街道或地区（例如 Banyan Mont Kiara、PV128 Setapak、Mount Austin）……'],
    ['Clear', 'Kosongkan', '清除'], ['🔍 Search by job title, skill, or company...', '🔍 Cari mengikut jawatan, kemahiran atau syarikat...', '🔍 按职位、技能或企业搜索……'],
    ['Filter by job sector', 'Tapis mengikut sektor pekerjaan', '按职位行业筛选'], ['Sort job vacancies', 'Susun kekosongan kerja', '排序招聘职位'],
    ['Close application', 'Tutup permohonan', '关闭申请'], ['Enter current password', 'Masukkan kata laluan semasa', '输入当前密码'],
    ['View & Edit Account Profile', 'Lihat & Edit Profil Akaun', '查看和编辑账号资料'], ['Company Profile', 'Profil Syarikat', '企业资料'],
    ['Edit Company Account & Profile', 'Edit Akaun & Profil Syarikat', '编辑企业账号与资料'], ['Your full name', 'Nama penuh anda', '你的姓名'],
    ['e.g. Nexus Digital Sdn Bhd', 'cth. Nexus Digital Sdn Bhd', '例如：Nexus Digital Sdn Bhd'],
    ['e.g. Head of Talent & Reskilling', 'cth. Ketua Bakat & Latihan Semula', '例如：人才与技能提升主管'],
    ['e.g. Kuala Lumpur, Malaysia', 'cth. Kuala Lumpur, Malaysia', '例如：马来西亚吉隆坡'],
    ['Min. 8 chars with uppercase, lowercase, number & symbol', 'Min. 8 aksara dengan huruf besar, huruf kecil, nombor & simbol', '至少 8 个字符，包含大写字母、小写字母、数字和符号']
  );
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
    ['Arts & creativity', 'Seni & kreativiti', '艺术与创意'],
    ['Technology', 'Teknologi', '科技'],
    ['Business', 'Perniagaan', '商业'],
    ['Health & wellbeing', 'Kesihatan & kesejahteraan', '健康与身心福祉'],
    ['Languages & communication', 'Bahasa & komunikasi', '语言与沟通'],
    ['Science & space', 'Sains & angkasa', '科学与太空'],
    ['Food & cooking', 'Makanan & masakan', '美食与烹饪'],
    ['Sports & fitness', 'Sukan & kecergasan', '运动与健身'],
    ['Travel & culture', 'Kembara & budaya', '旅行与文化'],
    ['History & philosophy', 'Sejarah & falsafah', '历史与哲学'],
    ['Animals & wildlife', 'Haiwan & hidupan liar', '动物与野生生物'],
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
    ["View CV interview notes ↻", "Lihat nota temu duga CV ↻", "查看基于简历的面试提示 ↻"],
    ["CV-based interview notes", "Nota temu duga berdasarkan CV", "基于简历的面试注意事项"],
    ["Based on this candidate’s available CV and the selected vacancy. Confirm details during the interview.", "Berdasarkan CV calon yang tersedia dan jawatan dipilih. Sahkan butiran semasa temu duga.", "根据这位候选人目前可用的简历及所选岗位整理，请在面试中确认具体情况。"],
    ["Explore the matched skills", "Terokai kemahiran yang sepadan", "深入了解匹配技能"],
    ["CV skills matching this role", "Kemahiran CV yang sepadan dengan jawatan", "简历中与岗位匹配的技能"],
    ["Ask for a concrete example using these skills. Clarify the candidate’s own contribution, tools used and how the outcome was checked.", "Minta contoh khusus menggunakan kemahiran ini. Jelaskan sumbangan calon sendiri, alat yang digunakan dan cara hasil disemak.", "请候选人举例说明如何使用这些技能，重点确认个人贡献、使用的工具以及验证成果的方法。"],
    ["No matched skills are recorded in the available CV summary. Ask the candidate to describe experience relevant to this role.", "Tiada kemahiran sepadan direkodkan dalam ringkasan CV tersedia. Minta calon menerangkan pengalaman berkaitan jawatan.", "目前简历摘要没有记录匹配技能，请候选人补充与岗位相关的经历。"],
    ["Clarify skills not yet evidenced", "Jelaskan kemahiran yang belum dibuktikan", "确认简历尚未明确体现的技能"],
    ["Role requirements to confirm", "Keperluan jawatan untuk disahkan", "需要进一步确认的岗位要求"],
    ["These requirements are not clearly evidenced in the available CV. Ask about relevant experience or a practical approach; do not treat an omission as inability.", "Keperluan ini belum jelas dalam CV tersedia. Tanya pengalaman berkaitan atau pendekatan praktikal; ketiadaan maklumat bukan bermaksud tidak mampu.", "现有简历尚未明确体现这些要求。请询问相关经历或实际处理方法；没有写到不代表不会。"],
    ["No additional skill gaps are flagged in this summary. Confirm depth and practical application rather than assuming proficiency.", "Tiada jurang kemahiran tambahan ditandakan. Sahkan tahap kefahaman dan aplikasi praktikal tanpa menganggap kemahiran telah dikuasai.", "摘要没有标出其他待确认技能，仍需通过实例了解掌握深度和实际应用情况。"],
    ["Discuss the listed projects", "Bincangkan projek yang disenaraikan", "围绕简历项目深入了解"],
    ["Projects recorded in the CV", "Projek yang direkodkan dalam CV", "简历中记录的项目"],
    ["Use these projects as discussion anchors. Clarify ownership, challenges, decisions and measurable outcomes; distinguish team results from individual work.", "Gunakan projek ini sebagai asas perbincangan. Jelaskan tanggungjawab, cabaran, keputusan dan hasil yang boleh diukur; bezakan hasil pasukan daripada kerja individu.", "围绕这些项目确认负责范围、难点、决策过程及可衡量成果，区分团队成果和候选人的个人工作。"],
    ["No project details are recorded in the available CV. Invite an example from work, study or volunteering and clarify the candidate’s contribution.", "Tiada butiran projek direkodkan dalam CV tersedia. Minta contoh kerja, pengajian atau sukarelawan dan jelaskan sumbangan calon.", "现有简历没有记录项目细节，可请候选人提供工作、学习或志愿服务中的例子，并说明个人贡献。"],
    ["Confirm the experience context", "Sahkan konteks pengalaman", "确认经验年限的具体构成"],
    ["Years of experience recorded in the CV", "Tahun pengalaman yang direkodkan dalam CV", "简历中记录的经验年数"],
    ["Experience duration is not specified in the available CV summary. Confirm the timeline and which work is relevant to this role.", "Tempoh pengalaman tidak dinyatakan dalam ringkasan CV tersedia. Sahkan garis masa dan kerja yang berkaitan dengan jawatan.", "现有简历摘要未注明经验年限，请确认经历时间线及与岗位相关的工作内容。"],
    ["Confirm which roles and responsibilities make up this duration and how they relate to the vacancy. The number alone does not establish expertise.", "Sahkan jawatan dan tanggungjawab sepanjang tempoh ini serta kaitannya dengan kekosongan. Angka sahaja tidak membuktikan kepakaran.", "请确认这些年限对应的职位、职责及与当前岗位的关联。年数本身不能证明熟练程度。"],
    ['View interview tips ↻', 'Lihat panduan temu duga ↻', '查看面试注意事项 ↻'],
    ['Interview tips', 'Panduan temu duga', '面试注意事项'],
    ['A practical checklist for a focused, respectful interview.', 'Senarai panduan untuk temu duga yang terarah dan saling menghormati.', '让面试更有条理、彼此尊重的实用清单。'],
    ['Prepare before the interview', 'Bersedia sebelum temu duga', '面试前做好准备'],
    ['Review the CV and role requirements. Choose the skills and experience you want to explore.', 'Semak CV dan keperluan jawatan. Pilih kemahiran dan pengalaman yang ingin diterokai.', '阅读简历与岗位要求，明确需要了解的技能和经历。'],
    ['Set expectations', 'Jelaskan jangkaan', '说明面试安排'],
    ['Introduce yourself, explain the interview structure and timing, and give the candidate time to settle in.', 'Perkenalkan diri, jelaskan susunan dan tempoh temu duga, dan beri calon masa untuk bersedia.', '先自我介绍，说明面试流程和时长，给候选人适应的时间。'],
    ['Ask for concrete examples', 'Minta contoh khusus', '通过具体例子了解经历'],
    ['Explore the situation, the candidate’s own actions and the results. Clarify details without assuming missing experience.', 'Terokai situasi, tindakan calon sendiri dan hasilnya. Jelaskan butiran tanpa menganggap pengalaman yang tidak dinyatakan.', '了解当时的情境、候选人亲自采取的行动及结果；对未说明的经历先询问确认。'],
    ['Keep the discussion job-related', 'Fokus pada perkara berkaitan kerja', '围绕岗位展开讨论'],
    ['Use consistent criteria for candidates applying for the same role. Avoid unrelated personal questions and assumptions.', 'Gunakan kriteria yang konsisten bagi jawatan yang sama. Elakkan soalan peribadi yang tidak berkaitan dan andaian.', '对同一岗位的候选人使用一致标准，避免无关的私人问题和主观假设。'],
    ['Listen and take useful notes', 'Dengar dan catat perkara penting', '认真倾听并记录依据'],
    ['Let the candidate finish. Record examples and evidence, and separate observations from impressions.', 'Beri calon ruang untuk selesai bercakap. Catat contoh dan bukti, serta bezakan pemerhatian daripada tanggapan.', '让候选人完整表达，记录具体例子与依据，并区分观察事实和个人印象。'],
    ['Close with clear next steps', 'Akhiri dengan langkah seterusnya', '清楚说明后续安排'],
    ['Leave time for the candidate’s questions. Explain the next stage, expected timeline and how you will follow up.', 'Sediakan masa untuk soalan calon. Jelaskan peringkat seterusnya, jangka masa dan cara susulan.', '留出候选人提问的时间，说明下一阶段、预计时间及后续联系方式。'],
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
  rows.push(
    ['Edit Profile ⚙️', 'Edit Profil ⚙️', '编辑资料 ⚙️'], ['Email', 'E-mel', '邮箱'], ['Phone', 'Telefon', '电话'], ['Joined', 'Menyertai', '加入时间'],
    ['This prototype uses a local, rule-based PDF parser; it is not a trained AI model and does not verify qualifications. Do not upload real names, contact details, identity documents, or confidential information. Text-based PDFs work best; image-only scans need OCR before upload.', 'Prototaip ini menggunakan penghurai PDF setempat berasaskan peraturan; ia bukan model AI terlatih dan tidak mengesahkan kelayakan. Jangan muat naik nama sebenar, maklumat hubungan, dokumen pengenalan atau maklumat sulit. PDF berasaskan teks memberikan hasil terbaik; imbasan imej memerlukan OCR.', '此原型使用本地规则式 PDF 解析器，并非训练过的 AI 模型，也不会核实资历。请勿上传真实姓名、联系方式、身份证件或机密信息。文本型 PDF 效果较好；纯图片扫描件需要 OCR。'],
    ['2. Review your organised profile', '2. Semak profil tersusun anda', '2. 审核整理后的资料'],
    ['Upload a PDF CV above to extract your structured profile', 'Muat naik CV PDF di atas untuk mengekstrak profil berstruktur anda', '上传上方的 PDF 简历以提取结构化资料'],
    ['Review required before sharing', 'Semakan diperlukan sebelum perkongsian', '分享前必须审核'],
    ['Draft professional summary', 'Draf ringkasan profesional', '职业摘要草稿'], ['Personal & career details', 'Butiran peribadi & kerjaya', '个人与职业资料'],
    ['Check your contact information and work preferences.', 'Semak maklumat hubungan dan pilihan kerja anda.', '检查你的联系方式和工作偏好。'],
    ['Current role / headline', 'Jawatan semasa / tajuk profil', '当前职位／个人简介'], ['Industry sector', 'Sektor industri', '行业领域'],
    ['Preferred work mode', 'Mod kerja pilihan', '偏好的工作模式'], ['Leave blank if unknown; 0 means no experience.', 'Biarkan kosong jika tidak diketahui; 0 bermaksud tiada pengalaman.', '未知可留空；0 表示没有经验。'],
    ['Keep each entry clear and supported by your CV.', 'Pastikan setiap entri jelas dan disokong oleh CV anda.', '请确保每项内容清晰，并有简历内容作为依据。'],
    ['Work experience', 'Pengalaman kerja', '工作经历'], ['extracted mentions are not proof of proficiency', 'sebutan yang diekstrak bukan bukti kemahiran', '简历提及不代表已证明熟练掌握'],
    ['Original extraction evidence (before your edits)', 'Bukti pengekstrakan asal (sebelum suntingan anda)', '原始提取依据（修改前）'],
    ['Quotes and page numbers explain the parser\'s draft. Your edits are self-reported and are not independently verified.', 'Petikan dan nombor halaman menerangkan draf penghurai. Suntingan anda dilaporkan sendiri dan tidak disahkan secara bebas.', '引文和页码用于说明解析器生成的草稿。你的修改属于自行申报，未经独立核实。'],
    ['I have checked the summary, contact details, sections and skills against the PDF, and corrected any mistakes. Mark this profile as reviewed when I save.', 'Saya telah menyemak ringkasan, maklumat hubungan, bahagian dan kemahiran berdasarkan PDF serta membetulkan kesilapan. Tandakan profil ini sebagai disemak apabila saya menyimpannya.', '我已对照 PDF 检查摘要、联系方式、各部分和技能，并更正错误。保存时请将资料标记为已审核。'],
    ['Browse & Apply Jobs →', 'Layari & Mohon Kerja →', '浏览并申请职位 →'], ['Save reviewed profile →', 'Simpan profil yang disemak →', '保存已审核的资料 →'],
    ['3. Manage employer access', '3. Urus akses majikan', '3. 管理雇主访问权限'],
    ['Use Current Location', 'Gunakan Lokasi Semasa', '使用当前位置'], ['Display Scope', 'Skop Paparan', '显示范围'], ['Matched Only', 'Padanan Sahaja', '仅显示匹配项'],
    ['View All Nearby', 'Lihat Semua yang Berdekatan', '查看附近全部'], ['Nearby Hiring Companies', 'Syarikat yang Mengambil Pekerja Berdekatan', '附近招聘企业'],
    ['Your Location', 'Lokasi Anda', '你的位置'], ['Clear Company Filter', 'Kosongkan Penapis Syarikat', '清除企业筛选'], ['Matched Roles', 'Jawatan Sepadan', '匹配职位'],
    ['All Nearby Roles', 'Semua Jawatan Berdekatan', '附近所有职位'], ['Load More Jobs ↓', 'Muatkan Lebih Banyak Kerja ↓', '加载更多职位 ↓'],
    ['AI Verification', 'Pengesahan AI', 'AI 核验'], ['Refresh Trends', 'Muat Semula Trend', '刷新趋势'], ['Data Sources & Citations', 'Sumber Data & Rujukan', '数据来源与引用'],
    ['Account Profile & Settings', 'Profil Akaun & Tetapan', '账号资料与设置'], ['User ID:', 'ID Pengguna:', '用户编号：'], ['Profile Information', 'Maklumat Profil', '个人资料'],
    ['Full Name', 'Nama Penuh', '姓名'], ['Email Address', 'Alamat E-mel', '邮箱地址'], ['Current Role / Title', 'Jawatan Semasa / Gelaran', '当前职位／职称'],
    ['Career Field / Industry', 'Bidang Kerjaya / Industri', '职业领域／行业'], ['Preferred Work Mode', 'Mod Kerja Pilihan', '偏好的工作模式'], ['Location / City', 'Lokasi / Bandar', '地点／城市'],
    ['Sharing is your choice', 'Perkongsian ialah pilihan anda', '是否分享由你决定'], ['Active', 'Aktif', '有效'],
    ['Your CV stays private until you choose a recipient and access scope. This demo does not verify real-world identity or certify legal compliance.', 'CV anda kekal peribadi sehingga anda memilih penerima dan skop akses. Demo ini tidak mengesahkan identiti sebenar atau memperakui pematuhan undang-undang.', '在你选择接收者和访问范围前，简历会保持私密。本演示不会核实真实身份或认证法律合规性。'],
    ['Save Profile Changes →', 'Simpan Perubahan Profil →', '保存资料修改 →'], ['Current Password', 'Kata Laluan Semasa', '当前密码'], ['New Password', 'Kata Laluan Baharu', '新密码'],
    ['Review the extracted summary. Keep only statements supported by the CV.', 'Semak ringkasan yang diekstrak. Kekalkan hanya kenyataan yang disokong oleh CV.', '检查提取的摘要，只保留简历有依据的内容。'],
    ['One entry per line', 'Satu entri setiap baris', '每行填写一项'], ['Add a skill and press Enter (e.g. Python Data Analysis)', 'Tambah kemahiran dan tekan Enter (cth. Analisis Data Python)', '添加技能并按回车（例如 Python 数据分析）'],
    ['Search by job title, skill, or company...', 'Cari mengikut jawatan, kemahiran atau syarikat...', '按职位、技能或企业搜索……'],
    ['Your display name', 'Nama paparan anda', '你的显示名称'], ['e.g. Financial Auditor / Software Dev', 'cth. Juruaudit Kewangan / Pembangun Perisian', '例如：财务审计师／软件开发人员'],
    ['Re-type new password', 'Taip semula kata laluan baharu', '再次输入新密码'], ['Employer Company', 'Syarikat Majikan', '雇主企业'], ['Refresh', 'Muat Semula', '刷新'],
    ['Company & HR Profile', 'Profil Syarikat & HR', '企业与 HR 资料'], ['HR Contact Name', 'Nama Pegawai HR', 'HR 联系人姓名'],
    ['Work Email Address', 'Alamat E-mel Kerja', '工作邮箱'], ['Company Name', 'Nama Syarikat', '企业名称'], ['HR / Executive Title', 'Jawatan HR / Eksekutif', 'HR／管理职位'],
    ['Shared CV · CareerLens', 'CV Dikongsi · CareerLens', '共享简历 · CareerLens'], ['PDF', 'PDF', 'PDF'], ['Try sample', 'Cuba sampel', '试用示例'],
    ['No source quote available.', 'Tiada petikan sumber tersedia.', '没有可用的原文引述。'], ['No field evidence available.', 'Tiada bukti medan tersedia.', '没有可用的字段依据。'],
    ['CV wording signals · local keyword heuristics', 'Petunjuk perkataan CV · heuristik kata kunci setempat', '简历措辞信号 · 本地关键词规则'],
    ['(confidence not validated) · Major:', '(keyakinan belum disahkan) · Pengkhususan:', '（置信度未验证）· 专业：'],
    ['No recorded employer access.', 'Tiada akses majikan direkodkan.', '尚无雇主访问记录。'], ['Withdraw & revoke access', 'Tarik Balik & Batalkan Akses', '撤回申请并取消访问权限'],
    ['No active applications. No employer has permission to access this CV through an application.', 'Tiada permohonan aktif. Tiada majikan dibenarkan mengakses CV ini melalui permohonan.', '目前没有有效申请。没有雇主通过申请获准访问此简历。'],
    ['No skills extracted. Add only skills supported by the CV.', 'Tiada kemahiran diekstrak. Tambah hanya kemahiran yang disokong oleh CV.', '未提取到技能。请只添加简历内容能够证明的技能。'],
    ['Select State / Wilayah...', 'Pilih Negeri / Wilayah...', '选择州属／联邦直辖区……'], ['available at this company', 'tersedia di syarikat ini', '此企业提供'],
    ['Available Positions', 'Jawatan Tersedia', '可申请职位'], ['View All Nearby Roles →', 'Lihat Semua Jawatan Berdekatan →', '查看附近所有职位 →'],
    ['APPLIED', 'DIPOHON', '已申请'], ['Applied', 'Telah Dipohon', '已申请'], ['Choose access for this vacancy owner', 'Pilih akses untuk pemilik jawatan ini', '选择向此职位发布企业提供的访问权限'],
    ['Aggregate demo statistics', 'Statistik demo agregat', '汇总演示统计数据'],
  );
  rows.push(
    ["Analyzing CV and generating 3 targeted verification scenarios...","Menganalisis CV dan menjana 3 senario pengesahan yang disasarkan...","正在分析简历并生成 3 道针对性验证情景题……"],
    ["Failed to generate questions. Please try again.","Gagal menjana soalan. Sila cuba lagi.","问题生成失败，请重试。"],
    ["Network error while generating questions.","Ralat rangkaian semasa menjana soalan.","生成问题时发生网络错误。"],
    ["Submission failed. Try again.","Penghantaran gagal. Sila cuba lagi.","提交失败，请重试。"],
    ["Account & Profile","Akaun & Profil","账号与资料"],
    ["Account & Professional Background","Akaun & Latar Belakang Profesional","账号与职业背景"],
    ["Account profile & skills vault","Profil akaun & peti kemahiran","账号资料与技能库"],
    ["Saving...","Menyimpan...","正在保存……"],
    ["Account profile updated successfully!","Profil akaun berjaya dikemas kini!","账号资料更新成功！"],
    ["Please enter all password fields.","Sila isi semua ruangan kata laluan.","请填写所有密码栏。"],
    ["New passwords do not match.","Kata laluan baharu tidak sepadan.","两次新密码不一致。"],
    ["Updating...","Sedang mengemas kini...","正在更新……"],
    ["Password updated successfully!","Kata laluan berjaya dikemas kini!","密码更新成功！"],
    ["Unsaved changes. Check your edits and confirm the review before saving.","Perubahan belum disimpan. Semak suntingan anda dan sahkan semakan sebelum menyimpan.","有未保存的修改。请核对修改并确认审核后再保存。"],
    ["Unsaved changes","Perubahan belum disimpan","有未保存的修改"],
    ["Discard unsaved edits and reload the saved profile?","Buang suntingan yang belum disimpan dan muat semula profil tersimpan?","放弃未保存的修改并重新加载已保存的资料？"],
    ["Replace the current PDF and organised profile?","Gantikan PDF dan profil tersusun yang sedang digunakan?","替换当前 PDF 和整理后的资料？"],
    ["Your current profile edits will be replaced.","Suntingan profil semasa anda akan digantikan.","当前资料修改将被替换。"],
    ["Any links shared with named recipients will also be revoked. Previously downloaded copies cannot be retracted.","Semua pautan yang dikongsi dengan penerima bernama turut dibatalkan. Salinan yang telah dimuat turun tidak dapat ditarik balik.","分享给指定接收者的链接也会被撤销，已下载的副本无法收回。"],
    ["Your vault change was saved, but some related data could not refresh. Please reload.","Perubahan peti anda telah disimpan, tetapi sebahagian data berkaitan gagal dimuat semula. Sila muat semula.","简历库修改已保存，但部分相关数据未能刷新，请重新加载页面。"],
    ["PDF processed. Review the draft before sharing.","PDF telah diproses. Semak draf sebelum berkongsi.","PDF 已处理，请在分享前审核草稿。"],
    ["Preference saved. Aggregate publication is currently disabled.","Keutamaan disimpan. Penerbitan data agregat dimatikan buat masa ini.","偏好已保存，目前不发布汇总统计。"],
    ["Check your profile against the PDF, then tick the review confirmation.","Bandingkan profil anda dengan PDF, kemudian tandakan pengesahan semakan.","请对照 PDF 核对资料，然后勾选审核确认。"],
    ["Enter the name shown on the fictional CV.","Masukkan nama yang tertera pada CV rekaan.","请输入虚构简历上的姓名。"],
    ["Saving these edits will withdraw existing applications and revoke recipient sharing. Continue?","Menyimpan suntingan ini akan menarik balik permohonan sedia ada dan membatalkan perkongsian kepada penerima. Teruskan?","保存这些修改将撤回现有申请并撤销接收者访问授权，是否继续？"],
    ["Saving your reviewed profile…","Menyimpan profil yang telah disemak…","正在保存已审核资料……"],
    ["Reviewed profile saved. Choose employer access when you apply.","Profil yang disemak telah disimpan. Pilih akses majikan semasa memohon.","已保存审核后的资料，请在申请职位时选择雇主访问权限。"],
    ["Exported the saved profile. Unsaved edits are not included.","Profil tersimpan telah dieksport. Suntingan yang belum disimpan tidak disertakan.","已导出保存的资料，不包含未保存的修改。"],
    ["Delete your stored PDF and organised profile, withdraw all applications and revoke future employer and recipient access? This cannot be undone. Previously downloaded copies cannot be retracted.","Padam PDF dan profil tersusun yang disimpan, tarik balik semua permohonan serta batalkan akses majikan dan penerima pada masa hadapan? Tindakan ini tidak boleh dibuat asal. Salinan yang telah dimuat turun tidak dapat ditarik balik.","删除已保存的 PDF 和整理后的资料，撤回所有申请并撤销雇主及接收者的后续访问权限？此操作无法撤销，已下载的副本无法收回。"],
    ["Please enter a building, street, or area name.","Sila masukkan nama bangunan, jalan atau kawasan.","请输入建筑、街道或地区名称。"],
    ["Location services are unavailable in this browser.","Perkhidmatan lokasi tidak tersedia dalam pelayar ini.","此浏览器无法使用定位服务。"],
    ["Detecting Location...","Mengesan lokasi...","正在获取位置……"],
    ["Location access was declined. Please search your address or select a state.","Akses lokasi ditolak. Sila cari alamat anda atau pilih negeri.","定位权限被拒绝，请搜索地址或选择州属。"],
    ["Save your reviewed CV before choosing application permissions.","Simpan CV yang telah disemak sebelum memilih kebenaran permohonan.","请先保存已审核的简历，再选择申请权限。"],
    ["Choose what to share before applying.","Pilih perkara yang ingin dikongsi sebelum memohon.","申请前请选择要分享的内容。"],
    ["Save your reviewed profile before sharing.","Simpan profil yang telah disemak sebelum berkongsi.","分享前请先保存已审核的资料。"],
    ["Withdraw application and revoke future employer access? Previously downloaded copies cannot be recalled.","Tarik balik permohonan dan batalkan akses majikan pada masa hadapan? Salinan yang telah dimuat turun tidak dapat ditarik balik.","撤回申请并撤销雇主的后续访问权限？已下载的副本无法收回。"],
    ["3 AI Verification questions successfully generated!","3 soalan Pengesahan AI berjaya dijana!","已成功生成 3 道 AI 技能验证题！"],
    ["Submitting answers...","Menghantar jawapan...","正在提交答案……"],
    ["Verification answers evaluated!","Jawapan pengesahan telah dinilai!","验证答案已评分！"],
    ["Open explicitly shared original PDF","Buka PDF asal yang dikongsi secara jelas","打开已明确授权分享的原始 PDF"],
    ["Reviewed professional summary","Ringkasan profesional yang disemak","已审核的职业摘要"],
    ["Review status","Status semakan","审核状态"],
    ["Reviewed by the CV owner","Disemak oleh pemilik CV","已由简历所有者审核"],
    ["Not independently verified","Tidak disahkan secara bebas","未经独立核实"],
    ["Access to this CV has been recorded in the candidate's access log.","Akses kepada CV ini telah direkodkan dalam log akses calon.","此次简历访问已记录在候选人的访问日志中。"],
    ["Employer profile updated successfully!","Profil majikan berjaya dikemas kini!","雇主资料更新成功！"],
    ["Vacancies unavailable","Kekosongan jawatan tidak tersedia","招聘职位暂不可用"],
    ["Vacancy created","Kekosongan jawatan telah dibuat","职位已创建"],
    ["Delete this vacancy?","Padam kekosongan jawatan ini?","删除此招聘职位？"],
    ["Vacancy deleted","Kekosongan jawatan dipadam","职位已删除"],
    ["Questions copied","Soalan disalin","问题已复制"],
    ["Copy failed","Gagal menyalin","复制失败"],
    ["Ask Lumi","Tanya Lumi","询问 Lumi"],
    ["Career Advisor","Penasihat Kerjaya","职业顾问"],
    ["Preparing your career insights...","Menyediakan pandangan kerjaya anda...","正在准备职业建议……"],
    ["Unable to start a secure session.","Tidak dapat memulakan sesi yang selamat.","无法建立安全会话。"],
    ["Google processing is off. Choose a role yourself or allow processing above.","Pemprosesan Google dimatikan. Pilih jawatan sendiri atau benarkan pemprosesan di atas.","Google 处理已关闭，请自行选择岗位，或在上方授权处理。"],
    ["Recipient-only link","Pautan untuk penerima sahaja","仅限接收者使用的链接"],
    ["Recipient-only share link","Pautan perkongsian untuk penerima sahaja","仅限接收者使用的分享链接"],
    ["Revoke access","Batalkan akses","撤销访问权限"],
    ["No active recipient shares.","Tiada perkongsian penerima yang aktif.","暂无有效的接收者分享。"],
    ["Choose the content to share.","Pilih kandungan untuk dikongsi.","请选择要分享的内容。"],
    ["Recipient access revoked.","Akses penerima telah dibatalkan.","已撤销接收者访问权限。"],
    ["Could not load recipient access.","Tidak dapat memuatkan akses penerima.","无法加载接收者访问权限。"],
    ["Could not create share.","Tidak dapat membuat perkongsian.","无法创建分享。"],
    ["Could not revoke access.","Tidak dapat membatalkan akses.","无法撤销访问权限。"],
    ["Close Advisor","Tutup Penasihat","关闭顾问"],
    ["Lumi · Talent & Workforce Advisor","Lumi · Penasihat Bakat & Tenaga Kerja","Lumi · 人才与团队顾问"],
    ["Lumi · Career Advisor","Lumi · Penasihat Kerjaya","Lumi · 职业顾问"],
    ["Support for candidate screening & workforce planning","Sokongan untuk saringan calon & perancangan tenaga kerja","提供候选人筛选与团队规划支持"],
    ["Personalised guidance for your career, skills & job search","Panduan peribadi untuk kerjaya, kemahiran & pencarian kerja anda","为你的职业、技能及求职提供个性化建议"],
    ["Open Lumi Career Advisor","Buka Penasihat Kerjaya Lumi","打开 Lumi 职业顾问"],
    ["Lumi Career Advisor","Penasihat Kerjaya Lumi","Lumi 职业顾问"],
    ["Online","Dalam talian","在线"],
    ["Allow Google Gemini to rewrite replies using my message and reviewed CV profile. Optional; off by default.","Benarkan Google Gemini menulis semula balasan menggunakan mesej dan profil CV saya yang telah disemak. Pilihan ini dimatikan secara lalai.","允许 Google Gemini 根据我的消息及已审核简历资料改写回复。此项可选，默认关闭。"],
    ["Ask about nearby roles, career paths, skills, or courses...","Tanya tentang jawatan berdekatan, laluan kerjaya, kemahiran atau kursus...","询问附近岗位、职业路径、技能或课程……"],
    ["Welcome! I am Lumi, your Talent & Workforce Advisor.","Selamat datang! Saya Lumi, Penasihat Bakat & Tenaga Kerja anda.","欢迎！我是 Lumi，你的人才与团队顾问。"],
    ["Welcome! I am Lumi, your Career Advisor.","Selamat datang! Saya Lumi, Penasihat Kerjaya anda.","欢迎！我是 Lumi，你的职业顾问。"],
    ["How may I assist you with","Bagaimanakah saya boleh membantu anda tentang","我可以如何帮助你处理"],
    ["candidate screening","saringan calon","候选人筛选"],
    ["submitted applications","permohonan yang dihantar","已提交的申请"],
    ["team skill readiness","kesediaan kemahiran pasukan","团队技能就绪度"],
    ["today?","hari ini?","？"],
    ["I can help you explore","Saya boleh membantu anda meneroka","我可以帮你探索"],
    ["nearby job opportunities","peluang pekerjaan berdekatan","附近的就业机会"],
    ["future role matches","padanan jawatan pada masa hadapan","未来岗位匹配"],
    ["reskilling pathways","laluan latihan semula","技能提升路径"],
    ["or review your","atau menyemak","或查看你的"],
    ["CV profile","profil CV","简历资料"],
    ["Ask me about","Tanya saya tentang","欢迎询问"],
    ["career pathways, nearby job matching, skill development, or candidate screening","laluan kerjaya, padanan kerja berdekatan, pembangunan kemahiran atau saringan calon","职业路径、附近岗位匹配、技能发展或候选人筛选"],
    ["Please let me know how I can assist you.","Beritahu saya bagaimana saya boleh membantu anda.","请告诉我你需要什么帮助。"],
    ["Generating...","Sedang menjana...","正在生成……"],
    ["Regenerate Questions","Jana Semula Soalan","重新生成问题"],
    ["Type your answer or practical approach here...","Taip jawapan atau pendekatan praktikal anda di sini...","在此填写你的答案或实际做法……"],
    ["Scenario-Based","Berasaskan Senario","情景题"],
    ["Medium","Sederhana","中等"],
    ["Skill Test","Ujian Kemahiran","技能测试"],
    ["Domain & Ethics Standard","Piawaian Bidang & Etika","领域与道德规范"],
    ["Technical Proficiency","Kecekapan Teknikal","技术能力"],
    ["Problem Solving","Penyelesaian Masalah","问题解决"],
    ["How do you ensure data integrity, fairness, or best industry practices when deploying solutions in team environments?","Bagaimanakah anda memastikan integriti data, keadilan atau amalan industri terbaik semasa melaksanakan penyelesaian dalam persekitaran pasukan?","在团队环境中部署方案时，你如何确保数据完整性、公平性或遵循行业最佳实践？"],
    ["Experience not specified","Pengalaman tidak dinyatakan","未填写工作经验"],
    ["Source not specified","Sumber tidak dinyatakan","未注明来源"],
    ["unverified","belum disahkan","未经验证"],
    ["full name","nama penuh","姓名"],
    ["current role","jawatan semasa","当前岗位"],
    ["years experience","tahun pengalaman","工作年限"],
    ["education level","tahap pendidikan","学历"],
    ["work mode preference","pilihan mod kerja","工作模式偏好"],
    ["executive summary","ringkasan eksekutif","职业摘要"],
    ["work experience","pengalaman kerja","工作经历"],
    ["education history","sejarah pendidikan","教育经历"],
    ["Name","Nama","姓名"],
    ["Role","Jawatan","岗位"],
    ["Qualification","Kelayakan","学历"],
    ["Work preference","Pilihan kerja","工作偏好"],
    ["Skills mentioned or owner supplied","Kemahiran yang disebut atau diberikan oleh pemilik","简历提及或所有者补充的技能"],
    ["Experience","Pengalaman","工作经历"],
    ["Practical Problem Solving","Penyelesaian Masalah Praktikal","实际问题解决"],
    ["Technical Competency","Kecekapan Teknikal","技术能力"],
    ["Intermediate","Pertengahan","中级"],
    ["Advanced","Lanjutan","高级"],
    ["Describe a scenario where you optimized a workflow or resolved a critical bug/bottleneck in your past experience.","Huraikan situasi apabila anda mengoptimumkan aliran kerja atau menyelesaikan pepijat kritikal atau kesesakan berdasarkan pengalaman lalu.","请描述你过去优化工作流程，或解决重大错误／瓶颈的一次经历。"],
    ["Counts of words and phrases are prompts for review, not proof of ability or hiring suitability.","Kiraan perkataan dan frasa ialah petunjuk untuk disemak, bukannya bukti kebolehan atau kesesuaian untuk diambil bekerja.","词语和短语的统计仅供审核参考，不证明能力或岗位适配性。"],
    ["Wording signals are prompts for review, not proof of ability or hiring suitability.","Petunjuk perkataan ialah panduan untuk disemak, bukannya bukti kebolehan atau kesesuaian untuk diambil bekerja.","措辞信号仅供审核参考，不证明能力或岗位适配性。"],
    ["Upload a fictional PDF or try a sample to create your profile.","Muat naik PDF rekaan atau cuba sampel untuk mencipta profil anda.","上传虚构 PDF 或试用示例以创建资料。"],
    ["Upload a fictional PDF or choose a sample to begin.","Muat naik PDF rekaan atau pilih sampel untuk bermula.","上传虚构 PDF 或选择示例以开始。"],
    ["Saved profile is ready for your sharing choices.","Profil tersimpan sedia untuk pilihan perkongsian anda.","资料已保存，可以选择分享权限。"],
    ["This draft cannot be shared until you review and save it.","Draf ini tidak boleh dikongsi sehingga anda menyemak dan menyimpannya.","审核并保存前，无法分享此草稿。"],
    ["Checking your PDF…","Menyemak PDF anda…","正在检查 PDF……"],
    ["Choose a PDF file.","Pilih fail PDF.","请选择 PDF 文件。"],
    ["Confirm that this custom PDF contains only fictional information before uploading.","Sahkan bahawa PDF tersuai ini hanya mengandungi maklumat rekaan sebelum memuat naik.","上传前请确认此 PDF 仅包含虚构信息。"],
    ["Checking sample PDF…","Menyemak PDF sampel…","正在检查示例 PDF……"],
    ["Could not export your profile.","Tidak dapat mengeksport profil anda.","无法导出资料。"],
    ["Your vault could not be deleted.","Peti anda tidak dapat dipadam.","无法删除简历库。"],
    ["Vault deleted and sharing revoked.","Peti dipadam dan perkongsian dibatalkan.","已删除简历库并撤销分享。"],
    ["This discovery listing has no recipient account for an in-app application.","Penyenaraian penemuan ini tidak mempunyai akaun penerima untuk permohonan dalam aplikasi.","此职位信息没有关联接收账号，无法在应用内申请。"],
    ["Could not submit application.","Tidak dapat menghantar permohonan.","无法提交申请。"],
    ["Could not withdraw.","Tidak dapat menarik balik.","无法撤回。"],
    ["Access denied to CV.","Akses kepada CV ditolak.","无权访问此简历。"],
    ["Here is your latest career snapshot.","Berikut ialah gambaran kerjaya terkini anda.","这是你最新的职业概览。"],
    ["Complete the steps below to unlock your full plan.","Lengkapkan langkah di bawah untuk membuka pelan penuh anda.","完成以下步骤，查看完整计划。"],
    ["Start by picking a sample persona or listing your skills.","Mulakan dengan memilih persona sampel atau menyenaraikan kemahiran anda.","请先选择示例人物或填写技能。"],
    ["Enter the recipient's registered CareerLens email.","Masukkan e-mel CareerLens berdaftar penerima.","请输入接收者注册 CareerLens 时使用的邮箱。"],
    ["Choose the summary, original PDF, or both to share.","Pilih ringkasan, PDF asal atau kedua-duanya untuk dikongsi.","请选择分享摘要、原始 PDF，或两者都分享。"],
    ["Choose an expiry of 1, 7, or 30 days.","Pilih tempoh luput 1, 7 atau 30 hari.","请选择 1、7 或 30 天的有效期。"],
    ["Upload and review your CV first.","Muat naik dan semak CV anda dahulu.","请先上传并审核简历。"],
    ["Your CV changed. Refresh and review it before sharing.","CV anda telah berubah. Muat semula dan semak sebelum berkongsi.","简历已更改，请刷新并审核后再分享。"],
    ["Review and save your profile before sharing.","Semak dan simpan profil anda sebelum berkongsi.","请审核并保存资料后再分享。"],
    ["No matching recipient account. Ask them to register with this email first.","Tiada akaun penerima yang sepadan. Minta mereka mendaftar menggunakan e-mel ini dahulu.","未找到对应的接收者账号，请让对方先使用此邮箱注册。"],
    ["Your own CV is already available in your vault.","CV anda sendiri sudah tersedia dalam peti anda.","你可以直接在简历库查看自己的简历。"],
    ["Account not found.","Akaun tidak ditemui.","未找到账号。"],
    ["Full name must be at least 2 characters.","Nama penuh mestilah sekurang-kurangnya 2 aksara.","姓名至少需要 2 个字符。"],
    ["This email address is already in use by another account.","Alamat e-mel ini telah digunakan oleh akaun lain.","该邮箱已被其他账号使用。"],
    ["Please enter both your current password and a new password.","Sila masukkan kata laluan semasa dan kata laluan baharu.","请输入当前密码和新密码。"],
    ["New passwords do not match. Please verify and re-type.","Kata laluan baharu tidak sepadan. Sila semak dan taip semula.","两次新密码不一致，请核对并重新输入。"],
    ["Current password is incorrect. Please try again.","Kata laluan semasa tidak betul. Sila cuba lagi.","当前密码不正确，请重试。"],
    ["This file is not a public synthetic demo CV.","Fail ini bukan CV demo sintetik awam.","此文件并非公开的合成示例简历。"],
    ["Your session changed. Refresh this page and try again.","Sesi anda telah berubah. Muat semula halaman ini dan cuba lagi.","会话已更改，请刷新页面后重试。"],
    ["This request must come from CareerLens.","Permintaan ini mesti berasal daripada CareerLens.","此请求必须来自 CareerLens。"],
    ["Upload one PDF CV, no larger than 8 MB.","Muat naik satu CV PDF yang saiznya tidak melebihi 8 MB.","请上传一个不超过 8 MB 的 PDF 简历。"],
    ["The request could not be read. Refresh and try again.","Permintaan tidak dapat dibaca. Muat semula dan cuba lagi.","无法读取请求，请刷新后重试。"],
    ["Please sign in first.","Sila log masuk dahulu.","请先登录。"],
    ["Logged out successfully.","Berjaya log keluar.","已成功退出登录。"],
    ["Unknown questionnaire action.","Tindakan soal selidik tidak diketahui.","未知的问卷操作。"],
    ["Invalid questionnaire request.","Permintaan soal selidik tidak sah.","问卷请求无效。"],
    ["For this hackathon demo, confirm this is a synthetic CV with no real personal data.","Untuk demo hackathon ini, sahkan bahawa CV ini ialah CV sintetik tanpa data peribadi sebenar.","请确认此次黑客松演示使用的简历为合成简历，不含真实个人信息。"],
    ["Please select a valid .pdf CV file to upload.","Sila pilih fail CV .pdf yang sah untuk dimuat naik.","请选择有效的 .pdf 简历文件上传。"],
    ["Analytics consent must be true or false.","Persetujuan analitik mesti bernilai benar atau palsu.","统计授权必须选择同意或不同意。"],
    ["No CV found to export.","Tiada CV ditemui untuk dieksport.","没有可导出的简历。"],
    ["Access revoked.","Akses dibatalkan.","已撤销访问。"],
    ["Share not found.","Perkongsian tidak ditemui.","未找到分享记录。"],
    ["This shared PDF is unavailable for your account.","PDF yang dikongsi ini tidak tersedia untuk akaun anda.","你的账号无法访问此共享 PDF。"],
    ["No uploaded PDF CV found.","Tiada CV PDF yang dimuat naik ditemui.","未找到已上传的 PDF 简历。"],
    ["lat and lng required","Latitud dan longitud diperlukan","需要提供纬度和经度。"],
    ["This is a discovery listing without a connected employer account. Your CV has not been sent.","Ini ialah penyenaraian penemuan tanpa akaun majikan yang disambungkan. CV anda tidak dihantar.","此职位信息未关联雇主账号，你的简历尚未发送。"],
    ["Trend data successfully updated!","Data trend berjaya dikemas kini!","趋势数据更新成功！"],
    ["Vacancy not found.","Kekosongan jawatan tidak ditemui.","未找到招聘职位。"],
    ["Candidate did not grant access to their organised CV summary.","Calon tidak memberikan akses kepada ringkasan CV tersusun mereka.","候选人未授权访问整理后的简历摘要。"],
    ["Candidate did not share the original PDF CV for this application.","Calon tidak berkongsi CV PDF asal untuk permohonan ini.","候选人未在此次申请中分享原始 PDF 简历。"],
    ["Send a text message up to 4,000 characters and a valid location.","Hantar mesej teks sehingga 4,000 aksara dan lokasi yang sah.","请发送不超过 4,000 个字符的文字消息，并提供有效位置。"],
    ["Choose a city or provide valid latitude and longitude.","Pilih bandar atau berikan latitud dan longitud yang sah.","请选择城市或提供有效经纬度。"],
    ["Answers successfully evaluated!","Jawapan berjaya dinilai!","答案已成功评分！"],
    ["Reviewed by you","Disemak oleh anda","已由你审核"],
    ["Needs your review","Memerlukan semakan anda","等待你审核"],
    ["Extraction method:","Kaedah pengekstrakan:","提取方式："],
    ["Local PDF text extraction","Pengekstrakan teks PDF setempat","本地 PDF 文字提取"],
    ["Missing information is left blank; correct the draft using the original PDF.","Maklumat yang tiada dibiarkan kosong; betulkan draf dengan merujuk PDF asal.","缺失信息留空，请根据原始 PDF 修正草稿。"],
    ["Summary shared","Ringkasan dikongsi","摘要已分享"],
    ["Summary private","Ringkasan peribadi","摘要未公开"],
    ["PDF shared","PDF dikongsi","PDF 已分享"],
    ["PDF private","PDF peribadi","PDF 未公开"],
    ["Summary","Ringkasan","摘要"],
    ["Shared via application","Dikongsi melalui permohonan","通过申请分享"],
    ["Contact","Hubungan","联系方式"],
    ["page","halaman","页"],
    ["Name:","Nama:","姓名："],
    ["No applications yet.","Belum ada permohonan.","暂无申请。"],
    ["Private sharing","Perkongsian peribadi","私密分享"],
    ["No original PDF access","Tiada akses kepada PDF asal","无原始 PDF 访问权限"],
    ["or","atau","或"],
    ["Access granted for this application and resource.","Akses diberikan untuk permohonan dan sumber ini.","已授权访问此次申请对应的内容。"],
    ["Access granted to this account. Copy the link to share it; no email was sent.","Akses diberikan kepada akaun ini. Salin pautan untuk berkongsi; tiada e-mel dihantar.","已向该账号授权。请复制链接进行分享；系统未发送邮件。"],
    ["Add at least one required skill directly related to the role.","Tambah sekurang-kurangnya satu kemahiran wajib yang berkaitan secara langsung dengan jawatan.","请至少添加一项与岗位直接相关的必需技能。"],
    ["Application not found or access denied.","Permohonan tidak ditemui atau akses ditolak.","未找到申请，或无权访问。"],
    ["Application saved with only your selected CV resources shared.","Permohonan disimpan dan hanya sumber CV yang anda pilih dikongsi.","申请已保存，仅分享了你选定的简历内容。"],
    ["Application withdrawn. Further employer access is revoked; earlier downloaded copies cannot be recalled.","Permohonan ditarik balik. Akses majikan seterusnya dibatalkan; salinan yang telah dimuat turun tidak dapat ditarik balik.","申请已撤回，雇主的后续访问已撤销；之前下载的副本无法收回。"],
    ["Candidate CV not found.","CV calon tidak ditemui.","未找到候选人简历。"],
    ["Choose at least one CV resource to share, or withdraw the application to revoke access.","Pilih sekurang-kurangnya satu sumber CV untuk dikongsi, atau tarik balik permohonan untuk membatalkan akses.","请至少选择一项简历内容进行分享，或撤回申请以撤销访问。"],
    ["Choose whether to include your CV in aggregate statistics.","Pilih sama ada CV anda akan disertakan dalam statistik agregat.","请选择是否将简历纳入汇总统计。"],
    ["No CV found.","CV tidak ditemui.","未找到简历。"],
    ["No active application found for this vacancy.","Tiada permohonan aktif untuk kekosongan jawatan ini.","未找到此职位的有效申请。"],
    ["No verified course is available for this skill.","Tiada kursus yang disahkan tersedia untuk kemahiran ini.","暂无对应此技能的已核实课程。"],
    ["Only PDF files (.pdf) are accepted. Export your CV as a PDF and try again.","Hanya fail PDF (.pdf) diterima. Eksport CV anda sebagai PDF dan cuba lagi.","仅接受 PDF 文件（.pdf），请将简历导出为 PDF 后重试。"],
    ["PDF CVs can contain at most 20 pages. Upload a shorter version.","CV PDF boleh mengandungi maksimum 20 halaman. Muat naik versi yang lebih pendek.","PDF 简历最多 20 页，请上传较短版本。"],
    ["PDF extracted locally. Review and confirm the organised draft before sharing.","PDF diekstrak secara setempat. Semak dan sahkan draf tersusun sebelum berkongsi.","已在本地提取 PDF，请在分享前审核并确认整理后的草稿。"],
    ["PDF file exceeds the 8 MB maximum size limit.","Saiz fail PDF melebihi had maksimum 8 MB.","PDF 文件超过 8 MB 大小限制。"],
    ["Please choose a valid minimum education level.","Sila pilih tahap pendidikan minimum yang sah.","请选择有效的最低学历。"],
    ["Please choose a valid work mode.","Sila pilih mod kerja yang sah.","请选择有效的工作模式。"],
    ["Please upload your PDF CV first.","Sila muat naik CV PDF anda dahulu.","请先上传 PDF 简历。"],
    ["Position title must be 2–80 characters.","Tajuk jawatan mestilah 2–80 aksara.","职位名称须为 2–80 个字符。"],
    ["Profile updated successfully!","Profil berjaya dikemas kini!","资料更新成功！"],
    ["Review and confirm your CV details before sharing with an employer.","Semak dan sahkan butiran CV anda sebelum berkongsi dengan majikan.","向雇主分享前，请审核并确认简历内容。"],
    ["Salary budget and years of experience must be numbers.","Bajet gaji dan tahun pengalaman mesti dalam bentuk nombor.","薪资预算和经验年限必须为数字。"],
    ["Salary expectation must be a non-negative number.","Jangkaan gaji mestilah nombor bukan negatif.","期望薪资必须为非负数。"],
    ["Salary maximum must be greater than or equal to the minimum.","Gaji maksimum mestilah lebih tinggi atau sama dengan gaji minimum.","最高薪资必须大于或等于最低薪资。"],
    ["Send a valid application.","Hantar permohonan yang sah.","请提交有效的申请。"],
    ["Send a valid profile update.","Hantar kemas kini profil yang sah.","请提交有效的资料更新。"],
    ["Sharing choices must be true or false.","Pilihan perkongsian mesti bernilai benar atau palsu.","分享选项必须选择同意或不同意。"],
    ["The CV could not be stored. Please try again; your previous record was kept.","CV tidak dapat disimpan. Sila cuba lagi; rekod terdahulu anda dikekalkan.","无法保存简历，请重试；之前的记录已保留。"],
    ["The PDF document contains no pages.","Dokumen PDF ini tidak mengandungi halaman.","此 PDF 文档没有页面。"],
    ["The PDF is damaged, malformed, or uses an unsupported format. Open it in a PDF reader and export a fresh text PDF.","PDF rosak, tidak sah atau menggunakan format yang tidak disokong. Buka dengan pembaca PDF dan eksport semula sebagai PDF teks.","PDF 已损坏、格式异常或不受支持。请使用 PDF 阅读器打开，并重新导出文字型 PDF。"],
    ["The candidate has not shared this CV resource.","Calon belum berkongsi sumber CV ini.","候选人未分享此简历内容。"],
    ["The candidate must review this CV before it can be shared.","Calon mesti menyemak CV ini sebelum ia boleh dikongsi.","候选人须先审核此简历，才能分享。"],
    ["The cover note or availability is invalid.","Nota pengiring atau ketersediaan tidak sah.","申请附言或可入职时间无效。"],
    ["The review confirmation must be true or false.","Pengesahan semakan mesti bernilai benar atau palsu.","审核确认必须选择同意或不同意。"],
    ["The shared PDF is no longer available.","PDF yang dikongsi tidak lagi tersedia.","此共享 PDF 已不可用。"],
    ["The statistics preference must be true or false.","Keutamaan statistik mesti bernilai benar atau palsu.","统计偏好必须选择同意或不同意。"],
    ["The stored file could not be removed. Please try again.","Fail tersimpan tidak dapat dibuang. Sila cuba lagi.","无法删除已保存的文件，请重试。"],
    ["The stored file could not be safely removed. Contact the application owner.","Fail tersimpan tidak dapat dibuang dengan selamat. Hubungi pemilik aplikasi.","无法安全删除已保存的文件，请联系应用所有者。"],
    ["The uploaded PDF is empty or incomplete. Export it again and retry.","PDF yang dimuat naik kosong atau tidak lengkap. Eksport semula dan cuba lagi.","上传的 PDF 为空或不完整，请重新导出后重试。"],
    ["This CV has changed. Reload the vault before saving or confirming your review.","CV ini telah berubah. Muat semula peti sebelum menyimpan atau mengesahkan semakan.","简历已更改，请重新加载简历库后再保存或确认审核。"],
    ["This PDF contains an unusually large page. Export a simplified text PDF and retry.","PDF ini mengandungi halaman yang luar biasa besar. Eksport PDF teks yang dipermudah dan cuba lagi.","此 PDF 包含过大的页面，请导出简化的文字型 PDF 后重试。"],
    ["This PDF contains too much text to process safely. Upload a shorter CV (maximum 100,000 characters).","PDF ini mengandungi terlalu banyak teks untuk diproses dengan selamat. Muat naik CV yang lebih pendek (maksimum 100,000 aksara).","此 PDF 的文字过多，无法安全处理。请上传较短的简历（最多 100,000 个字符）。"],
    ["This PDF has too little selectable text and may be a scan. Use OCR or export a text-based PDF; automatic OCR is not available here.","PDF ini mengandungi terlalu sedikit teks yang boleh dipilih dan mungkin imbasan. Gunakan OCR atau eksport PDF berasaskan teks; OCR automatik tidak tersedia di sini.","此 PDF 可选取的文字过少，可能是扫描件。请先进行文字识别或导出文字型 PDF；此处不提供自动文字识别。"],
    ["This PDF is password-protected or encrypted. Upload an unencrypted copy that you are authorised to use.","PDF ini dilindungi kata laluan atau disulitkan. Muat naik salinan tanpa penyulitan yang anda dibenarkan gunakan.","此 PDF 受密码保护或已加密，请上传你有权使用的未加密副本。"],
    ["This discovery listing has no connected employer account. Your CV has not been sent.","Penyenaraian penemuan ini tiada akaun majikan yang disambungkan. CV anda tidak dihantar.","此职位信息未关联雇主账号，你的简历尚未发送。"],
    ["This file is not a valid PDF. Renaming a file to .pdf does not convert it.","Fail ini bukan PDF yang sah. Menukar nama fail kepada .pdf tidak menukarkannya kepada PDF.","此文件不是有效的 PDF，将扩展名改成 .pdf 并不会转换文件格式。"],
    ["This vacancy is closed to new applications.","Kekosongan jawatan ini tidak lagi menerima permohonan baharu.","此职位已停止接受新申请。"],
    ["Training approved.","Latihan diluluskan.","培训已获批准。"],
    ["Unknown CV resource.","Sumber CV tidak diketahui.","未知的简历内容。"],
    ["Upload and review your PDF CV before applying.","Muat naik dan semak CV PDF anda sebelum memohon.","申请前请先上传并审核 PDF 简历。"],
    ["Vacancy created.","Kekosongan jawatan telah dibuat.","职位已创建。"],
    ["Years of experience must be a number from 0 to 80, or empty.","Tahun pengalaman mesti nombor antara 0 hingga 80, atau dibiarkan kosong.","经验年限须为 0–80 的数字，也可以留空。"],
    ["Years of relevant experience must be between 0 and 40.","Tahun pengalaman berkaitan mestilah antara 0 hingga 40.","相关经验年限须为 0–40 年。"],
    ["Your PDF, extracted details, applications and access history were deleted. Earlier downloaded copies cannot be recalled.","PDF, butiran yang diekstrak, permohonan dan sejarah akses anda telah dipadam. Salinan yang dimuat turun sebelum ini tidak dapat ditarik balik.","已删除 PDF、提取资料、申请和访问记录；之前下载的副本无法收回。"],
    ["Suggestion unavailable.","Cadangan tidak tersedia.","推荐暂不可用。"],
    ["How Lumi Helps","Cara Lumi Membantu","Lumi 如何帮助你"],
    ["CV Privacy","Privasi CV","简历隐私"],
    ["Emerging Skills","Kemahiran Baharu","新兴技能"],
    ["Top Candidates","Calon Teratas","优秀候选人"],
    ["Submitted CVs","CV Dihantar","已提交的简历"],
    ["Team Skill Gaps","Jurang Kemahiran Pasukan","团队技能差距"],
    ["Retention Insights","Pandangan Pengekalan","人才留任洞察"],
    ["Nearby Jobs","Pekerjaan Berdekatan","附近职位"],
    ["CV Summary","Ringkasan CV","简历摘要"],
    ["View Reskilling Plan","Lihat Pelan Latihan Semula","查看技能提升计划"],
    ["Search Jobs & Companies","Cari Pekerjaan & Syarikat","搜索职位与企业"],
    ["Open Reskilling Plan","Buka Pelan Latihan Semula","打开技能提升计划"],
    ["Open Candidate Screening","Buka Saringan Calon","打开候选人筛选"],
    ["Create Job Vacancy","Cipta Kekosongan Jawatan","创建招聘职位"],
    ["Screen Candidates","Saring Calon","筛选候选人"],
    ["Approve Reskilling","Luluskan Latihan Semula","批准技能提升培训"],
    ["My PDF CV","CV PDF Saya","我的 PDF 简历"],
    ["Browse Matching Jobs","Layari Pekerjaan Sepadan","浏览匹配职位"],
    ["Upskill for Higher Pay","Tingkatkan Kemahiran untuk Gaji Lebih Tinggi","提升技能以争取更高薪资"],
    ["Upload CV","Muat Naik CV","上传简历"],
    ["View CV Profile","Lihat Profil CV","查看简历资料"],
    ["Explore Nearby Jobs","Terokai Pekerjaan Berdekatan","探索附近职位"],
    ["View Access Audit Log","Lihat Log Audit Akses","查看访问审计日志"],
    ["Manage Applications","Urus Permohonan","管理申请"],
    ["Upload PDF CV","Muat Naik CV PDF","上传 PDF 简历"],
    ["View Role Matches","Lihat Padanan Jawatan","查看岗位匹配"],
    ["Financial Reporting","Pelaporan Kewangan","财务报告"],
    ["Professional","Profesional","专业人员"],
    ["No hiring companies within","Tiada syarikat yang mengambil pekerja dalam lingkungan","此半径内没有招聘企业："],
    ["No CV-matched hiring companies within","Tiada syarikat yang sepadan dengan CV dalam lingkungan","此半径内没有与简历匹配的招聘企业："],
    ["No vacancies found within","Tiada kekosongan jawatan ditemui dalam lingkungan","此半径内没有找到职位："],
    ["No CV-matched vacancies found within","Tiada kekosongan jawatan yang sepadan dengan CV ditemui dalam lingkungan","此半径内没有找到与简历匹配的职位："],
    ["of","daripada","位于"],
    ["No original PDF shared","PDF asal tidak dikongsi","未分享原始 PDF"],
    ["Download sample PDF","Muat Turun PDF Sampel","下载示例 PDF"],
    ["Consider replacing passive phrasing","Pertimbangkan untuk menggantikan frasa pasif","建议替换被动措辞"],
    ["Your Location (Drag to reposition)","Lokasi Anda (Seret untuk mengubah kedudukan)","你的位置（拖动以调整）"],
    ["Quantified Impact & Action Verbs","Impak Terukur & Kata Kerja Tindakan","量化成果与行动动词"],
    ["Extended Lexicon Signals & Telemetry","Isyarat Leksikon Lanjutan & Telemetri","扩展词库信号与文本指标"],
    ["Apply & choose access →","Mohon & pilih akses →","申请并选择访问权限 →"],
    ["Qualification & Arrangement","Kelayakan & Susunan","资历与工作安排"],
    ["and consented to share their CV below.","dan telah bersetuju untuk berkongsi CV mereka di bawah.","并同意分享以下简历内容。"],
  );
  rows.push(
    ["Career Pathway & Progression Matrix", "Matriks Laluan & Kemajuan Kerjaya", "职业路径与晋升矩阵"],
    ["Career pathways", "Laluan kerjaya", "职业发展路径"],
    ["O*NET & MASCO Standard", "Piawaian O*NET & MASCO", "O*NET 与 MASCO 标准"],
    ["Interactive career ladder mapping vertical advancements and lateral skill-transferable transitions.", "Pemetaan tangga kerjaya interaktif yang menunjukkan kemajuan menegak dan peralihan mendatar melalui pemindahan kemahiran.", "互动式职业阶梯图，展示纵向晋升及可迁移技能带来的横向转型。"],
    ["Current Role:", "Jawatan Semasa:", "当前职位："],
    ["Vertical Career Advancements", "Kemajuan Kerjaya Menegak", "纵向职业晋升"],
    ["Promotion Ladder", "Tangga Kenaikan Pangkat", "晋升阶梯"],
    ["Lateral Mobility & Transition", "Mobiliti & Peralihan Mendatar", "横向流动与转型"],
    ["Skill Transfer", "Pemindahan Kemahiran", "技能迁移"],
    ["Job Zone", "Zon Pekerjaan", "职业区域"],
    ["Zone", "Zon", "区域"],
    ["Match", "Padanan", "匹配"],
    ["Senior specialist roles aligned with your field.", "Jawatan pakar kanan yang sejajar dengan bidang anda.", "与你所在领域相符的高级专业职位。"],
    ["Adjacent roles sharing strong skill overlap.", "Jawatan bersebelahan yang mempunyai pertindihan kemahiran yang tinggi.", "技能高度重叠的相邻职位。"],
    ["Junior Financial Auditor", "Juruaudit Kewangan Junior", "初级财务审计师"],
    ["Logistics Analysts", "Penganalisis Logistik", "物流分析师"],
    ["Regulatory Affairs Specialists", "Pakar Hal Ehwal Kawal Selia", "法规事务专员"],
    ["Financial Examiners", "Pemeriksa Kewangan", "金融审查员"],
    ["Budget Analysts", "Penganalisis Belanjawan", "预算分析师"],
    ["Insurance Underwriters", "Penilai Risiko Insurans", "保险核保员"],
    ["Risk Management Specialists", "Pakar Pengurusan Risiko", "风险管理专员"],
    ["Financial Analysts", "Penganalisis Kewangan", "财务分析师"],
    ["Compensation and Benefits Managers", "Pengurus Pampasan dan Faedah", "薪酬与福利经理"],
    ["Market Research Analysts and Marketing Specialists", "Penganalisis Penyelidikan Pasaran dan Pakar Pemasaran", "市场研究分析师和营销专员"],
    ["Accountants", "Akauntan", "会计师"],
    ["Auditors", "Juruaudit", "审计员"],
    ["A topic to explore beyond your current career path.", "Topik untuk diterokai di luar laluan kerjaya semasa anda.", "探索当前职业路径以外的主题。"],
  );
  rows.push(
    ["Admin Backdesk · CareerLens AI", "Panel Pentadbir · CareerLens AI", "管理员后台 · CareerLens AI"],
    ["Backdesk Admin", "Pentadbir Panel", "后台管理员"],
    ["SDC Hackathon 2026 · Platform Governance & Data Operations", "SDC Hackathon 2026 · Tadbir Urus Platform & Operasi Data", "SDC 黑客松 2026 · 平台治理与数据运营"],
    ["RunPod & Cloudflare Tunnel Active", "RunPod & Terowong Cloudflare Aktif", "RunPod 与 Cloudflare 隧道运行中"],
    ["System Administrator", "Pentadbir Sistem", "系统管理员"],
    ["Total Talents", "Jumlah Pencari Kerja", "求职者总数"],
    ["Job Seekers", "Pencari Kerja", "求职者"],
    ["Employer Accounts", "Akaun Majikan", "雇主账号"],
    ["HR & Companies", "Sumber Manusia & Syarikat", "人力资源与企业"],
    ["Total Vacancies", "Jumlah Kekosongan Jawatan", "职位空缺总数"],
    ["JobStreet + Portals", "JobStreet + Portal Pekerjaan", "JobStreet 与招聘平台"],
    ["Live AI Nodes", "Nod AI Aktif", "在线 AI 节点"],
    ["Unsloth QLoRA + CV", "Unsloth QLoRA + Pemprosesan CV", "Unsloth QLoRA + 简历处理"],
    ["Help Desk Inquiries", "Pertanyaan Meja Bantuan", "帮助台咨询"],
    ["— Open", "— Terbuka", "— 待处理"],
    ["Resolved Tickets", "Tiket Diselesaikan", "已解决工单"],
    ["100% SLA Target", "Sasaran SLA 100%", "100% 服务水平协议目标"],
    ["Help Desk & Feedback Tickets", "Tiket Meja Bantuan & Maklum Balas", "帮助台与反馈工单"],
    ["Registered Accounts & Users", "Akaun & Pengguna Berdaftar", "注册账号与用户"],
    ["AI Model Health & Cloudflare Tunnel", "Kesihatan Model AI & Terowong Cloudflare", "AI 模型健康与 Cloudflare 隧道"],
    ["Refresh Data", "Muat Semula Data", "刷新数据"],
    ["Filter Status:", "Tapis Status:", "按状态筛选："],
    ["Open Only", "Terbuka Sahaja", "仅待处理"],
    ["Resolved", "Diselesaikan", "已解决"],
    ["Open", "Terbuka", "待处理"],
    ["● Open", "● Terbuka", "● 待处理"],
    ["In Progress", "Sedang Diproses", "处理中"],
    ["Closed", "Ditutup", "已关闭"],
    ["Click on any ticket to update its status or add admin notes.", "Klik mana-mana tiket untuk mengemas kini status atau menambah catatan pentadbir.", "点击任意工单以更新状态或添加管理员备注。"],
    ["Ticket", "Tiket", "工单"],
    ["Ticket #", "Tiket #", "工单 #"],
    ["Category", "Kategori", "类别"],
    ["Subject & Message", "Subjek & Mesej", "主题与消息"],
    ["Status", "Status Semasa", "状态"],
    ["Actions", "Tindakan", "操作"],
    ["Loading help desk feedback inquiries...", "Memuatkan pertanyaan dan maklum balas meja bantuan...", "正在加载帮助台反馈咨询……"],
    ["No help desk tickets found.", "Tiada tiket meja bantuan ditemui.", "未找到帮助台工单。"],
    ["Manage →", "Urus →", "管理 →"],
    ["Showing all accounts", "Memaparkan semua akaun", "显示所有账号"],
    ["Account UID", "ID Unik Akaun", "账号唯一编号"],
    ["Professional Headline", "Tajuk Profesional", "职业简介"],
    ["Organization / Location", "Organisasi / Lokasi", "机构／地点"],
    ["Registered Date", "Tarikh Pendaftaran", "注册日期"],
    ["Loading registered accounts...", "Memuatkan akaun berdaftar...", "正在加载注册账号……"],
    ["Search by name, email, or UID...", "Cari mengikut nama, e-mel atau ID unik...", "按姓名、邮箱或唯一编号搜索……"],
    ["No matching accounts.", "Tiada akaun yang sepadan.", "没有匹配的账号。"],
    ["Admin", "Pentadbir", "管理员"],
    ["Employer", "Majikan", "雇主"],
    ["Talent", "Pencari Kerja", "求职者"],
    ["Lumi Chat AI (RunPod Worker)", "AI Sembang Lumi (Pekerja RunPod)", "Lumi 聊天 AI（RunPod 工作节点）"],
    ["Model Architecture:", "Seni Bina Model:", "模型架构："],
    ["Target Hardware:", "Perkakasan Sasaran:", "目标硬件："],
    ["Port:", "Nombor Port:", "端口："],
    ["Endpoint:", "Titik Akhir:", "接口端点："],
    ["Training Pipeline:", "Aliran Latihan:", "训练流程："],
    ["SDC Hackathon Domain 1 Custom Dataset (2,400+ career QA pairs)", "Set Data Tersuai Domain 1 SDC Hackathon (2,400+ pasangan soal jawab kerjaya)", "SDC 黑客松领域 1 自定义数据集（2,400 多组职业问答）"],
    ["CV Intelligence & Extraction Engine", "Enjin Kecerdasan & Pengekstrakan CV", "简历智能与提取引擎"],
    ["Engine:", "Enjin:", "引擎："],
    ["PyMuPDF Local Extractor + Rule-based Confidence Scoring", "Pengekstrak Setempat PyMuPDF + Pemarkahan Keyakinan Berasaskan Peraturan", "PyMuPDF 本地提取器 + 基于规则的置信度评分"],
    ["Jobstreet Search Index:", "Indeks Carian Jobstreet:", "Jobstreet 搜索索引："],
    ["69,345 pre-indexed Malaysian postings", "69,345 iklan pekerjaan Malaysia yang telah diindeks", "69,345 条已预索引的马来西亚招聘信息"],
    ["Geospatial Engine:", "Enjin Geospatial:", "地理空间引擎："],
    ["Esri ArcGIS World Street Maps (Zero API Block, High Precision)", "Peta Jalan Dunia Esri ArcGIS (Tanpa Sekatan API, Ketepatan Tinggi)", "Esri ArcGIS 世界街道地图（无 API 阻断、高精度）"],
    ["Public Exposure:", "Akses Awam:", "公网访问："],
    ["Cloudflare Tunnel via", "Terowong Cloudflare melalui", "Cloudflare 隧道，通过"],
    ["From:", "Daripada:", "来自："],
    ["Update Status:", "Kemas Kini Status:", "更新状态："],
    ["Admin Resolution Notes:", "Catatan Penyelesaian Pentadbir:", "管理员处理备注："],
    ["Add resolution details or response sent to user...", "Tambah butiran penyelesaian atau respons yang dihantar kepada pengguna...", "添加处理详情或已发送给用户的回复……"],
    ["Save Update →", "Simpan Kemas Kini →", "保存更新 →"],
    ["Status updated!", "Status dikemas kini!", "状态已更新！"],
    ["Update failed", "Kemas kini gagal", "更新失败"],
    ["Failed to save update.", "Gagal menyimpan kemas kini.", "无法保存更新。"],
    ["Feedback ticket not found.", "Tiket maklum balas tidak ditemui.", "未找到反馈工单。"],
    ["Normal", "Biasa", "普通"],
    ["High", "Tinggi", "高"],
    ["Low", "Rendah", "低"],
    ["General Feedback", "Maklum Balas Umum", "一般反馈"],
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
    const openTickets = text.match(/^(\d+) Open$/);
    if (openTickets) return i === 2 ? `${openTickets[1]} 条待处理` : `${openTickets[1]} Terbuka`;
    const accountCount = text.match(/^Showing (\d+) accounts$/);
    if (accountCount) return i === 2 ? `显示 ${accountCount[1]} 个账号` : `Memaparkan ${accountCount[1]} akaun`;
    const ticketNumber = text.match(/^Ticket #(\d+)$/);
    if (ticketNumber) return i === 2 ? `工单 #${ticketNumber[1]}` : `Tiket #${ticketNumber[1]}`;
    const ticketUpdate = text.match(/^Feedback ticket #(\d+) status updated to (.+)\.$/);
    if (ticketUpdate) return i === 2
      ? `反馈工单 #${ticketUpdate[1]} 的状态已更新为${translate(ticketUpdate[2],language)}。`
      : `Status tiket maklum balas #${ticketUpdate[1]} dikemas kini kepada ${translate(ticketUpdate[2],language)}.`;
    const mapboxStatus = text.match(/^✓ Mapbox token configured \((.+)\.\.\.\)$/);
    if (mapboxStatus) return i === 2
      ? `✓ 已配置 Mapbox 令牌（${mapboxStatus[1]}...）`
      : `✓ Token Mapbox telah dikonfigurasikan (${mapboxStatus[1]}...)`;
    if (/^Matches your interests and saved learning: .+\.$/.test(text)) return i === 2
      ? '符合你的兴趣与已保存的学习内容。'
      : 'Sejajar dengan minat dan pembelajaran yang anda simpan.';
    const numberedZone = text.match(/^(Job Zone|Zone) (\d+)$/);
    if (numberedZone) return i === 2
      ? `${numberedZone[1] === 'Job Zone' ? '职业区域' : '区域'} ${numberedZone[2]}`
      : `${numberedZone[1] === 'Job Zone' ? 'Zon Pekerjaan' : 'Zon'} ${numberedZone[2]}`;
    const matchRank = text.match(/^Match #(\d+)$/);
    if (matchRank) return i === 2 ? `匹配 #${matchRank[1]}` : `Padanan #${matchRank[1]}`;
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
