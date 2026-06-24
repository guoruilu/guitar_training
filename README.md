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

上面的普通打包命令不会附带公开可信的代码签名证书。Windows 11
“智能应用控制”可能会拦截这种未签名的 portable exe。

优先先尝试普通打包产物。如果当前电脑可以直接打开，就不需要下面的步骤。
如果普通产物被 Windows 11“智能应用控制”拦截，又暂时不购买正式代码签名证书，
可以把本机开发签名打包作为备用方案。这个命令可从 Windows PowerShell 或 WSL
运行，但必须能调用到 Windows 的 `powershell.exe`：

```powershell
npm run desktop:package:win:local-signed
```

也可以直接双击根目录的 `package-guitar-training-local-signed.cmd`。
脚本会先说明它将修改当前 Windows 用户的证书信任区，并要求手动输入
`SMART APP CONTROL BLOCKED` 才会继续；如果只是正常打包或当前 exe 已能打开，
不要执行这个备用流程。

这个流程会：

- 在当前命令运行环境中用 `npm ci` 安装 `web/` 和 `desktop/` 依赖。
- 构建 Web 应用和 Electron Windows portable exe。
- 调用 Windows PowerShell，在当前 Windows 用户证书库中创建或复用一个本机自签名代码签名证书。
- 将该证书的公钥加入当前 Windows 用户的 Trusted Root 和 Trusted Publishers。
- 签名 `win-unpacked` 内部 exe 和最终 portable exe。
- 通过 npm 入口执行时默认不请求外部时间戳服务，避免本机备用流程依赖外部网络。

这只是本机临时方案，应只在普通打包/直接运行失败时再尝试。生成的 exe 通常可在
当前电脑当前用户下直接运行，但换到其他 Windows 电脑仍然需要对方自己运行同一套
本机签名流程，或改用正式代码签名证书 / Microsoft Store 发布。要移除这个本机信任：

```powershell
npm run desktop:remove-local-dev-signing
```
