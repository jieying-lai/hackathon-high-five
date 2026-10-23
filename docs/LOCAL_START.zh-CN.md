> 更新：默认 Start.cmd 已改为轻量网站模式，不再下载或启动 Qwen。下方的大模型说明仅适用于显式设置 CAREERLENS_LOCAL_MODEL=1 的高级模式。给普通朋友使用，请部署一次网站并分享网址，见 [共享网站部署](SHARED_WEBSITE.zh-CN.md)。

# 自己电脑一键运行：队友与 judges

## 开始使用

1. 从 GitHub 的 Code → Download ZIP 下载完整项目，解压后再启动。不要在 ZIP 预览窗口中运行。
2. Windows 10/11 的 64 位电脑：双击根目录 **Start.cmd**。
3. macOS / Linux：在解压目录打开终端，执行 `bash start.sh`。
4. 等待自动安装与模型加载，浏览器会自动打开本机网站。保留启动窗口。

不需要事先安装 Python，不需要 API key、RunPod credit 或 NVIDIA GPU。
启动器在项目的 `.runtime/` 中安装 Python 3.12 和依赖，不修改系统 Python。
首次联网下载约 3.1GB 基础模型以及 Python/AI 库，建议至少预留 10GB 磁盘空间。
建议 16GB RAM，并关闭占内存的应用。CPU 生成可能需要数分钟，速度取决于电脑。
之后会复用缓存。下载中断后重新启动，模型下载可继续。

## 登录与 AI 生成

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| User | aisha.demo@careerlens.my | CareerLens@2026 |
| HR | hr.demo@nexussme.my | CareerLens@2026 |

HR → Candidate Screening → Shortlisting → 点击候选人姓名区域翻到背面 → Auto generate。
可以输入 Interview focus，再生成另一组问题。使用仓库内真正的训练适配器，失败会显示错误，不会用模板冒充 AI。
模型根据当前已授权 CV 的技能、项目和职位要求生成，HR 需要审核结果。
训练数据未包含 CV，训练问题为英文；中文和 BM 的质量未获验证。

## 功能覆盖

- User/HR 登录、资料、PDF 上传与本地提取、审核、分享、职位、筛选、短名单、面试通知、学习路径等均使用本机网站和数据库。
- HR 面试问题由本机 Qwen 1.5B + 已训练 LoRA 生成，无需第三方 API。
- 可选 Organise my CV with AI 使用同一个本地基础模型，处理前需要勾选确认；不会把 CV 用来训练。输出必须通过 PDF 原文校验，否则保留原资料。大 PDF 或不合格式的模型输出可能被拒绝，仍可使用本地提取与手动编辑。
- Lumi 与问卷保留原有本地模式；额外的 Gemini/RunPod 云端集成不是启动的必需项。
- 实时趋势、地图、外部课程与 CDN 样式仍依赖互联网。此版本不是完全离线包。
- 每台电脑的账号、上传文件、短名单与通知各自保存，不自动跨电脑同步。演示账号会在新数据库中自动创建。

## 停止、再次启动与排错

- 停止：启动窗口按 Ctrl+C。两项服务都会停止；下次仍双击 Start.cmd。
- 模型缓存：`state/interview-model/base-model/`。
- 本机数据库和会话密钥：`state/local/`。请勿提交这些文件到 Git。
- 上传资料：`src/data/uploads/`，已在 Git 忽略名单中。
- 日志：`state/local/logs/model.log` 与 `website.log`。
- 端口被占用时启动器自动选另一个本机端口，以窗口显示的网址为准。
- 不要挪动已经安装的 `.runtime` 到另一台电脑；在新电脑重新运行即可自动安装。
- 如果下载失败，检查网络是否能访问 GitHub、astral.sh、PyPI、download.pytorch.org 与 huggingface.co，再运行一次。
- 不要关闭启动窗口或让电脑休眠后继续等待 AI；恢复后重新启动。

该启动流程以 Windows x64 为主要目标；macOS/Linux 有启动入口，尚未在这些系统实机确认。部分老旧 CPU 或内存不足设备不能保证模型正常运行。
