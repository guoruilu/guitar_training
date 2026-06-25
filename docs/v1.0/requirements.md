# v1.0 需求覆盖

本文整理第一版（v1.0）已经实现的需求、需求来源和实现边界。原文逐次记录仍以
`docs/requirements/` 为准。

## 项目来源与总体要求

需求：

- 构建一个吉他学习辅助工具。
- 代码由 OpenAI Codex 在人工需求和文档指导下生成并维护，需要在 README 保留此 attribution。
- 项目应自包含，源码克隆后可通过项目命令安装依赖、运行、测试和打包。
- 每次任务后记录需求、执行细节、错误和验证结果。

v1.0 实现：

- README 保留了 Codex 生成和维护说明。
- `web/`、`desktop/`、`docs/`、`log/` 分离。
- 训练逻辑、音频、存储、打包脚本都在仓库内。
- 需求原文保存在 `docs/requirements/`。
- 执行记录保存在 `log/`。

## 听力训练需求

需求：

- 支持音程听力训练。
- 支持和声/和弦听力训练。
- 支持播放题目、作答、下一题。
- 支持统计次数、正确率、当前连续正确和最佳连续正确。
- 支持听力音域配置。
- 音程训练要支持上下行方向。

v1.0 实现：

- `EarTraining` 提供音程和和声两个 tab。
- 音程训练从 `INTERVALS` 题库抽题，可选择训练音程池。
- 音程方向支持随机上下行、上行、下行。
- 和声训练从 `CHORD_QUALITIES` 抽取和弦性质。
- 听力音域使用 MIDI A0-C8 范围，最小跨度为一个八度。
- 作答后写入 `ear-interval` 或 `ear-chord` 统计。

边界：

- 和声听力当前识别的是和弦性质，不要求用户输入具体转位或声部排列。
- 音频合成使用浏览器 Web Audio triangle oscillator，不使用外部采样库。

## 指板训练需求

需求：

- 支持吉他指板琶音训练。
- 支持吉他指板音阶训练。
- 指板需要显示音名和音级。
- 支持点选指板位置作答。
- 支持手动出题和随机出题。
- 随机根音/调可以配置。
- 琶音随机模式要能选择包含哪些和弦，默认包含属七、大七、小七、半减七、减七。
- 选择和弦、选择调/根音区域要可以展开或收起。

v1.0 实现：

- `ArpeggioTraining` 复用 `FretboardPractice`，题库为 `CHORD_QUALITIES`。
- `ScaleTraining` 复用 `FretboardPractice`，题库为 `SCALE_DEFINITIONS`。
- `FretboardPractice` 支持手动/随机出题。
- 随机根音池来自 `ROOT_OPTIONS`，可在折叠面板中勾选。
- 琶音随机和弦池来自 `enabledArpeggioChordIds`，默认值为
  `7`、`maj7`、`min7`、`m7b5`、`dim7`。
- 和弦池和根音池使用原生 `details` / `summary` 折叠面板。
- 题目限制在随机 4 品跨度内，范围外位置禁用。

边界：

- 当前使用标准调弦 EADGBE，不提供变调夹或自定义调弦界面。
- 随机品位范围为固定跨度算法，不提供用户选择具体跨度。

## 指板练习模式需求

需求：

- 支持找出范围内所有目标音。
- 支持单个目标音定位。
- 支持按公式/路线顺序练习。

v1.0 实现：

- `find-all`：找出当前品位范围内所有目标 pitch class 位置。
- `single-note`：只找一个当前题目 focus pitch class。
- `route`：按目标公式顺序依次选择位置。
- 三种模式共享统计、目标音播放、题目提示和二维/三维视图。

边界：

- `route` 模式校验 pitch class 顺序，不强制指法经济性或同一把位规则。

## 第一人称 3D 指板需求

需求：

- 提供第一人称视角的吉他指板。
- 第一人称视角要能分清哪边是琴头。
- 第一人称视角默认应是 6 弦更接近镜头。

v1.0 实现：

- `Fretboard3D` 使用 Three.js 渲染琴颈、弦、品丝、品记、琴头、弦钮、nut 和目标标记。
- 画面上有 `琴头端`、`琴身端` 固定标签，场景中有 `琴头` 标签。
- `PLAYER_CAMERA_X` 与默认 `stringXPositions('first-string-top')` 组合，使 6 弦在默认视角更靠近镜头。
- 鼠标/触摸点击通过 raycaster 命中 3D marker。
- OrbitControls 支持拖拽观察。

边界：

- 3D 场景用于训练辅助，不模拟真实吉他弦距、品距或透视比例的精确物理数据。

## 本地数据需求

需求：

- 用户设置和训练统计需要本地保存。
- 需要能迁移数据。

v1.0 实现：

- Web 和 Electron 都使用浏览器 `localStorage`。
- 存储 key 为 `guitar-learning-assistant:progress:v1`。
- 数据结构版本为 `version: 1`。
- 支持导出 `guitar-training-progress.json`。
- 支持导入 JSON，并通过 `normalizeProgress` 校验和补齐默认值。

边界：

- 当前没有云同步、账户系统或多用户数据隔离。

## Windows 发布与 Smart App Control 需求

需求：

- 需要生成 Windows `.exe`。
- 普通用户应能直接运行 portable exe。
- 当 Windows 11 Smart App Control 阻止未签名 exe 时，需要临时解决方案。
- 暂时不购买公开代码签名证书。
- 备用方案执行前必须提醒用户将要做什么。
- 备用方案只有必要时才能执行。
- 当前版本命名为第一版，exe 重新生成为 v1.0。

v1.0 实现：

- Electron Builder 输出 `Guitar-Training-v1.0-windows-portable.exe`。
- 普通打包命令保留：`npm run desktop:package:win`。
- 本机开发签名备用命令保留：`npm run desktop:package:win:local-signed`。
- 备用命令运行前会说明当前用户证书库修改、影响范围和移除方式。
- 备用命令要求输入 `SMART APP CONTROL BLOCKED` 才继续。
- 文档强调只有普通 exe 被当前电脑阻止时才使用备用方案。
- 移除命令为 `npm run desktop:remove-local-dev-signing`。

边界：

- 本机开发签名不是公开可信代码签名证书。
- 其它 Windows 电脑仍需自己的本机签名步骤，或未来改用正式证书/Microsoft Store。
