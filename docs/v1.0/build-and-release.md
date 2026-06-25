# v1.0 构建与发布说明

## 版本命名

- 对外版本名称：第一版（v1.0）。
- npm 包版本：`1.0.0`。
- Windows portable 文件名：`Guitar-Training-v1.0-windows-portable.exe`。
- 打包输出目录：`desktop/release/`。

`desktop/package.json` 中的 Electron Builder `artifactName` 固定为
`Guitar-Training-v1.0-windows-portable.exe`，避免 v1.0 发布产物继续沿用旧的
`0.1.0` 文件名。

## 常用命令

从仓库根目录运行：

```bash
npm run test
npm run build
npm run desktop:package:win
```

命令含义：

- `npm run test`：运行 Web 侧 Vitest 单元测试。
- `npm run build`：TypeScript 类型检查并构建 `web/dist`。
- `npm run desktop:package:win`：先构建 Web，再用 Electron Builder 生成 Windows portable exe。

## 普通 Windows 打包流程

普通流程用于大多数开发和发布场景：

```bash
npm --prefix desktop install
npm run desktop:package:win
```

输出文件：

```text
desktop/release/Guitar-Training-v1.0-windows-portable.exe
```

这个普通产物不带公开可信代码签名证书。Windows 11 Smart App Control 可能会阻止
未知发布者的 portable exe，这是平台安全策略，不是应用业务代码错误。

## 本机开发签名备用方案

只有在普通 exe 被当前电脑的 Windows Smart App Control 阻止、且暂时没有公开代码签名证书时，
才使用本机开发签名备用方案：

```powershell
npm run desktop:package:win:local-signed
```

执行前脚本会打印它要做的事情，并要求手动输入：

```text
SMART APP CONTROL BLOCKED
```

确认后它会：

- 使用 `npm ci` 安装 `web/` 与 `desktop/` 依赖。
- 构建 `web/dist`。
- 用 Electron Builder 生成 `win-unpacked`。
- 创建或复用当前 Windows 用户的自签名代码签名证书。
- 将该证书加入当前用户的 Trusted Root 和 Trusted Publishers。
- 签名 `win-unpacked` 内的 exe 文件。
- 基于已签名的 unpacked 目录生成 portable exe。
- 签名最终 portable exe。

风险和边界：

- 这是当前 Windows 用户、当前电脑的本机信任方案，不是公开发行签名。
- 其它 Windows 电脑不会自动信任这个证书。
- npm 入口默认使用 `-NoTimestamp`，避免依赖外部时间戳服务。
- 如果以后不需要本机信任，可以运行移除命令。

移除当前用户本机开发签名证书：

```powershell
npm run desktop:remove-local-dev-signing
```

## 验证发布产物

在 WSL 中可用：

```bash
sha256sum desktop/release/Guitar-Training-v1.0-windows-portable.exe
ls -lh desktop/release/Guitar-Training-v1.0-windows-portable.exe
```

在 Windows PowerShell 中可用：

```powershell
Get-AuthenticodeSignature E:\prjs\guitar_training\desktop\release\Guitar-Training-v1.0-windows-portable.exe
```

普通无签名流程通常返回 `NotSigned`。本机开发签名备用方案在当前用户信任证书后应返回
`Valid`。
