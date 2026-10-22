# 让 AI 自动判断课程的 SDG

入口：`scripts/auto_label_course_sdgs.py`。

模型读取课程标题、简介、技能、学习成果及类别，对照 17 项 SDG 的主题说明，自动输出零到三个目标、原文依据和解释。目标说明参考 [联合国 SDG 目标](https://sdgs.un.org/goals)；分类时也把 [ESCAP Data Explorer](https://dataexplorer.unescap.org/) 按目标列出的指标主题作为校准线索，例如 SDG 4 的 ICT 技能、SDG 12 的资源使用与回收、SDG 15 的森林与陆地生物多样性。脚本只内置各目标的代表性指标主题提示，不声称覆盖完整指标目录。

ESCAP 指标帮助界定每个目标涵盖的主题，但指标本身不能证明某门课程与该目标匹配。标签仍必须由课程自身标题、简介、技能、学习成果或类别中的直接证据支持；分类输出仍是 SDG 目标级，不会猜测具体指标或子目标编号。

产品要求每门课都有 SDG 标签：有可信课程主题标签时优先显示这些标签；没有可接受的主题标签时，推荐接口会加上 `SDG 4 · Quality Education · learning support`，并说明这是课程对终身学习的一般贡献，不是课程主题影响的断言。这样不会因为信息不足而随机给课程贴标签。

- 只产生 SDG 1–17 的目标级标签；未提供 169 项具体子目标定义，因此不让模型猜造 3.4、9.5 等编号。
- 不使用简历，也不加载面试问题适配器。
- 不因“它是一门课”就自动判 SDG 4，也不因“与技术有关”就自动判 SDG 9。
- 每个建议必须附一段能在课程字段中找到的原文；原文吻合只能证明引用存在，不能证明分类语义正确。
- `high/medium/low` 是模型自评，不是经过校准的正确率。信息不足、低把握或不合格式的结果保留待确认，不用随机标签补齐。
- 输出明确记录 `label_source=model_predicted`、`human_validated=false`。这些是弱标签，不能作为独立的真实评测答案。
- 低置信度和待审核预测不会进入线上主题标签；线上使用人工确认或 high/medium 预测，并保留来源、证据和理由。
- 推荐服务只在内存载入精简的 SDG 标签索引，不会在运行时加载分类模型或课程文本。
- 课程推荐排序训练与用户喜欢／不喜欢反馈是下一步；运行此脚本本身不会训练推荐模型，也不会修改现有护照印章。

## RunPod 使用

使用已安装兼容 torch、transformers==4.51.3、accelerate==1.6.0 的 Python 3.12 GPU 环境。可复用之前的环境，基础模型独立于面试 LoRA。项目已有精简课程目录 `models/course-recommender/courses.jsonl`，可以直接使用；如需从原始课程 ZIP 重建标注，也支持 ZIP。

先检查数据，不下载模型：

```bash
python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --inspect
```

先生成 20 门课程的建议：

```bash
python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 20
```

确认样例后，处理其余课程：

```bash
python scripts/auto_label_course_sdgs.py --input models/course-recommender/courses.jsonl --limit 0
```

结果在 `model-artifacts/course-sdg-predictions.jsonl`，可断点续跑；已成功标注且输入和配置不变的课程不会重复处理，失败项会重新尝试。输出目录已被 Git 忽略。

把人工审核或可接受的预测编译为网站使用的轻量标签文件：

```bash
python scripts/compile_course_sdg_labels.py
```

命令会写入 `models/course-recommender/sdg-labels.jsonl`。部署时一并带上该文件；未被编译的课程自动使用 SDG 4 学习贡献兜底。新增或更新标签文件后重启应用以重新载入索引。

小的 usage dataset 没有具体课程内容，不能据此推断课程 SDG。本次使用大课程 dataset 做内容标注。
