/* Landing page, both registration roles, terms, SSO and authentication feedback. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  else root.authI18n=api;
})(typeof window==='undefined'?globalThis:window,function(){
  const rows=`
Company name must contain at least 2 characters, excluding leading and trailing spaces.|Nama syarikat mesti mengandungi sekurang-kurangnya 2 aksara, tidak termasuk ruang di awal dan akhir.|公司名称至少需要 2 个字符，不计首尾空格。
Select a district / area|Pilih daerah / kawasan|选择地区／县区
W.P. Labuan|Wilayah Persekutuan Labuan|纳闽联邦直辖区
State / federal territory|Negeri / wilayah persekutuan|州属／联邦直辖区
District / area|Daerah / kawasan|地区／县区
CareerLens AI — Workforce Intelligence & Reskilling|CareerLens AI — Kecerdasan Tenaga Kerja & Latihan Semula|CareerLens AI — 职场洞察与技能提升
AI Workforce Navigation & Reskilling Platform|Platform Panduan Kerjaya dan Latihan Semula Tenaga Kerja AI|AI 职业导航与技能提升平台
Future-Ready Workforce & Reskilling|Tenaga Kerja Sedia Masa Depan & Latihan Semula|面向未来的职场与技能提升
Sign In|Log Masuk|登录
Create Account|Cipta Akaun|创建账号
AI workforce navigation|Panduan tenaga kerja AI|AI 职业导航
Find your place in the|Cari tempat anda dalam|找到你在
AI era|era AI|AI 时代的位置
Match today's skills to tomorrow's roles, with transparent scores, verified courses and a clear path.|Padankan kemahiran hari ini dengan jawatan masa depan, melalui skor telus, kursus dalam katalog dan laluan yang jelas.|将今天的技能与未来的岗位匹配，通过透明评分、目录课程和清晰路径规划下一步。
Get Started|Mula Sekarang|开始探索
Get Started →|Mula Sekarang →|开始使用 →
CareerLens AI Radar|Radar AI CareerLens|CareerLens AI 职业雷达
Workforce Mobility & Matching Engine|Enjin Mobiliti dan Padanan Tenaga Kerja|人才流动与匹配引擎
● Active Engine|● Enjin Aktif|● 引擎运行中
Skill Extraction & Verification|Pengekstrakan dan Pengesahan Kemahiran|技能提取与核验
Instant CV parsing across 400+ national taxonomy skills|Penghuraian CV segera merangkumi lebih 400 kemahiran dalam taksonomi kebangsaan|即时解析简历，覆盖 400 多项国家职业分类技能
Future-Role Fit Scoring|Skor Kesepadanan Jawatan Masa Depan|未来职位匹配评分
Transparent fit breakdown powered by O*NET 29.0 & MASCO|Pecahan kesepadanan yang telus berasaskan O*NET 29.0 dan MASCO|基于 O*NET 29.0 与 MASCO 的透明匹配评分明细
Personalised Reskilling Plan|Pelan Latihan Semula Peribadi|个性化技能提升计划
live postings indexed|iklan jawatan aktif telah diindeks|条实时职位信息已编入索引
Explore Roles →|Teroka Jawatan →|探索职位 →
Forgot password?|Lupa kata laluan?|忘记密码？
Admin Backdesk|Panel Pentadbir|管理员后台
Admin|Pentadbir|管理员
System Admin · Statistics & Control|Pentadbir Sistem · Statistik & Kawalan|系统管理员 · 统计与控制
Reset Account Password|Tetapkan Semula Kata Laluan Akaun|重置账号密码
Verify your identity with a secure 6-digit code|Sahkan identiti anda menggunakan kod 6 digit yang selamat|使用安全的 6 位验证码确认身份
Registered Email Address|Alamat E-mel Berdaftar|注册邮箱
Send Verification Code →|Hantar Kod Pengesahan →|发送验证码 →
6-Digit Verification Code|Kod Pengesahan 6 Digit|6 位验证码
New Password (min 8 chars, A-Z, 0-9, symbol)|Kata Laluan Baharu (min. 8 aksara, A-Z, 0-9, simbol)|新密码（至少 8 个字符，含 A-Z、0-9 和符号）
Confirm Password Reset →|Sahkan Tetapan Semula Kata Laluan →|确认重置密码 →
use AI vs trained (MY)|guna AI berbanding telah dilatih (MY)|使用 AI／接受过培训（马来西亚）
workers to reskill|pekerja memerlukan latihan semula|需要提升技能的员工
impact alignment|penjajaran impak|影响目标对齐
For individuals|Untuk individu|面向个人
AI trend radar|Radar trend AI|AI 趋势雷达
Role matching|Padanan jawatan|岗位匹配
Reskilling plan|Pelan latihan semula|技能提升计划
SDG passport|Pasport SDG|SDG 职业护照
Join as Talent →|Sertai sebagai Bakat →|以求职者身份加入 →
For HR & companies|Untuk HR & syarikat|面向 HR 与企业
Fair candidate screening|Saringan calon yang adil|公平的候选人筛选
Skills-gap heatmap|Peta haba jurang kemahiran|技能差距热力图
Join as Employer →|Sertai sebagai Majikan →|以雇主身份加入 →
Account|Akaun|账号
Sign in, or create a Talent / Employer account|Log masuk atau cipta akaun Bakat / Majikan|登录，或创建求职者／雇主账号
Register|Daftar|注册
Email address|Alamat e-mel|电子邮箱
Password|Kata laluan|密码
Your password|Kata laluan anda|请输入密码
OR|ATAU|或
Quick demo access|Akses demo pantas|快速体验演示
Financial Auditor|Juruaudit Kewangan|财务审计师
1 · Account type *|1 · Jenis akaun *|1 · 账号类型 *
Talent|Bakat|求职者
HR / Company|HR / Syarikat|HR／企业
Career matching and reskilling.|Padanan kerjaya dan latihan semula.|岗位匹配与技能提升。
Vacancies, screening and workforce heatmap.|Kekosongan, saringan dan peta haba tenaga kerja.|招聘职位、候选人筛选与团队技能热力图。
Full name *|Nama penuh *|姓名 *
Email *|E-mel *|电子邮箱 *
Password *|Kata laluan *|密码 *
Confirm password *|Sahkan kata laluan *|确认密码 *
At least 2 characters.|Sekurang-kurangnya 2 aksara.|至少 2 个字符。
Valid, unregistered email.|E-mel sah yang belum didaftarkan.|请输入有效且未注册的邮箱。
Create a password|Cipta kata laluan|设置密码
New strong password|Kata laluan baharu yang kukuh|新的强密码
Re-enter password|Masukkan semula kata laluan|再次输入密码
Re-type new password|Taip semula kata laluan baharu|再次输入新密码
8+ characters|8+ aksara|至少 8 个字符
Uppercase|Huruf besar|大写字母
Lowercase|Huruf kecil|小写字母
Number|Nombor|数字
Special symbol|Simbol khas|特殊符号
Enter it twice.|Masukkan dua kali.|请再次输入密码。
Talent details|Maklumat bakat|求职者资料
Career status|Status kerjaya|职业状态
Career Switcher|Penukar Kerjaya|转行人士
Current / target role|Jawatan semasa / sasaran|当前／目标岗位
Company & HR details *|Maklumat Syarikat & HR *|企业与 HR 资料 *
Select or enter company *|Pilih atau masukkan syarikat *|选择或输入企业 *
+ Custom company…|+ Syarikat lain…|+ 自定义企业……
Company name *|Nama syarikat *|企业名称 *
Your job title *|Jawatan anda *|你的职位 *
Company size|Saiz syarikat|企业规模
1–10 (Micro SME)|1–10 (PKS Mikro)|1–10 人（微型企业）
11–50 (Small Enterprise)|11–50 (Perusahaan Kecil)|11–50 人（小型企业）
51–250 (Medium Enterprise)|51–250 (Perusahaan Sederhana)|51–250 人（中型企业）
250+ (Large Enterprise)|250+ (Perusahaan Besar)|250 人以上（大型企业）
Main focus|Fokus utama|主要关注方向
Workforce Reskilling|Latihan Semula Tenaga Kerja|员工技能提升
Talent Screening|Saringan Bakat|人才筛选
HRD Corp Training|Latihan HRD Corp|HRD Corp 培训
I agree to the|Saya bersetuju dengan|我同意
Privacy, PDPA & Fair-AI terms|Terma Privasi, PDPA & AI Adil|隐私、PDPA 与公平 AI 条款
Privacy, PDPA & Fair-AI|Privasi, PDPA & AI Adil|隐私、PDPA 与公平 AI
Unique ID & use:|ID unik & penggunaan:|唯一编号与用途：
each account gets a unique ID. Data is used only for career matching, screening and learning plans.|setiap akaun menerima ID unik. Data digunakan hanya untuk padanan kerjaya, saringan dan pelan pembelajaran.|每个账号拥有唯一编号。数据仅用于岗位匹配、候选人筛选和学习计划。
Security:|Keselamatan:|安全：
passwords are salted and hashed; demo data is synthetic.|kata laluan dilindungi dengan salt dan hash; data demo adalah sintetik.|密码经过加盐哈希处理；演示使用合成数据。
Fair & human-centred:|Adil & berpusatkan manusia:|公平与以人为本：
age, gender, ethnicity and similar attributes are never scored. People make the final decisions.|umur, jantina, etnik dan atribut serupa tidak diberi skor. Manusia membuat keputusan akhir.|年龄、性别、族裔等属性不参与评分。最终由人工决策。
Control:|Kawalan:|数据控制：
you can request access to, or deletion of, your data.|anda boleh meminta akses kepada atau pemadaman data anda.|你可以申请访问或删除自己的数据。
Accept|Terima|同意
Continue with SSO|Teruskan dengan SSO|通过单点登录继续
Demo SSO — pick an account to continue.|Demo SSO — pilih akaun untuk meneruskan.|单点登录演示：选择一个账号继续。
Employer|Majikan|雇主
Looks good|Nampak baik|填写正确
Valid format|Format sah|格式正确
Passwords match|Kata laluan sepadan|两次密码一致
Passwords do not match|Kata laluan tidak sepadan|两次密码不一致
Password must be at least 8 characters long.|Kata laluan mesti sekurang-kurangnya 8 aksara.|密码至少需要 8 个字符。
Password must contain at least one uppercase letter (A-Z).|Kata laluan mesti mengandungi huruf besar (A-Z).|密码至少需要一个大写字母（A-Z）。
Password must contain at least one lowercase letter (a-z).|Kata laluan mesti mengandungi huruf kecil (a-z).|密码至少需要一个小写字母（a-z）。
Password must contain at least one number (0-9).|Kata laluan mesti mengandungi nombor (0-9).|密码至少需要一个数字（0-9）。
Password must contain at least one special character (!@#$%^&*).|Kata laluan mesti mengandungi simbol khas (!@#$%^&*).|密码至少需要一个特殊字符（!@#$%^&*）。
Strong password.|Kata laluan kukuh.|密码强度足够。
Please enter your full name (at least 2 characters).|Sila masukkan nama penuh (sekurang-kurangnya 2 aksara).|请输入姓名（至少 2 个字符）。
Please enter a valid email address (e.g., name@domain.com).|Sila masukkan alamat e-mel yang sah (cth. name@domain.com).|请输入有效的邮箱（例如 name@domain.com）。
Passwords do not match. Please enter the same password twice.|Kata laluan tidak sepadan. Masukkan kata laluan yang sama dua kali.|两次密码不一致，请重新确认。
Please select a valid account role (Job Seeker or HR/Company).|Sila pilih jenis akaun yang sah (Pencari Kerja atau HR/Syarikat).|请选择有效账号类型（求职者或 HR／企业）。
HR / Company accounts must provide a valid Company Name.|Akaun HR / Syarikat mesti memberikan nama syarikat yang sah.|HR／企业账号必须填写有效的企业名称。
Please enter your HR / Management job title.|Sila masukkan jawatan HR / Pengurusan anda.|请输入你的人力资源／管理职位。
You must agree to the Privacy Data & PDPA Terms & Conditions to register.|Anda mesti bersetuju dengan Terma Privasi Data & PDPA untuk mendaftar.|注册前必须同意隐私数据与 PDPA 条款。
This email address is already registered. Please sign in or use a different email.|E-mel ini telah didaftarkan. Log masuk atau gunakan e-mel lain.|该邮箱已注册，请登录或使用其他邮箱。
Account registered successfully!|Akaun berjaya didaftarkan!|账号注册成功！
Please enter both your email address and password.|Sila masukkan e-mel dan kata laluan.|请输入邮箱和密码。
No account found with this email address. Please register first.|Tiada akaun untuk e-mel ini. Sila daftar dahulu.|未找到该邮箱对应的账号，请先注册。
Incorrect password. Please try again.|Kata laluan salah. Sila cuba lagi.|密码错误，请重试。
Signed in successfully!|Berjaya log masuk!|登录成功！
`.trim().split('\n').map(line=>line.split('|'));
  const dictionary=new Map(rows.map(row=>[row[0],row]));
  function translate(text,language){
    const i=language==='zh'?2:language==='ms'?1:0;
    if(!i)return text;
    if(dictionary.has(text))return dictionary.get(text)[i];
    const prefix=text.match(/^([✨👤🏢🌐🛡️✅❌⚪]+\s*)(.+)$/u);
    if(prefix)return prefix[1]+translate(prefix[2],language);
    const sso=text.match(/^Continue with (Google|Microsoft)$/);
    if(sso)return i===2?`使用 ${sso[1]} 继续`:`Teruskan dengan ${sso[1]}`;
    return text;
  }
  return {translate,rows};
});
