# v1.0 系统架构

## 总览

Guitar Learning Assistant v1.0 由两个运行层组成：

- Web 应用层：`web/`，Vite + React + TypeScript，包含全部训练业务逻辑。
- 桌面壳层：`desktop/`，Electron，负责加载构建后的 Web 应用并生成 Windows portable exe。

核心原则：

- 训练业务逻辑只在 Web 层实现。
- Electron 不直接参与音乐理论、判题或存储结构，只提供桌面窗口和打包能力。
- 所有训练数据本地保存，不依赖后端服务。
- 音频由浏览器 Web Audio API 合成，不依赖外部音频资产。

## 目录职责

```text
web/src/
  App.tsx                         主界面、导航、全局设置和统计汇总
  main.tsx                        React 挂载入口
  styles.css                      全局样式
  features/
    ear-training/                 听力训练 UI 和题目生成
    arpeggio-training/            琶音训练入口
    scale-training/               音阶训练入口
  shared/
    audio/                        Web Audio 合成器
    fretboard/                    二维/三维指板 UI 和共享练习组件
    music/                        音乐理论数据、指板模型、题目工具、音名拼写
    runtime/                      本地静态服务心跳
    storage/                      localStorage 数据结构和适配器

desktop/
  src/main.cjs                    Electron 主进程
  scripts/                        Windows 打包、本机签名和移除签名脚本
  package.json                    Electron Builder 配置

docs/
  requirements/                   用户需求原文
  v1.0/                           第一版正式文档

log/
  *.md                            执行、错误和验证记录
```

## Web 应用数据流

启动流程：

1. `web/src/main.tsx` 查找 `#root`。
2. 启动本地静态服务心跳 `startLocalServerHeartbeat()`。
3. React StrictMode 渲染 `App`。
4. `App` 从 `storageAdapter.getProgress()` 初始化设置和统计。

全局状态：

- `progress.settings`：用户设置。
- `progress.stats`：四个训练区域统计。
- `activeFeature`：当前功能页。
- `helpOpen`：使用说明弹窗状态。
- `dataStatus`：导入导出/重置反馈。

设置更新：

1. 子组件调用 `onUpdateSettings(partial)`。
2. `App.updateSettings` 合并设置。
3. `storageAdapter.saveSettings` 写入 localStorage。
4. `App` 重新读取标准化后的 progress。

答题统计：

1. 子组件调用 `onRecordAttempt(area, correct)`。
2. `storageAdapter.recordAttempt` 更新 attempts、correct、streak、bestStreak 和 lastPracticedAt。
3. `App` 用返回值刷新 UI。

## 听力训练架构

听力训练分为 UI 和题目生成两层：

- UI：`web/src/features/ear-training/EarTraining.tsx`
- 题目生成：`web/src/features/ear-training/challenges.ts`

音程题目生成：

1. 根据设置得到 `EarTrainingMidiRange`。
2. 从启用的 interval pool 中随机选一个 `IntervalDefinition`。
3. 根据方向计算合法根音 MIDI 范围。
4. 在合法范围内随机根音。
5. 输出 `rootMidi`、`secondMidi`、`interval`、`direction`。

和弦题目生成：

1. 从 `CHORD_QUALITIES` 随机选和弦性质。
2. 根据和弦最高 interval 计算根音 MIDI 范围。
3. 随机根音。
4. 输出根音 pitch class、根音 MIDI、和弦性质和 MIDI 音列表。

播放：

- 音程使用 `playMidiNotes`，通过 `stagger` 参数顺序播放两个音。
- 和弦使用 `playMidiNotes`，`stagger: 0` 同时发声。

## 指板训练架构

琶音训练和音阶训练共用同一个练习组件：

- `ArpeggioTraining` 传入 `CHORD_QUALITIES`。
- `ScaleTraining` 传入 `SCALE_DEFINITIONS`。
- `FretboardPractice` 负责出题、选择状态、判题、统计和渲染二维/三维指板。

题目构建：

1. 确定根音 `RootOption`。
2. 确定 definition（和弦或音阶）。
3. 随机生成品位范围。
4. 用根音和 intervals 计算目标 pitch classes。
5. 用 `spellFormula` 根据根音字母和音级拼出上下文音名。
6. 调用 `createFretboardChallenge` 生成 `FretboardChallenge`。

随机模式：

- 根音从 `enabledFretboardRootIds` 中抽取。
- 琶音和弦从 `enabledArpeggioChordIds` 中抽取。
- 音阶当前使用全部 `SCALE_DEFINITIONS`。

判题：

- `find-all` 使用 `evaluateFindAllPositions` 比对目标位置集合和已选位置集合。
- `single-note` 使用 `evaluateSingleNote` 校验单一 pitch class。
- `route` 使用 `evaluateRoute` 校验选择顺序。

## 二维指板架构

`Fretboard` 是纯 React 组件：

- 根据 `makeFretboard(fretCount)` 生成所有弦/品位。
- `orderStringGroups` 根据琴弦顺序调整纵向排列。
- `orderFrettedPositions` 根据图表/第一人称视角调整横向品位方向。
- 每个位置渲染为 button，支持键盘/屏幕阅读器访问。
- 通过 class 区分 selected、target、wrong、out-of-range。

二维组件不持有训练状态；所有状态来自 `FretboardPractice`。

## 三维指板架构

`Fretboard3D` 使用 Three.js：

- 第一个 effect 初始化 scene、camera、renderer、OrbitControls、灯光、ResizeObserver 和动画循环。
- 第二个 effect 根据题目和设置重建指板几何体、marker 和文字 sprite。
- 第三个 effect 绑定 pointer 事件，用 raycaster 将点击映射回 `FretPosition`。

资源管理：

- 每次重建 content 前调用 `disposeObject` 释放 geometry、material 和 texture。
- 组件卸载时取消 animation frame、断开 ResizeObserver、dispose controls 和 renderer。

视角设计：

- `BOARD_LENGTH` 和 `BOARD_WIDTH` 定义场景比例。
- `NUT_Z` 表示琴头/nut 端。
- `BODY_Z` 表示琴身端。
- `PLAYER_CAMERA_X` 定义默认第一人称横向偏移。
- `stringXPositions` 决定每根弦在 x 轴的位置，默认让 6 弦更靠近镜头。

## 音乐理论层

`web/src/shared/music/` 是业务核心：

- `types.ts` 定义所有跨模块类型。
- `theory.ts` 定义音名、音程、和弦、音阶和随机工具。
- `midi.ts` 定义听力训练 MIDI 范围。
- `fretboard.ts` 定义标准调弦、指板位置和判题 helper。
- `fretboardTrainer.ts` 定义指板题目结构生成。
- `spelling.ts` 负责根据根音和音级拼写上下文音名。

同音异名处理：

- pitch class 只表示 0-11 的半音集合。
- `RootOption` 保留字母和升降号。
- `spellPitchForDegree` 先根据音级决定目标字母，再计算需要的升降号。
- 这样 `C#` 和 `Db` 的音阶/和弦在指板上 pitch class 相同，但显示音名不同。

## 存储架构

`LocalStorageAdapter` 是唯一持久化入口：

- `getProgress` 读取并标准化数据。
- `saveSettings` 保存设置。
- `recordAttempt` 更新统计。
- `importProgress` 校验导入文件。
- `resetProgress` 重置到默认值。

安全归一化：

- 非法 JSON 回退到默认进度。
- 不支持的 `version` 抛出错误。
- 非法设置字段回退到 `DEFAULT_SETTINGS`。
- 统计数字被限制为非负，并保证 `correct <= attempts`。

## 音频架构

音频层位于 `web/src/shared/audio/synth.ts`：

- 延迟创建单例 `AudioContext`。
- MIDI 转频率使用 A4 = 440Hz。
- 每个音使用 triangle oscillator。
- 每个音经过 lowpass filter 和 gain envelope。
- 音程、和弦和目标 pitch class 播放都复用 `playMidiNotes`。

## 桌面架构

Electron 主进程位于 `desktop/src/main.cjs`：

- 开发态加载 `../web/dist`。
- 打包态加载 `process.resourcesPath/web-dist`。
- 创建 1280x860 主窗口，最小 1024x720。
- 设置 `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`。
- 去除菜单。
- 外部链接用系统浏览器打开，主窗口不导航离开本地应用。
- `userData` 固定到 `Guitar Training`。

## 本地静态服务架构

`web/scripts/launch-dev.mjs` 和 `web/scripts/start-windows.ps1` 支持两种模式：

- 如果存在 `web/dist/index.html`，启动本地静态服务器并打开浏览器。
- 如果不存在 dist，启动 Vite dev server。

静态服务器：

- 端口范围 5190-5289。
- 支持 SPA fallback 到 `index.html`。
- 通过 heartbeat 和 page closed endpoint 在页面关闭后自动退出。

## Windows 打包与签名架构

普通打包：

1. 构建 `web/dist`。
2. Electron Builder 把 `web/dist` 作为 extraResources 放入 `web-dist`。
3. 输出 `desktop/release/Guitar-Training-v1.0-windows-portable.exe`。

本机签名备用流程：

1. Node 脚本显示警告并要求确认短语。
2. 安装依赖并构建 Web。
3. 先生成 `win-unpacked`。
4. PowerShell 创建/复用本机代码签名证书。
5. 当前用户信任该证书。
6. 签名 unpacked 内 exe。
7. 基于签名后的 unpacked 生成 portable exe。
8. 签名最终 portable exe。

这个设计把 Smart App Control 备用方案留在工具链中，但用交互确认降低误用风险。
