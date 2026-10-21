# 让 AI 自动判断课程的 SDG

入口：`scripts/auto_label_course_sdgs.py`。

模型读取课程标题、简介、技能、学习成果及类别，对照 17 项 SDG 的主题说明，自动输出零到三个目标、原文依据和解释。主题说明参考 https://sdgs.un.org/goals ，脚本中为简短概述。

- 只产生 SDG 1–17 的目标级标签；未提供 169 项具体子目标定义，因此不让模型猜造 3.4、9.5 等编号。
- 不使用简历，也不加载面试问题适配器。
- 不因“它是一门课”就自动判 SDG 4，也不因“与技术有关”就自动判 SDG 9。
- 每个建议必须附一段能在课程字段中找到的原文；原文吻合只能证明引用存在，不能证明分类语义正确。
- `high/medium/low` 是模型自评，不是经过校准的正确率。信息不足、低把握或不合格式的结果保留待确认，不用随机标签补齐。
- 输出明确记录 `label_source=model_predicted`、`human_validated=false`。这些是弱标签，不能作为独立的真实评测答案。
- 课程推荐排序训练与用户喜欢／不喜欢反馈是下一步；运行此脚本本身不会训练推荐模型，也不会修改现有护照印章。

## RunPod 使用

在项目根目录放置课程 ZIP，使用已安装兼容 torch、transformers==4.51.3、accelerate==1.6.0 的 Python 3.12 GPU 环境。可复用之前的环境，基础模型独立于面试 LoRA。

先检查数据，不下载模型：

```bash
python scripts/auto_label_course_sdgs.py --input 'online learning platform.zip' --inspect
```

先生成 20 门课程的建议：

```bash
python scripts/auto_label_course_sdgs.py --input 'online learning platform.zip' --limit 20
```

确认样例后，处理其余课程：

```bash
python scripts/auto_label_course_sdgs.py --input 'online learning platform.zip' --limit 0
```

结果在 `model-artifacts/course-sdg-predictions.jsonl`，可断点续跑；已成功标注且输入和配置不变的课程不会重复处理，失败项会重新尝试。输出目录已被 Git 忽略。

小的 usage dataset 没有具体课程内容，不能据此推断课程 SDG。本次使用大课程 dataset 做内容标注。
