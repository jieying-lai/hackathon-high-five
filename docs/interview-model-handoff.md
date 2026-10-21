# Auto generate：交接说明

## 已完成与当前状态

- Shortlisting 卡片翻转背面只保留 Auto generate 按钮、生成结果区和状态提示。
- 已移除该卡片的静态问题拼接、默认问题列表和追问输入框。
- 首次进入不生成、不显示模板问题；点击按钮才调用模型。
- 成功后显示真正的模型返回内容；再次点击会携带上一组问题。
- 模型尚未训练或部署。未连接时返回 503，页面明确提示尚未接入。
- 中、英、BM 按钮及状态提示已同步；生成语言随网站选择传给模型。
- 不自动退回题库、模板或 Gemini。

## 调用链

```
Shortlisting 翻转卡片 → Auto generate
  → POST /api/hr/interview-questions （网站接口，需要 HR 登录及 CSRF）
  → src/hr_interview_ai.py （重新检查职位归属及 CV 分享权限）
  → POST http://127.0.0.1:8766/generate （朋友实现的模型服务）
  → 验证 4 个问题 → 卡片显示
```

## 朋友主要要实现的地方

`runpod/interview_framework.py` 中的 `generate_questions(context, language, question_count, prompt)`。
它现在明确抛出 ModelNotReady；接入真实本地模型或已微调模型后返回 4 个问题字符串。
模型应启动时加载一次，不要每点一次按钮重新下载和加载。

如已用训练包训练出 LoRA adapter，可以直接使用
`scripts/serve_interview_model.py --adapter /path/to/adapter`，无需使用占位框架。
LoRA adapter 必须和训练时的基础模型配套使用。

## 网站配置

服务器 `.env`：

```dotenv
HR_INTERVIEW_PROVIDER=local
HR_INTERVIEW_MODEL_URL=http://127.0.0.1:8766/generate
```

重启 Flask 网站。
使用当前项目环境运行占位框架：`python runpod/interview_framework.py`。
这个命令只启动接口骨架，不会训练模型，也不会生成假问题。
先完成函数，再运行真实模型服务。
模型服务默认只绑定 localhost；网站与模型不在同一机器时，可用 SSH 隧道连接。
网站的模型 URL 只能由服务器管理员配置，不能从用户请求覆盖。

## 模型服务请求格式

```json
{
  "prompt": "服务端生成的完整指令与上下文",
  "language": "en",
  "question_count": 4,
  "context": {
    "role": "Software Developer",
    "required_skills": ["Python", "SQL", "REST APIs"],
    "cv_skills": ["Python", "SQL"],
    "cv_projects": ["使用 Flask 和 PostgreSQL 实现库存 API"],
    "focus": "",
    "previous_questions_to_avoid": []
  }
}
```

language 支持 en / zh / ms。前端已去掉追问输入框，focus 默认为空。
上下文来自服务端当前授权数据，不接受浏览器自报 CV。
不传姓名、邮箱、电话、薪资或 PDF 原文。
运行时使用授权 CV 作为上下文，与将 CV 加入训练集是两件事；本训练包未使用 Resume。

## 模型服务成功响应

```json
{
  "questions": [
    "模型生成的问题一",
    "模型生成的问题二",
    "模型生成的问题三",
    "模型生成的问题四"
  ]
}
```

这里的文字仅说明 JSON 结构，不可当实际问题返回。
网站要求恰好 4 道非空问题，每题最多 1200 字符，无重复，并会排除上一组原题。
语义上的重复仍需模型本身处理。不能编造 CV 经历；缺少技能时可以问解决思路。

## 错误响应

- 服务未接入：HTTP 503，`{"error":"MODEL_NOT_CONNECTED"}`。
- 模型推理失败：HTTP 502。
- 请求格式错误：HTTP 400。
- 网站会保留此前成功生成的问题；首次生成失败保持空白。

## 训练包说明

附带 interview-training-runpod.zip。数据已清理，但没有任何训练完成的权重。
SE 174 个不同问题；HR 250 万行去重后 40 个不同问题，共 214 个。
364 条训练样本、32 条验证样本包含原题组合变体，不等于新增独立问题。
仅英文训练样本，不能据此声称中、英、BM 问题质量达标。
现有数据没有 HR 审核证明和许可附件；需核实原 Kaggle 许可再用于训练、发布。
推理效果、不同技能与职位的相关性、重新生成的多样性需要朋友在接入真实模型后验证。

## 文件定位

- src/static/js/shortlisting.js：按钮、加载状态、生成结果、卡片翻转。
- src/templates/hr.html：onGenerate 请求参数。
- src/main.py：受角色保护的 POST /api/hr/interview-questions。
- src/hr_interview_ai.py：权限检查、模型请求、结果校验。
- src/static/js/portal-i18n.js：中英 BM 文案。
- runpod/interview_framework.py：待接模型的服务骨架。
- scripts/finetune_interview_model.py：GPU 微调脚本。
- scripts/serve_interview_model.py：已有 adapter 时的推理服务。

交接包是现有仓库的增量文件，不是可独立运行的完整网站。
