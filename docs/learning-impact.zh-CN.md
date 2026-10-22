# 学习徽章与爱心扑满

完成 10、20、30、40、50 门独立课程，各获得一枚徽章，每枚对应 USD 0.10 公司承诺。五枚合计最多 USD 0.50 / 账号 / 活动。
同一账号、活动和课程链接只累计一次；重复同步、刷新、重复标记不会重复发徽章。已获得徽章永久保留。
完成状态由用户自行记录，不是课程提供方认证。课程链接去掉查询参数与 fragment 后保存哈希，不保存 CV。

你提供的徽章图原样保存为 `src/static/illustrations/learning-milestone-badges.png`，用 CSS 分别展示。
扑满区显示个人贡献、公司累计承诺、待汇出、已登记汇出、接收机构、下次计划日期和凭证。
记录保存在网站 `CAREERLENS_DB_PATH` 数据库；全站合计只覆盖使用同一服务器数据库的账号。
不同电脑独立运行项目时不会自动互通账本。数据库事务及复合主键用于去重。

## 演示与实际捐款

默认沿用 `CAREERLENS_DEMO=1`，使用独立的演示活动 `learning-for-food-demo-v2`，页面明确显示演示承诺。USD 1 徽章规则的旧账本保留在 v1；完成课程会在新活动中重新同步，按 USD 0.10 / 徽章计算。
用户确认以 WFP 为接收机构，官方入口使用去掉广告追踪参数的 https://www.wfp.org/support-us/stories/donate-now 。
演示活动的全站共同扑满有固定 USD 5 初始余额，并注明来源。它不属于任何个人贡献，不虚构账号或徽章，刷新或新用户登录不会重复累加。
之后所有账号解锁徽章的承诺继续累加。正式模式初始额为零；未提供凭证时已汇出金额仍为零。
页面显示真实注册账号数和实际获得徽章的贡献者数，不把演示初始额伪装成用户获得徽章的记录。
本功能没有支付 API、自动转账或定时汇款服务。课程完成只新增承诺；没有凭证不会显示已经汇出。
真实运营设置 `CAREERLENS_DEMO=0`，使用独立正式活动 `learning-for-food-v2`。
可用 `CAREERLENS_IMPACT_CAMPAIGN` 更换活动 ID，不应混用演示和真实活动。
正式运营需由公司决定如何审核自报课程完成记录；当前没有外部课程完成认证或支付验证。

## 公布机构和日期

接收机构默认设为 WFP；后续可用环境变量修改。汇款日期仍待确认（以下日期只是示例，未设置）：

```dotenv
CAREERLENS_IMPACT_RECIPIENT=World Food Programme (WFP)
CAREERLENS_IMPACT_PAYOUT_DAY=5
```

支持每月 1–28 日，按马来西亚时区计算下次计划日期。显示计划不代表自动执行付款。
默认日期为空，页面显示“待公布”。修改后重启网站。

## 登记已完成的汇款

公司通过机构官方渠道实际汇款后，在与网站相同的数据库环境中执行：

```bash
python scripts/record_learning_donation.py --amount-usd 10 --recipient "World Food Programme (WFP)" --receipt-url "https://your-company.example/receipts/receipt-001.pdf" --paid-at 2026-11-05
```

这是未执行的示例；使用真实金额、机构、日期和已遮去私人资料的公开 HTTPS 凭证。
命令只登记，不付款。金额必须是 USD 0.10 的正整数倍，不能超过未分配承诺余额；演示模式拒绝登记真实汇款。
同一活动的凭证 URL 不能重复登记，凭证与对应承诺分配在同一事务提交。

## 官方候选渠道（2026-10-21 查阅）

- WFP: https://www.wfp.org/support-us — 应急粮食援助及官方捐款渠道。
- Action Against Hunger: https://www.actionagainsthunger.org/take-action/donate/support-lifesaving-humanitarian-assistance/ — 抗饥饿和营养援助，可单次或每月捐款。

推荐优先考虑 WFP。页面仅列出候选，不宣称合作。本次没有发送消息、注册捐款或发起转账。
代码尚未运行自动化测试或浏览器端到端测试；新增后端接口需要重启网站。
