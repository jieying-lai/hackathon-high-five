# Company Insights 数据交接

## 已完成的界面

入口：Talent Portal → Explore Careers → Company Insights。
公司列表直接读取 Nearby Jobs & Map 的 companiesList（来自 /api/jobs 的 dots），保留同一个地点 ID、名称、行业、距离和职位。
搜索、行业筛选、公司详情、福利分类、照片、评价草稿、返回地图及查看职位已接入。
本版本评价只按当前账号和公司地点保存在当前浏览器 localStorage。没有公共发布、跨设备同步或真实评分统计，也没有接入 Google / Glassdoor。

## 需要提供什么

优先为地图中已有的公司补资料。不要生成另一个不相关的公司列表。
当前 ID 是地图地点键（例如 c 加公司索引及坐标，或 e_ 加职位 ID），不是工商注册号，重建职位数据后可能变化。生产阶段应建立持久 company_id / location_id，并保存旧地图 ID 的对应表；不要把相似名称自动认定为同一公司。
现有地图部分坐标经过偏移，仅用于附近职位展示，不可当作已验证的办公室地址。

| 字段 | 要求 |
|---|---|
| map_company_id | 与当前 /api/jobs → dots[].id 完全一致 |
| company_name / location | 与地图中的公司、地点对应，用于人工核对 |
| description | 约 80–150 个英文单词；依据来源概括，不编造规模、业务或奖项 |
| website_url | 核实过的官方 HTTPS 网站，不能用搜索结果页替代 |
| benefits.health | 医疗、保险、身心健康福利；没有资料就留空 |
| benefits.leave | 假期、弹性工作；应说明适用地区和岗位 |
| benefits.learning | 培训、导师、学习津贴等 |
| benefits.financial | 奖金、津贴等；不要从别家公司推断 |
| photos | 图片 URL、说明、来源页面以及使用授权记录 |
| source_url | 支持公司简介与福利的官方来源；可优先整理为单一公司 careers 页面 |
| checked_at | 人工核查日期 YYYY-MM-DD |

可先交 CSV + photos 文件夹，再转换为 JSON。界面使用 src/static/data/company-profiles.json，键为 map_company_id，值遵循下面格式（示意，不是真实公司数据）：

```json
{
  "EXACT_MAP_COMPANY_ID": {
    "company_name": "Exact company name from map",
    "location": "Exact location from map",
    "description": "",
    "website_url": "",
    "benefits": {"health": "", "leave": "", "learning": "", "financial": ""},
    "photos": [],
    "source_url": "",
    "checked_at": ""
  }
}
```

照片元素格式：`{"url":"https://…","caption":"…","source_url":"https://…"}`。
只使用已获授权的图片链接或项目静态资源的完整 URL，不随意复制评价平台图片。

## RunPod 应做什么

这个页面不需要训练模型。可以用 RunPod 对你有权使用的公司资料做结构化提取、去重和简介整理。
提取要求：只输出来源明确支持的事实；缺失值用空字符串或空数组；保留 map_company_id、来源 URL 和核查日期；不要生成员工评价、星级或公司福利。
人工确认公司与办公室匹配后，才导入 JSON。若每项福利来自不同页面，交接时另外保留逐字段来源表，后续扩展界面来源显示。

## 真实评价上线前的下一步

使用服务器数据库保存 review_id、company_id/location_id、author_user_id、relationship、rating、title、pros、cons、created_at、moderation_status。
需要登录校验、后端长度和评分验证、访问权限、编辑/删除自己的评价、举报与审核流程。平均分只统计已发布评价，面试体验与员工体验分开。
公开匿名与内部账号归属是不同概念；不能承诺目前草稿系统是匿名公共评价系统。
外部评分（如 Google）单独标注来源和地点，不与 CareerLens 用户评价混算；其接入需单独完成 API 配置及来源要求。

## 范围说明

当前修改仅在本地项目中，尚未发布到线上。新界面文案目前为英文。没有补造缺失的公司事实、照片、薪资或评分。
