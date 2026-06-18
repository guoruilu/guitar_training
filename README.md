# Guitar Learning Assistant

吉他学习辅助工具。首版包括听力训练、指板琶音训练和指板音阶训练。

## Project Origin

本项目是在人工编写的需求、文档和开发指导下，由 OpenAI Codex 生成并维护代码实现的项目。

## Structure

- `web/`：Vite + React + TypeScript 浏览器端应用。
- `desktop/`：Electron 桌面应用壳，加载 `web/dist`。
- `docs/`：项目文档。
- `log/`：执行和排错记录。

## Run

普通 Windows 用户优先使用 GitHub Actions 生成的桌面产物 `guitar-training-desktop-windows`，双击其中的 portable exe 即可运行，不需要 WSL、Node.js 或 npm。

源码开发可在根目录运行：

```bash
npm run desktop:dev
```

这会先构建 `web/`，再打开 Electron 桌面窗口。关闭桌面窗口后应用进程退出。

也可以只运行浏览器端：

```bash
npm --prefix web install
npm run dev
```

## Verify

```bash
npm run test
npm run build
```

3D 指板变更后，可先启动预览服务，再运行 Playwright 检查：

```bash
npm --prefix web run preview -- --port 5181 --strictPort
node web/scripts/verify-3d-playwright.mjs
```

Windows 桌面打包：

```bash
npm --prefix desktop install
npm run desktop:package:win
```
