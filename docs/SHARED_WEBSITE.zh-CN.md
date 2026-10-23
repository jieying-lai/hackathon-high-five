# 让朋友打开网址就能使用

访问者只需浏览器。安装 Python、部署、数据库备份和更新由网站维护者做一次。
当前代码修改不会自动更新已发布的网站。

## 现有 Replit 项目

1. 将这次代码更新同步到你实际发布的 Replit 项目。
2. 使用仓库 `.replit` 的运行命令；它已指定轻量问题生成和 Waitress 网站服务。
3. 在服务器 Secrets 设置固定的随机 `FLASK_SECRET_KEY`，HTTPS 站点设置 `COOKIE_SECURE=1`。
4. 将 `CAREERLENS_DB_PATH` 指向可持久保存的目录中的数据库文件；目录须已存在。
   上传文件也必须保存在持久存储中。不要把临时部署磁盘当成长期存储。
5. 重新发布，再把正式 HTTPS 地址分享给朋友。不要分享 localhost 或本机文件夹。

## 其他支持 Python 的服务器

安装：`pip install -r requirements-web.txt`。

设置 `HOST=0.0.0.0`、平台指定的 `PORT`、`HR_INTERVIEW_PROVIDER=rules`、
固定 `FLASK_SECRET_KEY`，以及持久化 `CAREERLENS_DB_PATH`。
启动命令：`python scripts/serve_web.py`。由平台提供 HTTPS。
当前 SQLite 架构适合单个应用实例；不要让多实例各自使用不同的数据库文件。

## 发布后检查

用 HR 账号选中有权限访问的候选人，在 shortlist 点击 Auto generate。
应返回四个 CV/职位相关问题，不应出现 Start.cmd、模型安装或 RAM 提示。
再点一次应换一组；切换中文或马来语后应使用相应语言。
未登录、非 HR 账号或已撤回 CV 授权的请求仍应被拒绝。

## 功能范围

默认 HR 面试问题是基于规则和专业 CV 内容的轻量生成，不是 Qwen 推理。
不需要模型下载、GPU 或外部 AI Key，也不把候选人资料发给第三方 AI。
仅选择与岗位相关的技能和项目；自由填写的 focus 只用于优先选择已有技能。
这不改变其他可选 AI 功能的服务要求，也不保证整站任何内存大小都能运行。
托管服务器仍需要承担网站和数据库资源，访客电脑只负责浏览器显示。

如果需要训练模型生成，维护者可单独部署模型服务，再配置现有 local connector；
不要要求每个朋友各自安装模型。模型托管可能产生费用，应在选择平台后确认。
