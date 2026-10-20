# Member 3 前端交付与验证说明

## 1. 项目与启动

项目：`C:\Users\Hui Shan\Documents\Codex\hackathon-high-five`。

现有技术栈为 Flask / Jinja HTML / 原生 JavaScript / Tailwind CDN / SQLite，没有 React 或前端打包步骤。继续复用原有视觉组件、JSON 课程与岗位目录、账号鉴权与 HR API。

在项目目录的 PowerShell 中运行：

```powershell
.\.venv\Scripts\python.exe src/main.py
```

浏览器打开 `http://127.0.0.1:5000`。若没有可用虚拟环境：

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe src/main.py
```

首页已有 Talent / HR 演示登录。种子账号仅在数据库为空时创建：

| 门户 | 邮箱 | 演示密码 |
| --- | --- | --- |
| Talent | aisha.demo@careerlens.my | CareerLens@2026 |
| HR | hr.demo@nexussme.my | CareerLens@2026 |

不要删除已有数据库来重置演示账号。

## 2. 功能交付范围

| 功能 | 当前实现 |
| --- | --- |
| Intake Form | 复用个人资料与问卷；补齐资料字段 label 关联；保存时也收取尚未按 Enter 的技能 |
| Skill Chips | 复用新增、去重、删除与技能建议 |
| Trend Radar | 在原有增长率／风险条形图旁添加 SVG 四轴雷达、可访问标题与数值描述；无需图表 CDN |
| What-If Slider | 两档原生滑块，支持键盘，对应真实 API 的 moderate / fast；不虚构连续预测 |
| Match Breakdown | 复用匹配卡片；补上情景／98 分上限的净调整项，分项可与总分核对 |
| Ordered Pathway | 复用有序课程时间线、目录课程链接、总课时与 SDG 标记 |
| HR Heatmap | 复用角色隔离的 API、部门筛选、等级数字与颜色；明确全团队摘要和筛选行的区别，增加失败提示 |
| Fairness Badge | 可展开的公平性检查徽章；从分析响应显示说明；移除“已完成审计”的过度声明 |
| EN / BM / 中文 | 登录页、两门户提供语言选择并保存偏好；覆盖核心导航、表单、图表、匹配、HR 表头及说明；动态新增节点也会翻译 |

语言切换目前是**核心界面本地化**。现有目录中的岗位、技能、课程、SDG 名称与说明，以及两门户预设文案均已补齐显示翻译；API 值、人名、品牌、技术名、联网研究标题和用户填写内容保持原样。登录长文案与未来新增的后端自由文本需继续维护翻译。不是全站内容的完整人工翻译。

## 3. 数据与后端配合

- 匹配、情景调整与课程路径由现有 Python 规则引擎计算；不是 RunPod 模型输出。
- 趋势百分比是代码中的演示基准，切换情景使用现有倍率；ArXiv 成功联网仅表示论文标题获取成功，不能证明增长率来自实时就业市场。
- 离线论文示例已改为明确的 Demo 标记，移除了未经核实的具体发布日期和虚构快照时间。
- HR 员工与候选人来自合成 JSON 数据。账号／职位／培训分配使用 SQLite；现有 HR 决策和问卷答案保存在浏览器，未新增跨设备同步。
- 公平性检查目前证明评分代码不读取受保护属性；不等同于统计公平性审计、无偏保证或第三方认证。后端还需要群体指标、样本量、阈值和审计日期。
- 连续 What-If、真实市场时间序列、生产 HRIS 数据、RunPod 推理、完整多语言响应、个人资料持久化需要后端继续接入。
- `verified_courses.json` 是现有课程目录，本次未联网重新认证课程有效性与费用。
- Tailwind 和字体仍沿用原项目 CDN，完整离线录制应先本地化这些资源。

## 4. 已完成验证与尚未验证

2026-10-20：11 项 Python 测试通过（3 项原有 + 8 项新增），涵盖分数分解、两种情景、受保护属性不改变推荐、课程路径、匿名／跨角色访问控制和热力图数据结构。Python 编译和前端脚本语法检查通过。本地 Flask 服务成功启动。

浏览器验证**未完成**：自动化 Edge 启动失败；内置浏览器访问 localhost 超时。尚未取得有效 UI 截图，不能将脚本中的断言视为已经通过。请运行以下检查或按下一节人工验收。

```powershell
.\.venv\Scripts\python.exe -m unittest discover tests
# 另一个终端保持 Flask 运行，以下仅用于 UI 验收：
npm install --no-save --package-lock=false playwright
node scripts/capture-ui.cjs
```

脚本使用已安装的 Microsoft Edge、演示账号和真实 API；桌面视口 1600×1100、2 倍像素，移动视口 390×844。检查成功后，8 张 PNG 输出到 `docs/screenshots/`，结果写入 `docs/browser-validation.json`。若端口不同，先设置 `$env:CAREERLENS_URL='http://127.0.0.1:5057'`。

脚本会添加并删除一个临时技能、切换情景／语言、筛选部门，不创建职位或批准培训。截图为完整页面，页面较长时高度大于视口。失败退出不能视为验收通过。

## 5. 人工验收顺序

1. Talent 演示登录 → Profile & Skills → 添加技能并按 Enter → 删除芯片 → 在未按 Enter 时直接保存，确认该技能仍被收取。
2. 切换中文 → 导航和资料标签变为中文，输入内容保持原样；刷新确认语言偏好保留；切回 EN。
3. AI Radar → 检查四轴雷达和条形图 → 拖动滑块到 Fast → 等待加载完成 → 对比增长率、风险与岗位分数；键盘左右键也可切换。
4. Role Matches → 展开公平性徽章 → 核对核心／迁移／行业／模式／情景调整之和等于匹配总分。
5. Reskilling Plan → 更换目标岗位 → 检查课程、顺序和总课时更新。
6. HR 演示登录 → Skills Heatmap → 选择部门 → 行数按部门变化、摘要仍明确表示全团队；切换 BM。
7. 浏览器设备模式设为 390px → 检查顶部导航、滑块和表格局部横向滚动。

截图清单：01 中文资料、02 Moderate 雷达、03 Fast 雷达、04 匹配卡片、05 时间线、06 移动雷达、07 HR 热力图、08 BM 部门视图。

系统架构见 `system-architecture.svg` / `.png`，演示脚本见 `PITCH_DEMO.zh-CN.md`。

## 问卷翻译修正（2026-10-20）

修复编号前缀导致题目无法命中词条、select 标签被跳过和动态问题未使用翻译模板的问题。下拉选项显式保留英文 value，只切换显示文字；不重建表单、不翻译用户答案。新增 `questionnaire-i18n.js`，覆盖中文／BM、全部实际通用题、三位演示人物的后端验证问题、进度和自定义技能名称，10 项翻译回归测试通过。运行：`node --test tests/questionnaire-i18n.test.cjs`。浏览器视觉验收仍未完成。

## 全门户本地化复查（2026-10-20）

补齐 SDG 护照标题、岗位、匹配度／课时／课程数量、SDG 说明、技能、免责声明与打印按钮。新增 `portal-i18n.js`，覆盖目录内容、学习阶段／难度／费用、趋势来源和 HR 评分／培训文案；翻译 option 前固定原始 value，避免筛选值及 HR 决策被翻译破坏。HR 自动生成的建议问题支持切换语言，已手改的问题不覆盖。

新增真实模板 DOM 渲染回归 `tests/portal-i18n.dom.mjs`：隔离测试数据库，读取真实后端结果，覆盖 3 人物 × 2 情景 × 4 岗位 × 5 次语言切换；扫描两门户残留英文，仅允许人名、品牌、技术名与编号；检查问卷和 HR 编辑内容保留。10 项问卷测试、11 项 Python 测试和两门户 DOM 检查均通过。此检查不代替真实浏览器布局验收。

复现（安装依赖仅用于测试）：

```powershell
npm install --no-save --package-lock=false linkedom
node tests/portal-i18n.dom.mjs
node --test tests/questionnaire-i18n.test.cjs
```

DOM 检查结果写入 `work/locale-validation.json`。

## 首页与编号修正（2026-10-20）

六个求职者功能页签现按顺序使用唯一编号 01–06（资料、问卷、雷达、匹配、学习计划、护照）。首页新增 `auth-i18n.js`，覆盖主标题、介绍、入口、账号类型、两类注册字段、占位提示、密码校验、后端登录／注册错误、隐私条款及演示单点登录窗口。品牌、人名、邮箱、公司名称和用户输入保留。三页 DOM 回归现包含首页／登录／两类注册／条款／SSO／动态校验及错误状态的中／BM／英切换，检查字段值保留和编号唯一性，全部通过；原有 11 项 Python 与 10 项问卷回归也通过。实际浏览器视觉验收未执行。
