# 漫画日本語塾（Manga Japanese Dojo）

看漫画学日语的针对性学习网页：语法 148 条、句式 40 条、口语缩约 16 组、单词 297 词、拟声拟态 112 词、常用汉字读音 230 字、实战阅读 12 段、测验 30 题、记忆卡片。

纯静态站点，无构建、无依赖，直接打开 `index.html` 即可使用（也可部署到 GitHub Pages / Netlify 等任意静态托管）。

## 文件说明

- `index.html` 主页面
- `style.css` 样式（漫画风）
- `data-grammar.js` 语法数据（148 条）
- `data-words.js` 单词 + 拟声拟态词数据
- `data-more.js` 句式 / 缩约 / 实战阅读 / 测验数据
- `data-kanji.js` 常用汉字读音表（230 字，离线查读音）
- `app.js` 逻辑（进度保存、搜索、查词、测验、卡片）
- `server.js` 局域网预览服务器（`node server.js`，端口 8791），同时提供进度同步 API：掌握进度统一保存在 `progress.json`，PC 与手机自动互通
- `start-server.bat` 启动局域网预览（无需管理员）
- `install-admin.bat` 一次性管理员设置：防火墙放行 8791 + 开机自启

## 进度同步（PC ⇄ 手机）

电脑开着服务器、手机和电脑连同一 Wi-Fi 时，两端的掌握进度会自动同步（统一存在电脑上的 `progress.json`）。

- 打开页面时自动拉取一次；切回页面、以及每 30 秒也会自动同步一次。
- 合并策略：各设备已标记的条目取并集（不会互相覆盖丢失）。取消标记在当前设备立即生效，但不会从其它设备/服务器上删除。
- 电脑关机或手机不在同一 Wi-Fi 时，手机照常能用，进度暂存在手机本地，下次连上会自动合并。
- 如果以后部署到 GitHub Pages（纯静态、无服务器），就没有这个同步了，届时进度按设备分开保存。

## 部署到 GitHub Pages

方式一（推荐，全自动）：给我一个 GitHub Token（Settings → Developer settings → Personal access tokens → Tokens (classic) → 勾选 `repo` → 生成），我会通过 GitHub API 自动完成：建仓库 → 上传文件 → 开启 Pages。

方式二（手动）：github.com 新建仓库 `japanese-manga`（Public）→ 上传本目录除 `.cowork-temp` 外的文件 → Settings → Pages → Deploy from a branch → `main` / `/ (root)` → Save。等待 1~3 分钟后访问 `https://你的用户名.github.io/japanese-manga/`。

## 更新内容

- 本地改完文件后：方式一可随时叫我重新同步；方式二用 git 推送，或直接在网页仓库里替换文件。
