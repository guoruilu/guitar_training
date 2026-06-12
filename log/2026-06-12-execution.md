# 2026-06-12 执行日志

## 环境

- 工作目录：`/mnt/e/wps/Projects/guitar`
- Node：`v22.22.2`
- npm：`11.14.1`
- 初始状态：空目录，无已有应用代码。

## 执行记录

- 建立项目配置：`package.json`、`vite.config.ts`、`tsconfig.json`、`index.html`。
- 建立功能目录：`ear-training`、`arpeggio-training`、`scale-training`。
- 建立共享目录：`music`、`audio`、`fretboard`、`storage`。
- 建立文档目录：`docs/2026-06-12`、`docs/features`。
- 建立日志目录：`log`。
- 实现 Web Audio 合成播放。
- 实现本地保存适配器。
- 实现三大训练模块首版。

## 已发现并修复的问题

- 指板逐题定位中，当目标音为 `C` 对应 pitch class `0` 时，布尔判断可能误判为无目标。已改为显式判断 `undefined`。

## 待记录

- 依赖安装：`npm install` 成功，安装 94 个包，0 个漏洞。
- 单元测试：`npm run test` 成功，1 个测试文件、5 个用例通过。
- 构建：`npm run build` 成功，生成 `dist/`。
- 开发服务器：首次在沙箱内启动失败，错误为 `listen EPERM: operation not permitted 0.0.0.0:5173`；使用提升权限启动成功。
- Smoke test：沙箱内 `curl localhost` 失败，原因是沙箱网络无法解析/连接本地服务；使用同一提升权限环境请求 `http://127.0.0.1:5173/` 返回 HTTP 200。
- 构建脚本调整：将 `tsc -b` 改为 `tsc --noEmit`，避免生成 `tsconfig*.tsbuildinfo` 和 `vite.config.js/.d.ts`；已清理本次生成的这些文件并加入 `.gitignore`。
- 文档复查：确认 `docs/` 已包含项目索引、代码计划、架构说明、使用说明、项目进展和功能设计；将进展文档中的“待验证”改为“验证结果”。
- Git 绑定：初始化本地 Git 仓库，将默认分支设为 `main`，添加远程仓库 `origin = git@github.com:guoruilu/guitar_training.git`。
- README 更新：补充项目来源说明，明确本项目在人工需求、文档和开发指导下由 OpenAI Codex 生成并维护代码实现。
- 贡献指南：新增根目录 `AGENTS.md`，说明项目结构、开发命令、编码风格、测试要求、提交/PR 规范和 Codex 相关协作要求。
- Git 忽略规则：扩展 `.gitignore`，覆盖环境变量、密钥、系统/编辑器文件、工具日志、缓存、压缩包和原始大媒体文件；保留项目过程文档 `log/*.md` 的追踪。
- 贡献指南更新：补充 `AGENTS.md` 规则，要求保持指南精简、细节进入结构化 `docs/`，每次任务更新文档/日志，且项目必须从源码和项目命令自包含运行，不依赖手动寻找未追踪素材。
- 指板显示调整：主指板品位编号改为从 `1` 品开始，空弦音保留为可点选位置但以独立“空弦”列呈现，并同步更新使用说明和指板训练文档。
- 本地数据迁移：设置区新增数据位置展示、JSON 导出和导入；文档补充 WSL 下 Windows 浏览器应优先使用 Vite `Network` 地址，以及跨设备复制 `guitar-training-progress.json` 的迁移方式。
- 听力与外观更新：音程训练新增可选音程题库，默认随机上下行；新增顶部说明弹窗；新增暗色/明色主题并将默认设置为暗色；在 `docs/requirements/2026-06-12.md` 原文记录用户需求。
- 随机与开发服务调整：随机选择改为优先使用 `crypto.getRandomValues`，避免固定伪随机序列；`npm run dev` 固定为 `5180 --strictPort`，避免旧服务占用端口后自动换端口导致浏览器看到旧代码；文档记录浏览器不能直接关闭 WSL dev server，需要终端 `Ctrl+C`。
- 启动入口：新增 Windows 双击入口 `start-guitar-training.cmd`、跨平台 shell 入口 `start-guitar-training.sh` 和 `scripts/launch-dev.mjs`，用于安装依赖、启动固定端口 dev server 并打开浏览器。
- 普通用户启动调整：`start-guitar-training.cmd` 优先打开预构建 `dist/index.html`，不要求普通用户具备 WSL/npm；Vite 改为相对 base，便于发布包本地双击运行。
- 发布包构建：新增 GitHub Actions workflow，自动运行测试/构建并上传 `guitar-training-windows` 静态包，普通 Windows 用户下载后双击 `start-guitar-training.cmd` 即可运行。
- Windows 空白页修复：不再直接用 `file://` 打开 `dist/index.html`；Windows 启动器改为用 PowerShell 启动本机静态服务并打开 `http://127.0.0.1:<port>/`，发布包同步包含 `scripts/start-windows.ps1`。
