# v1.0 功能与需求总览

本文是第一版（v1.0）当前唯一的“功能 + 已满足需求”总览文档。需求原文仍按日期保存在
`docs/requirements/`，本文负责把这些需求整理为可阅读的产品功能、实现状态、实现位置和
边界说明。

## 版本范围

- 对外版本名称：第一版 / v1.0。
- npm 版本：`1.0.0`。
- Windows portable exe：`desktop/release/Guitar-Training-v1.0-windows-portable.exe`。
- 产品形态：本地优先的吉他学习辅助工具，包含 Web 应用和 Electron 桌面壳。
- 当前核心模块：听力训练、指板琶音训练、指板音阶训练、本地数据保存、Windows 打包和本机签名备用方案。

## 需求来源

需求原文按任务日期记录：

- `docs/requirements/2026-06-12.md`：初始吉他学习辅助工具、听力训练、指板训练、数据保存等基础需求。
- `docs/requirements/2026-06-13.md`：Windows 桌面运行和普通用户可用性相关需求。
- `docs/requirements/2026-06-14.md`：exe 刷新、桌面产物同步问题。
- `docs/requirements/2026-06-18.md`：3D 指板、随机题池、音名拼写和视角相关需求。
- `docs/requirements/2026-06-24.md`：Smart App Control、本机签名备用方案、随机和弦池、第一人称琴头方向、默认 6 弦近侧、折叠选择器。
- `docs/requirements/2026-06-25.md`：第一版 v1.0 命名、v1.0 exe、详细文档整理。
- `docs/requirements/2026-08-09.md`：将项目所有功能和满足的需求整理为一个文档。

## 功能总览

| 功能域 | v1.0 状态 | 主要实现位置 |
| --- | --- | --- |
| 主界面与导航 | 已实现 | `web/src/App.tsx` |
| 全局设置与统计 | 已实现 | `web/src/App.tsx`, `web/src/shared/storage/` |
| 音程听力 | 已实现 | `web/src/features/ear-training/` |
| 和声/和弦听力 | 已实现 | `web/src/features/ear-training/` |
| 琶音指板训练 | 已实现 | `web/src/features/arpeggio-training/`, `web/src/shared/fretboard/` |
| 音阶指板训练 | 已实现 | `web/src/features/scale-training/`, `web/src/shared/fretboard/` |
| 二维指板 | 已实现 | `web/src/shared/fretboard/Fretboard.tsx` |
| 三维第一人称指板 | 已实现 | `web/src/shared/fretboard/Fretboard3D.tsx` |
| 本地数据导入导出 | 已实现 | `web/src/shared/storage/localStorageAdapter.ts` |
| Electron 桌面壳 | 已实现 | `desktop/src/main.cjs` |
| Windows portable exe | 已实现 | `desktop/package.json` |
| Smart App Control 本机签名备用方案 | 已实现，有使用边界 | `desktop/scripts/` |

## 主界面与全局操作

### 已实现功能

- 顶部导航包含 `听力训练`、`琶音训练`、`音阶训练` 三个主功能入口。
- 右上角 `说明` 按钮打开使用说明弹窗。
- 左侧面板展示本地统计汇总。
- 左侧面板提供指板设置、主题设置、数据导入导出和重置操作。
- 主训练区域根据当前导航切换训练模块。

### 满足的需求

- 提供一个统一的吉他学习辅助工具入口。
- 首版包含听力训练、指板琶音训练和指板音阶训练。
- 用户设置和训练统计能跨模块共享。
- UI 文案面向中文用户。

### 实现位置

- `web/src/App.tsx`
- `web/src/styles.css`
- `web/src/shared/storage/localStorageAdapter.ts`

### 边界

- 当前没有账户系统、云同步、多用户工作区或在线服务。
- 统计只代表当前浏览器或当前 Electron 用户数据目录中的本地数据。

## 全局设置与统计

### 已实现功能

- 指板品位数量：12、15、17 品。
- 指板视角：二维图表视角、3D 第一人称演奏视角。
- 琴弦顺序：1 弦在上、1 弦在下。
- 显示选项：音名、音级。
- 主题：暗色、明色。
- 汇总统计：总次数、总正确数、总正确率、最佳连续正确。
- 模块统计：每个训练区域记录次数、正确率、当前连续正确、最佳连续正确。

### 满足的需求

- 训练过程需要有本地统计反馈。
- 指板训练需要可调整显示方式。
- 训练工具应适合反复练习和长期使用。

### 实现位置

- `web/src/App.tsx`
- `web/src/shared/storage/types.ts`
- `web/src/shared/storage/localStorageAdapter.ts`

### 边界

- 统计不区分具体题型难度、题库、日期区间或单次练习 session。
- 当前没有图表化历史趋势。

## 听力训练

听力训练包含音程听力和和声听力两个 tab。

### 音程听力

已实现功能：

- 从 P1 到 P8 的常用音程中出题。
- 可配置训练音程池，并支持全选。
- 至少保留一个音程，避免空题库。
- 可配置方向：随机上下行、上行、下行。
- 可配置听力音域，范围为 A0-C8，最小跨度为一个八度。
- 支持重播、答题、下一题。
- 答题后显示正确答案并锁定本题，避免重复计分。

满足的需求：

- 支持音程听辨。
- 支持上下行音程训练。
- 支持用户选择训练范围和训练内容。
- 支持播放题目、作答、下一题和统计记录。

实现位置：

- `web/src/features/ear-training/EarTraining.tsx`
- `web/src/features/ear-training/challenges.ts`
- `web/src/shared/music/midi.ts`
- `web/src/shared/music/theory.ts`
- `web/src/shared/audio/synth.ts`

边界：

- 当前只播放两个音的顺序音程，不提供旋律片段或节奏听辨。
- 答案选择只判断音程类型，不判断用户是否能唱出音名。

### 和声/和弦听力

已实现功能：

- 随机生成根音和和弦性质。
- 播放同时发声的和弦音。
- 用户从和弦性质按钮中选择答案。
- 答题后显示根音 + 和弦 symbol。
- 题目保证所有和弦音在当前听力音域内。

和弦题库覆盖：

- 大三、小三、减三、增三。
- sus2、sus4。
- 大六、小六、加九、六九。
- maj7、7、min7、小大七、半减七、减七。
- 9、maj9、min9。
- 11、min11。
- 13、maj13、min13。
- 7b5、7#5、7b9、7#9、7#11、7b13、13b9、7alt、maj7#11。

满足的需求：

- 支持和声/和弦听辨。
- 覆盖常见三和弦、七和弦、扩展和弦和变化和弦。
- 听力题目需要能播放、作答和记录统计。

实现位置：

- `web/src/features/ear-training/EarTraining.tsx`
- `web/src/features/ear-training/challenges.ts`
- `web/src/shared/music/theory.ts`
- `web/src/shared/audio/synth.ts`

边界：

- 当前识别的是和弦性质，不要求识别转位、具体排列、密集/开放 voicing。
- 当前音色为浏览器合成器，不使用真实吉他采样。

## 指板训练通用能力

琶音训练和音阶训练共用 `FretboardPractice`，因此具有一致的出题、点选、判题、统计和视图能力。

### 已实现功能

- 手动出题：用户手动选择根音/调和类型。
- 随机出题：系统从启用的随机池中抽取题目。
- 随机品位范围：每题限制在连续 4 品范围内。
- 范围外指板位置禁用。
- 播放目标音。
- 提交答案、下一题、清空选择。
- 结果反馈显示正确、缺失位置、误选位置或正确顺序。
- 支持二维指板和 3D 第一人称指板。

### 三种练习模式

点选找音：

- 目标是找出当前品位范围内所有目标音位置。
- 系统要求没有误选，并且所有目标位置都被选中。
- 错误时反馈缺少哪些位置、误选哪些位置。

逐题定位：

- 目标是找一个指定音级/音名。
- 系统要求只选择一个位置。
- 所选位置 pitch class 必须等于目标 pitch class。

路线练习：

- 目标是按公式顺序依次选择目标音。
- 系统要求选择数量等于目标公式音数。
- 每个位置的 pitch class 必须按顺序匹配目标。

### 满足的需求

- 指板训练需要支持点选作答。
- 指板训练需要支持找音、逐题定位和路线练习。
- 琶音和音阶需要共享一致的训练体验。
- 随机模式需要可控，不能完全不可预测。

### 实现位置

- `web/src/shared/fretboard/FretboardPractice.tsx`
- `web/src/shared/music/fretboard.ts`
- `web/src/shared/music/fretboardTrainer.ts`
- `web/src/shared/music/spelling.ts`

### 边界

- 当前使用标准调弦 EADGBE。
- 当前不支持变调夹、自定义调弦或真实指法经济性评分。
- `route` 模式校验音高顺序，不强制同一把位或具体手型。

## 琶音指板训练

### 已实现功能

- 使用和弦性质作为琶音公式。
- 手动模式可从全部和弦性质中选择。
- 随机模式可选择包含哪些和弦。
- 随机和弦池默认包含：
  - 属七和弦：`7`
  - 大七和弦：`maj7`
  - 小七和弦：`min7`
  - 半减七和弦：`m7b5`
  - 减七和弦：`dim7`
- `选择和弦` 区域为可展开/收起面板。
- 至少保留一个随机和弦。

### 满足的需求

- 支持指板琶音训练。
- 随机模式需要可以选择哪些和弦被包含进来。
- 默认随机池必须包含属七、大七、小七、半减七、减七。
- 选择和弦部分需要可以展开或收起。

### 实现位置

- `web/src/features/arpeggio-training/ArpeggioTraining.tsx`
- `web/src/shared/fretboard/FretboardPractice.tsx`
- `web/src/shared/music/theory.ts`
- `web/src/shared/storage/localStorageAdapter.ts`

### 边界

- 当前和弦池是固定代码数据，不提供用户自定义和弦公式。

## 音阶指板训练

### 已实现功能

- 使用音阶定义作为目标公式。
- 手动模式可选择根音/调和音阶类型。
- 随机模式从启用的根音/调池中抽题。
- `选择根音 / 调` 区域为可展开/收起面板。
- 支持升降号同音异名根音，例如 `C#`、`Db`、`B#`、`Cb`。

音阶题库覆盖：

- 大调音阶、自然小调、和声小调、旋律小调。
- 大调五声音阶、小调五声音阶、布鲁斯音阶、大调布鲁斯音阶。
- Dorian、Phrygian、Lydian、Mixolydian、Locrian。
- Locrian natural 2、Lydian dominant、Altered。
- Whole-tone、diminished W-H、diminished H-W。
- Bebop dominant、Bebop major、minor-major bebop、Mixolydian b9 b13。

### 满足的需求

- 支持指板音阶训练。
- 支持随机调性池。
- 选择调/根音部分需要可以展开或收起。
- 指板目标音需要显示符合上下文的音名和音级。

### 实现位置

- `web/src/features/scale-training/ScaleTraining.tsx`
- `web/src/shared/fretboard/FretboardPractice.tsx`
- `web/src/shared/music/theory.ts`
- `web/src/shared/music/spelling.ts`

### 边界

- 当前随机音阶类型使用完整音阶题库，不提供单独的随机音阶类型池。

## 二维指板

### 已实现功能

- 显示 6 根弦和空弦 + 指定品位。
- 支持 12、15、17 品。
- 支持图表视角和第一人称方向的品位排列。
- 支持 1 弦在上或 1 弦在下。
- 支持显示音名和音级。
- 通过样式区分已选、正确目标、错误选择、范围外禁用。
- 每个位置都是 button，具备基本无障碍标签。

### 满足的需求

- 指板训练需要能点选位置。
- 指板训练需要能显示音名、音级和正确/错误反馈。
- 用户需要能调整琴弦顺序和视角。

### 实现位置

- `web/src/shared/fretboard/Fretboard.tsx`
- `web/src/shared/music/fretboard.ts`

### 边界

- 二维指板是训练图表，不模拟真实吉他外观。

## 三维第一人称指板

### 已实现功能

- 使用 Three.js 渲染 3D 吉他指板。
- 显示琴颈、琴头、nut、弦钮、品丝、品记、琴弦和目标 marker。
- 场景中有 `琴头` 标签。
- 画面固定显示 `琴头端` 和 `琴身端`。
- 默认第一人称视角下 6 弦更接近镜头。
- 支持拖拽旋转观察。
- 支持点击 3D marker 作答。
- 拖拽移动超过阈值时不会误判为点击。
- 组件重建和卸载时释放 Three.js geometry、material、texture 和 renderer。

### 满足的需求

- 提供第一人称吉他指板。
- 第一人称视角需要分清琴头方向。
- 第一人称视角默认应该是 6 弦更接近镜头。
- 3D 指板需要能参与训练交互，而不只是静态展示。

### 实现位置

- `web/src/shared/fretboard/Fretboard3D.tsx`
- `web/src/shared/fretboard/Fretboard.test.tsx`
- `web/scripts/verify-3d-playwright.mjs`

### 边界

- 3D 比例用于清楚训练，不承诺真实制琴尺寸精度。
- 当前不支持真实吉他模型导入或材质贴图资产。

## 音名拼写与音乐理论

### 已实现功能

- 用 pitch class 表示半音集合。
- 用 `RootOption` 保留根音字母和升降号。
- 根据音级决定目标字母，再计算升降号。
- 支持同音异名根音在显示上保持上下文正确。
- 提供音程、和弦、音阶静态题库。
- 提供随机选择、洗牌和 pitch class 转调 helper。

### 满足的需求

- 指板上不仅要显示 pitch class，还要显示和当前根音/调性相关的音名。
- 随机题目需要可靠抽取。
- 和弦/音阶训练需要稳定可复现的定义来源。

### 实现位置

- `web/src/shared/music/types.ts`
- `web/src/shared/music/theory.ts`
- `web/src/shared/music/spelling.ts`
- `web/src/shared/music/midi.ts`

### 边界

- 当前音名拼写覆盖训练公式所需场景，不实现完整乐谱记谱系统。

## 音频播放

### 已实现功能

- 使用浏览器 Web Audio API。
- MIDI 转频率。
- pitch class 转 MIDI。
- triangle oscillator 合成音色。
- lowpass filter 和 gain envelope 控制音色和包络。
- 音程支持错开发声。
- 和弦和目标音支持同时或按参数错开发声。

### 满足的需求

- 听力训练和指板训练目标音都需要可播放。
- 项目应自包含，不依赖手动下载音频文件。

### 实现位置

- `web/src/shared/audio/synth.ts`

### 边界

- 当前是简洁合成器，不是吉他真实采样。

## 本地数据保存、导入和导出

### 已实现功能

- 设置和统计保存在 `localStorage`。
- 存储 key：`guitar-learning-assistant:progress:v1`。
- 数据结构版本：`version: 1`。
- 导出文件名：`guitar-training-progress.json`。
- 支持导入 JSON。
- 导入时归一化设置、统计、随机池和听力音域。
- 非法或缺失字段回退到默认值。
- 统计保证非负，并保证 `correct <= attempts`。

### 满足的需求

- 用户训练数据需要本地保存。
- 用户需要能迁移或备份训练数据。
- 旧数据或不完整数据不应破坏应用启动。

### 实现位置

- `web/src/shared/storage/types.ts`
- `web/src/shared/storage/localStorageAdapter.ts`

### 边界

- 当前没有云备份、自动同步或账号登录。
- 导入文件只支持当前 `version: 1` 数据结构。

## Web 本地运行

### 已实现功能

- Vite 开发服务。
- 构建后的 `web/dist` 可由本地静态服务器托管。
- WSL/Windows 启动脚本会尝试自动打开浏览器。
- 本地静态服务器支持 heartbeat 和 page closed 通知，页面关闭后自动退出。
- SPA fallback 到 `index.html`。

### 满足的需求

- 源码开发者可以直接运行项目。
- 普通静态产物可以自包含运行。
- Windows 和 WSL 使用场景都能覆盖。

### 实现位置

- `web/scripts/launch-dev.mjs`
- `web/scripts/start-windows.ps1`
- `web/src/shared/runtime/localServerHeartbeat.ts`

### 边界

- 本地静态服务只面向本机开发/运行，不是生产 Web 服务。

## Electron 桌面应用

### 已实现功能

- Electron 主进程加载 `web/dist`。
- 打包态从 Electron resources 的 `web-dist` 加载。
- 窗口默认 1280x860，最小 1024x720。
- 禁用 Node integration。
- 启用 context isolation 和 sandbox。
- 阻止主窗口导航到外部 URL，外链交给系统浏览器。
- 移除默认菜单。
- `userData` 目录固定为 `Guitar Training`，便于 localStorage 持久化。

### 满足的需求

- 普通 Windows 用户需要可双击运行的桌面应用。
- 桌面应用不应要求用户手动启动 Web 服务。
- 桌面壳应尽量保持简单，不重复 Web 业务逻辑。

### 实现位置

- `desktop/src/main.cjs`
- `desktop/package.json`

### 边界

- 当前只配置 Windows portable 目标。
- 没有自动更新机制。

## Windows 打包和 v1.0 exe

### 已实现功能

- 普通打包命令：`npm run desktop:package:win`。
- v1.0 portable 产物名：`Guitar-Training-v1.0-windows-portable.exe`。
- Electron Builder 把 `web/dist` 打入 `web-dist` 资源目录。
- `desktop/scripts/start-windows-desktop.ps1` 优先启动 v1.0 portable exe。

### 满足的需求

- 需要生成 Windows `.exe` 文件。
- 当前版本命名为第一版，exe 文件名要体现 v1.0。
- 拿到代码仓库的人能按文档流程重新打包。

### 实现位置

- `desktop/package.json`
- `desktop/scripts/start-windows-desktop.ps1`
- `docs/v1.0/build-and-release.md`

### 边界

- 普通打包产物没有公开可信代码签名证书。
- `desktop/release/` 是生成目录，不提交到 Git。

## Windows Smart App Control 本机签名备用方案

### 已实现功能

- 备用命令：`npm run desktop:package:win:local-signed`。
- 脚本执行前说明它会修改当前 Windows 用户证书信任区。
- 必须输入 `SMART APP CONTROL BLOCKED` 才会继续。
- 只在普通未签名 portable exe 被当前电脑 Smart App Control 阻止时使用。
- 创建或复用当前用户自签名代码签名证书。
- 将证书加入当前用户 Trusted Root 和 Trusted Publishers。
- 签名 unpacked 内部 exe。
- 生成并签名最终 portable exe。
- 默认不请求外部时间戳服务，避免备用方案依赖外部网络。
- 提供移除命令：`npm run desktop:remove-local-dev-signing`。

### 满足的需求

- 暂时不购买正式代码签名证书时，需要临时解决方案。
- 备用方案执行前必须告知用户它会做什么。
- 备用方案只有必要时才能执行。
- 生成的 exe 在当前电脑当前用户下应能直接打开。

### 实现位置

- `desktop/scripts/package-win-local-signed.mjs`
- `desktop/scripts/sign-windows-local-dev.ps1`
- `desktop/scripts/package-win-local-signed.ps1`
- `desktop/scripts/remove-local-dev-signing.mjs`
- `desktop/scripts/remove-local-dev-signing.ps1`
- `package-guitar-training-local-signed.cmd`

### 边界

- 这是本机当前用户信任方案，不是公开发行签名。
- 换到其它 Windows 电脑后，对方不会自动信任这个证书。
- 真正面向所有 Windows 电脑的长期方案仍是公开代码签名证书或 Microsoft Store。

## 文档、测试和维护

### 已实现功能

- README 保留项目由 OpenAI Codex 在人工需求和文档指导下生成并维护的说明。
- 用户需求原文保存在 `docs/requirements/`。
- 执行和验证记录保存在 `log/`。
- v1.0 文档包含架构、构建发布、代码函数参考和本文档。
- 单元测试覆盖听力题目、音乐理论、音名拼写、指板计算、音频纯函数和存储逻辑。
- 3D 指板提供 Playwright 验证脚本。

### 满足的需求

- 项目需要可复现、可接手、可解释。
- 每次任务后需要记录需求和执行结果。
- 代码架构、功能、需求和函数职责需要有详细文档。

### 实现位置

- `README.md`
- `docs/`
- `log/`
- `web/src/**/*.test.ts`
- `web/scripts/verify-3d-playwright.mjs`

### 边界

- 历史内容主要由 Git 保存；当前工作树尽量保留一个现行入口，避免重复维护多份同类报告。

## 需求满足总表

| 需求 | v1.0 满足情况 | 说明 |
| --- | --- | --- |
| 吉他学习辅助工具 | 已满足 | Web + Electron 桌面应用。 |
| 听力训练 | 已满足 | 音程听力和和声听力。 |
| 指板琶音训练 | 已满足 | 和弦公式 + 指板点选。 |
| 指板音阶训练 | 已满足 | 音阶公式 + 指板点选。 |
| 本地统计 | 已满足 | 四个训练区域分别统计并汇总。 |
| 本地保存 | 已满足 | localStorage。 |
| 数据导入导出 | 已满足 | JSON 导入导出。 |
| 音程上下行 | 已满足 | 随机上下行、上行、下行。 |
| 听力音域配置 | 已满足 | A0-C8 内可选，最小一八度。 |
| 指板显示音名/音级 | 已满足 | 可分别开关。 |
| 手动/随机出题 | 已满足 | 琶音和音阶共用。 |
| 随机根音/调选择 | 已满足 | 可折叠选择池。 |
| 琶音随机和弦选择 | 已满足 | 可折叠选择池。 |
| 默认随机七和弦池 | 已满足 | `7`、`maj7`、`min7`、`m7b5`、`dim7`。 |
| 选择和弦/根音可收起 | 已满足 | 原生 `details` / `summary`。 |
| 二维指板 | 已满足 | 可点选、可反馈。 |
| 3D 第一人称指板 | 已满足 | Three.js 场景 + 点击交互。 |
| 3D 琴头方向清楚 | 已满足 | `琴头`、`琴头端`、`琴身端`。 |
| 默认 6 弦近镜头 | 已满足 | 默认相机和弦坐标配置。 |
| Windows exe | 已满足 | v1.0 portable exe。 |
| Smart App Control 临时方案 | 已满足，有边界 | 当前用户本机签名备用方案。 |
| 备用方案执行前提醒 | 已满足 | 必须输入确认短语。 |
| 备用方案仅必要时执行 | 已满足于流程和文档 | 脚本提示 + 文档约束；不能技术性判断每台电脑是否被阻止。 |
| 第一版 v1.0 命名 | 已满足 | 文档、版本号和 exe 名称已更新。 |
| 详细文档 | 已满足 | 本文 + 架构、构建发布、代码参考文档。 |

## 明确不属于 v1.0 的范围

- 公开可信代码签名证书。
- Microsoft Store 发布。
- 云同步或账号系统。
- 自定义调弦、变调夹、真实吉他指法评分。
- 真实吉他采样音源。
- 自动更新。
- 多平台桌面安装包。
