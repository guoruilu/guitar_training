# 第一版 v1.0 文档索引

第一版（v1.0）是 Guitar Learning Assistant 当前整理后的正式版本名称。代码包版本使用
标准 semver `1.0.0`，Windows portable 产物文件名使用面向用户的
`Guitar-Training-v1.0-windows-portable.exe`。

## 文档目录

- [功能与需求总览](./features-and-requirements.md)：记录 v1.0 所有功能、满足的需求、实现位置和边界。
- [系统架构](./architecture.md)：说明 Web、Electron、数据、音频、指板和打包签名的模块关系。
- [构建与发布](./build-and-release.md)：说明开发、测试、普通打包、本机签名备用方案和 v1.0 exe 产物。
- [代码与函数参考](./code-reference.md)：逐文件说明主要代码职责，并逐项说明函数、组件、类和脚本入口。

## 第一版范围

v1.0 的产品范围是一个本地优先的吉他训练工具：

- 听力训练：音程听辨、和弦性质听辨、听力音域配置、统计记录。
- 指板琶音训练：手动/随机出题、随机根音池、随机和弦池、三种练习模式、二维/三维指板。
- 指板音阶训练：手动/随机出题、随机调性池、三种练习模式、二维/三维指板。
- 本地数据：浏览器/Electron `localStorage` 保存设置和统计，支持导入导出 JSON。
- 桌面发布：Electron portable Windows exe，普通无签名打包和本机开发签名备用方案并存。

## 维护原则

- 用户需求原文保存在 `docs/requirements/`，不要只保留转述。
- 重大行为和发布结果记录在 `log/`，方便新 agent 接手。
- 代码实现保持自包含；不依赖未跟踪资源。
- 普通发布优先使用 `npm run desktop:package:win`。
- 本机开发签名备用方案只在 Windows Smart App Control 阻止普通 exe 时使用，并且必须经过交互确认。
