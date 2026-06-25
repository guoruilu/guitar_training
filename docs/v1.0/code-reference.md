# v1.0 代码与函数参考

本文按源码文件说明 v1.0 代码职责。重点覆盖生产代码、脚本和测试文件的功能边界。
`package-lock.json` 属于依赖锁文件，不逐项解释依赖内部实现。

## 根目录配置

### `package.json`

根 npm 工作入口。

- `version: 1.0.0`：第一版对应的 semver。
- `dev` / `web:dev`：启动 Web Vite 开发服务。
- `test` / `web:test`：运行 Web Vitest。
- `build` / `web:build`：类型检查并构建 Web。
- `desktop:dev`：构建 Web 后启动 Electron。
- `desktop:package:win`：生成普通 Windows portable exe。
- `desktop:package:win:local-signed`：执行带交互确认的本机开发签名备用打包。
- `desktop:remove-local-dev-signing`：移除当前用户本机开发签名证书信任。

### `package-guitar-training-local-signed.cmd`

Windows 双击入口，用于运行本机签名备用打包流程。实际逻辑仍在 npm script 和
`desktop/scripts/package-win-local-signed.mjs` 中。

## Web 入口

### `web/src/main.tsx`

React 应用入口。

- `root`：读取 DOM 中的 `#root` 容器；如果不存在直接抛错，避免静默空白页面。
- `startLocalServerHeartbeat()`：在 React 挂载前启动本地静态服务器心跳。
- `createRoot(root).render(...)`：用 React StrictMode 渲染 `App`。

### `web/src/App.tsx`

应用壳组件，负责全局导航、设置、统计、数据导入导出和功能页切换。

- `FeatureKey`：当前主功能页 union 类型，值为 `ear`、`arpeggio`、`scale`。
- `NAV_ITEMS`：顶部导航按钮配置。
- `combineStats(stats)`：汇总多个训练区域统计，计算总次数、总正确数、正确率和最佳连续正确。
- `App()`：主 React 组件。它读取本地进度，维护当前功能页、数据状态和说明弹窗。
- `updateSettings(partial)`：合并用户设置，保存到 storage，并刷新 `progress`。
- `recordAttempt(area, correct)`：把一次答题结果写入对应训练区域统计。
- `resetProgress()`：重置 localStorage 中的进度并显示反馈。
- `exportProgress()`：把当前进度导出为 `guitar-training-progress.json`。
- `importProgressFile(file)`：读取用户选择的 JSON 文件，调用 storage 校验导入，失败时显示错误。

### `web/src/styles.css`

全局样式文件。它定义应用布局、主题变量、训练面板、按钮、表单、二维指板、三维指板容器、
折叠选择器、统计块、反馈状态和弹窗样式。

## 听力训练

### `web/src/features/ear-training/EarTraining.tsx`

听力训练 UI 与交互。

- `EarTrainingProps`：父组件传入的设置、统计和回调。
- `EarTab`：听力训练 tab，值为 `interval` 或 `chord`。
- `rangeFromSettings(settings)`：从用户设置中取 MIDI 音域，并用 `normalizeEarTrainingRange` 归一化。
- `EarRangeControls(...)`：最低音/最高音选择器组件。
- `updateMin(nextMin)`：更新最低 MIDI 音，必要时自动调整最高音以保持最小跨度。
- `updateMax(nextMax)`：更新最高 MIDI 音，必要时自动调整最低音以保持最小跨度。
- `accuracy(stats)`：把统计转换为百分比字符串。
- `StatsLine({ stats })`：显示次数、正确率、当前连续和最佳连续。
- `IntervalTrainer(...)`：音程听力训练组件。
- `play(challengeToPlay)`：播放当前或指定音程题目。
- `next()`：生成下一道音程题，清空作答状态并播放。
- `answer(interval)`：校验用户选择的音程并记录统计；已作答时直接返回。
- `toggleInterval(intervalId)`：切换音程题库勾选项，至少保留一个。
- `selectAllIntervals()`：恢复全部音程题库。
- `ChordTrainer(...)`：和声听力训练组件。
- `play(challengeToPlay)`：播放当前或指定和弦题目。
- `next()`：生成下一道和弦题，清空作答状态并播放。
- `answer(quality)`：校验用户选择的和弦性质并记录统计。
- `EarTraining(...)`：听力训练总组件，管理音程/和声 tab，并渲染音域控件。

### `web/src/features/ear-training/challenges.ts`

听力训练题目生成和范围校验。

- `IntervalChallenge`：音程题结构，包含两个 MIDI 音、音程定义和方向。
- `ChordChallenge`：和弦题结构，包含根音、和弦性质和 MIDI 音列表。
- `randomMidiInRange(minInclusive, maxInclusive)`：在闭区间内随机选择 MIDI 音；非法范围抛错。
- `intervalRootMidiRange(interval, direction, range)`：计算给定音程和方向下合法的根音 MIDI 范围。
- `chordRootMidiRange(quality, range)`：计算给定和弦性质下合法的根音 MIDI 范围，确保最高音不越界。
- `createIntervalChallenge(direction, intervalPool, range)`：生成音程题；空题库时回退到全部音程。
- `createChordChallenge(range)`：生成和弦题，保证所有和弦音在听力音域内。
- `allMidiNotesInEarTrainingRange(midiNotes, range)`：判断一组 MIDI 音是否全部在听力音域内。

### `web/src/features/ear-training/challenges.test.ts`

听力题目单元测试。

- 覆盖 MIDI 范围随机、音程根音范围、和弦根音范围、题目生成边界和音域校验。

## 琶音与音阶入口

### `web/src/features/arpeggio-training/ArpeggioTraining.tsx`

琶音训练薄入口。

- `ArpeggioTrainingProps`：设置、统计和回调。
- `ArpeggioTraining(...)`：把 `CHORD_QUALITIES` 作为 definitions 传给 `FretboardPractice`，
  并指定训练区域为 `arpeggio`。

### `web/src/features/scale-training/ScaleTraining.tsx`

音阶训练薄入口。

- `ScaleTrainingProps`：设置、统计和回调。
- `ScaleTraining(...)`：把 `SCALE_DEFINITIONS` 作为 definitions 传给 `FretboardPractice`，
  并指定训练区域为 `scale`。

## 指板 UI 与训练组件

### `web/src/shared/fretboard/FretboardPractice.tsx`

琶音和音阶共用的训练控制器。

- `FretboardDefinition`：统一表示和弦或音阶定义，包含 id、label、symbol、intervals、degrees。
- `FretboardPracticeProps`：练习组件入参。
- `ResultState`：当前题反馈状态，包含 idle、pending、answered。
- `MODES`：三种练习模式：`find-all`、`single-note`、`route`。
- `selectedPositionsFromKeys(keys, fretCount)`：把 UI 保存的 key 转回 `FretPosition`。
- `buildTitle(root, definition)`：生成题目标题，例如根音加和弦 symbol。
- `challengeNoteLabel(challenge, pitchClass)`：优先返回目标公式中的上下文音名，否则返回普通 pitch class 音名。
- `positionPitchName(pitchClass)`：把 pitch class 转为显示音名。
- `formatPosition(position, challenge)`：把某个指板位置格式化为中文反馈文本。
- `targetPositionsForChallenge(fretCount, challenge)`：找出当前品位范围内所有目标位置。
- `buildChallenge(root, definition, mode, fretCount)`：构建指板题，包含随机品位范围、目标 pitch class 和音名拼写。
- `accuracy(stats)`：计算训练区域正确率。
- `targetLabelList(challenge, separator)`：把目标公式拼为提示字符串。
- `questionModeKey(area)`：把训练区域映射到对应设置字段。
- `definitionShortLabel(definition)`：返回和弦/音阶在选择器里的短标签。
- `FretboardPractice(...)`：主组件，管理根音、类型、模式、题目、选择、判题和统计。
- `resetChallenge()`：根据手动/随机模式生成下一题并清空选择。
- `updateQuestionMode(nextMode)`：保存手动/随机出题方式。
- `toggleRootInPool(root)`：切换随机根音池，至少保留一个根音。
- `toggleArpeggioChordInPool(item)`：切换琶音随机和弦池，至少保留一个和弦。
- `useDefaultArpeggioChordPool()`：恢复默认琶音随机和弦池。
- `togglePosition(position)`：处理二维/三维指板点击；按练习模式更新选择集合。
- `submitAnswer()`：按当前模式判题、生成反馈并记录统计。
- `promptText()`：生成当前题的中文提示。

### `web/src/shared/fretboard/Fretboard.tsx`

二维指板组件。

- `FretboardProps`：二维指板入参。
- `labelForPosition(...)`：根据用户设置和题目状态决定位置内显示的音名/音级。
- `ariaPositionLabel(position)`：生成 screen reader 可读的位置描述。
- `orderStringGroups(positions, stringOrder)`：按用户设置排列 1-6 弦的纵向顺序。
- `orderFrettedPositions(positions, viewMode)`：第一人称视角下反转横向品位顺序。
- `Fretboard(...)`：渲染二维指板网格。
- `renderPositionButton(position, isOpenString)`：渲染单个空弦或品位按钮，并绑定选择、禁用和反馈 class。

### `web/src/shared/fretboard/Fretboard.test.tsx`

二维/三维指板相关测试。

- 覆盖琴弦排序、品位排序、3D 默认相机与琴弦近侧关系等行为。

### `web/src/shared/fretboard/Fretboard3D.tsx`

三维第一人称指板组件。

- `Fretboard3DProps`：3D 指板入参。
- `BOARD_LENGTH`：3D 琴颈长度常量。
- `BOARD_WIDTH`：3D 琴颈宽度常量。
- `NUT_Z`：nut/琴头端 z 坐标。
- `BODY_Z`：琴身端 z 坐标。
- `PLAYER_CAMERA_X`：第一人称相机横向偏移，默认使 6 弦更靠近镜头。
- `makeTextSprite(text, background, color, scale)`：用 canvas 生成 Three.js Sprite 文字标签。
- `disposeObject(object)`：释放 Three.js 对象树中的 geometry、material 和 texture。
- `stringXPositions(stringOrder)`：计算每根弦在 3D 场景中的 x 坐标。
- `fretCenterZ(fret, fretCount)`：计算某品位 marker 的 z 坐标；空弦位于 nut 外侧。
- `labelForPosition(...)`：生成 3D marker 上方的音名/音级文本。
- `Fretboard3D(...)`：3D 指板 React 组件。
- 初始化 effect：创建 scene、camera、renderer、OrbitControls、灯光、ResizeObserver 和动画循环。
- 内容 effect：重建琴颈、琴头、弦钮、nut、品丝、品记、琴弦、marker 和文字标签。
- 点击 effect：监听 pointer down/up，用 raycaster 命中 marker 并调用 `onToggle`。

## 音乐理论与训练算法

### `web/src/shared/music/types.ts`

跨模块类型定义。

- `PitchClass`：0-11 的半音集合。
- `IntervalDefinition`：音程定义。
- `ChordQuality`：和弦性质定义。
- `ScaleDefinition`：音阶定义。
- `FretPosition`：某弦某品的位置和 pitch class。
- `FretboardRange`：品位范围。
- `FretboardExerciseMode`：指板练习模式。
- `FretboardChallenge`：指板题目结构。

### `web/src/shared/music/theory.ts`

音乐理论基础数据和随机工具。

- `NOTE_NAMES_SHARP`：默认升号音名数组。
- `PITCH_CLASS_BY_NAME`：常见升降号音名到 pitch class 的映射。
- `INTERVALS`：音程题库。
- `CHORD_QUALITIES`：和弦性质题库。
- `DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS`：琶音随机默认和弦池。
- `normalizeChordQualityIds(ids, fallback)`：清洗和弦 id 列表，去重、过滤非法值并回退默认值。
- `SCALE_DEFINITIONS`：音阶题库。
- `normalizePitchClass(value)`：把任意整数归一化到 0-11。
- `noteName(pitchClass)`：把 pitch class 转成默认升号音名。
- `transpose(root, semitones)`：从根音转调指定半音。
- `pitchClassesFromIntervals(root, intervals)`：把公式 intervals 转为 pitch class 列表。
- `chordLabel(root, quality)`：生成根音加和弦 symbol 的标签。
- `getChordQuality(id)`：按 id 查找和弦性质，找不到则抛错。
- `getScaleDefinition(id)`：按 id 查找音阶定义，找不到则抛错。
- `randomInt(maxExclusive)`：生成无偏随机整数，优先使用 Web Crypto。
- `randomItem(items)`：从非空列表中随机取一项。
- `shuffled(items)`：Fisher-Yates 洗牌并返回新数组。

### `web/src/shared/music/theory.test.ts`

理论工具测试。

- 覆盖 pitch class 归一化、转调、公式展开、随机边界和非法输入。

### `web/src/shared/music/midi.ts`

听力训练 MIDI 音域工具。

- `EAR_TRAINING_MIN_MIDI`：听力最低 MIDI，A0。
- `EAR_TRAINING_MAX_MIDI`：听力最高 MIDI，C8。
- `EAR_TRAINING_RANGE_LABEL`：默认范围文本。
- `EAR_TRAINING_MIN_SPAN`：最小音域跨度，一个八度。
- `EarTrainingMidiRange`：听力 MIDI 范围类型。
- `DEFAULT_EAR_TRAINING_RANGE`：默认听力范围。
- `EAR_TRAINING_MIDI_OPTIONS`：UI 下拉用完整 MIDI 选项。
- `midiNoteLabel(midi)`：把 MIDI 号转成音名加八度。
- `earTrainingRangeLabel(range)`：把范围转成显示文本。
- `normalizeEarTrainingRange(input)`：归一化输入范围，限制边界并保持最小跨度。

### `web/src/shared/music/fretboard.ts`

标准吉他指板模型和判题 helper。

- `STANDARD_TUNING`：标准调弦 E A D G B E 的 pitch class。
- `positionKey(position)`：把弦索引和品位转成稳定 key。
- `parsePositionKey(key)`：解析 `stringIndex:fret` key。
- `getPitchAt(stringIndex, fret, tuning)`：计算某弦某品 pitch class。
- `makeFretboard(fretCount, tuning)`：生成所有弦和品位位置。
- `isTargetPosition(position, targetPitchClasses)`：判断位置是否属于目标 pitch class。
- `isPositionInFretRange(position, range)`：判断位置是否在当前品位范围。
- `positionsInFretRange(positions, range)`：过滤出范围内位置。
- `coveredPitchClasses(selected, targetPitchClasses)`：计算已选位置覆盖了哪些目标 pitch class。
- `evaluateFindAllPositions(selected, targetPositions)`：集合式判定找全所有目标位置。
- `evaluateFindAll(selected, targetPitchClasses)`：旧式 pitch class 覆盖判定。
- `evaluateSingleNote(selected, targetPitchClass)`：判定单音定位。
- `evaluateRoute(selected, expectedPitchClasses)`：判定路线顺序。

### `web/src/shared/music/fretboardTrainer.ts`

指板题目生成 helper。

- `ROOTS`：12 个 pitch class 根音。
- `MODES`：三种练习模式。
- `DEFAULT_FRET_RANGE_SPAN`：默认随机品位跨度，4 品。
- `randomRoot()`：随机 pitch class 根音。
- `nextMode(current)`：循环取得下一个练习模式。
- `randomFretRange(fretCount, span)`：在 fretCount 内随机生成连续品位范围。
- `fretRangeLabel(range)`：格式化品位范围。
- `createFretboardChallenge(input)`：生成指板题结构，包含目标音、音级、focus 信息和唯一 id。
- `modeLabel(mode)`：把练习模式转为中文标签。

### `web/src/shared/music/spelling.ts`

上下文音名拼写工具。

- `LETTERS`：七个自然音字母。
- `NATURAL_PITCH_CLASSES`：自然音字母到 pitch class 的映射。
- `RootOption`：根音选项，保留字母、升降号和 pitch class。
- `ROOT_OPTIONS`：UI 可选根音/调列表，包含同音异名。
- `DEFAULT_FRETBOARD_ROOT_IDS`：随机根音池默认全选。
- `accidentalText(value)`：把升降号数字转为文本。
- `parseAccidental(text)`：把文本升降号转为数字。
- `rootOption(name)`：从字符串构建 `RootOption`。
- `getRootOption(id)`：按 id 查找根音，失败时回退到 C。
- `normalizeRootIds(ids)`：清洗随机根音池 id 列表。
- `degreeNumber(degree)`：从音级文本提取 1-7 的级数。
- `closestAccidental(targetPitchClass, naturalPitchClass)`：计算目标 pitch class 到自然音的最近升降号。
- `spellPitchForDegree(root, semitones, degree)`：根据根音、半音和音级拼出正确上下文音名。
- `spellFormula(root, intervals, degrees)`：拼写整条和弦/音阶公式。

### `web/src/shared/music/spelling.test.ts`

拼写测试。

- 覆盖同音异名根音、音级字母推进和升降号拼写。

## 音频

### `web/src/shared/audio/synth.ts`

浏览器 Web Audio 合成器。

- `audioContext`：延迟创建的单例 AudioContext。
- `getAudioContext()`：返回或创建 AudioContext。
- `midiToFrequency(midi)`：MIDI 转频率。
- `filterCutoffForMidi(midi)`：根据音高计算 lowpass cutoff。
- `pitchClassToMidi(pitchClass, octave)`：pitch class 加八度转 MIDI。
- `createEnvelope(ctx, start, duration)`：创建短音量包络。
- `playMidiNotes(midiNotes, options)`：播放 MIDI 音列表，支持持续时间和错开发声。
- `buildChordMidiNotes(root, intervals, octave)`：由根音和 intervals 构建和弦 MIDI 音。
- `playPitchClasses(pitchClasses, options)`：把 pitch class 映射到 MIDI 后播放。

### `web/src/shared/audio/synth.test.ts`

音频工具测试。

- 覆盖 MIDI 转频率、pitch class 转 MIDI、和弦 MIDI 构建等纯函数。

## 本地运行时

### `web/src/shared/runtime/localServerHeartbeat.ts`

浏览器端本地静态服务器心跳。

- `LOCAL_SERVER_PORT_MIN` / `LOCAL_SERVER_PORT_MAX`：受管理本地服务器端口范围。
- `HEARTBEAT_PATH`：心跳 endpoint。
- `PAGE_CLOSED_PATH`：页面关闭 endpoint。
- `HEARTBEAT_INTERVAL_MS`：心跳间隔。
- `isManagedLocalServer()`：判断当前页面是否运行在项目管理的本地端口。
- `sendHeartbeat()`：向本地服务器发送 keepalive 心跳。
- `sendPageClosed()`：页面关闭时优先用 beacon 通知服务器。
- `startLocalServerHeartbeat()`：绑定心跳、focus、visibilitychange 和 pagehide。

## 存储

### `web/src/shared/storage/types.ts`

存储类型定义。

- `TrainingArea`：统计区域 union。
- `ThemeMode`：主题模式。
- `IntervalDirection`：音程方向。
- `FretboardViewMode`：指板视角。
- `FretboardStringOrder`：琴弦显示顺序。
- `FretboardQuestionMode`：手动/随机出题。
- `TrainingStats`：训练统计。
- `UserSettings`：用户设置。
- `UserProgress`：完整本地进度，数据结构版本固定为 1。
- `StorageAdapter`：存储适配器接口。

### `web/src/shared/storage/localStorageAdapter.ts`

localStorage 适配器。

- `STORAGE_KEY`：本地存储 key。
- `EXPORT_FILE_NAME`：导出文件名。
- `EMPTY_STATS`：四个训练区域的空统计。
- `DEFAULT_SETTINGS`：默认用户设置。
- `defaultProgress()`：创建全新进度对象。
- `canUseLocalStorage()`：判断当前环境是否可用 localStorage。
- `parseProgress(raw)`：解析 localStorage 字符串，失败时返回默认进度。
- `isRecord(value)`：运行时类型保护，判断对象记录。
- `normalizeStats(value)`：清洗统计对象。
- `normalizeProgress(value)`：清洗完整进度，校验版本、设置和统计。
- `LocalStorageAdapter.getProgress()`：读取当前进度。
- `LocalStorageAdapter.saveSettings(settings)`：保存设置。
- `LocalStorageAdapter.importProgress(progress)`：导入并保存外部进度。
- `LocalStorageAdapter.recordAttempt(area, correct)`：记录一次答题。
- `LocalStorageAdapter.resetProgress()`：重置全部数据。
- `LocalStorageAdapter.save(progress)`：私有写入函数。
- `storageAdapter`：应用使用的单例适配器。

### `web/src/shared/storage/localStorageAdapter.test.ts`

存储测试。

- 覆盖默认进度、设置保存、统计记录、导入归一化、非法数据回退和重置。

## Web 脚本

### `web/scripts/launch-dev.mjs`

跨平台开发/静态启动脚本。

- `runCommand(command, args)`：同步运行命令，失败时退出。
- `installIfNeeded()`：缺少 `node_modules` 时安装依赖。
- `contentTypeFor(path)`：根据扩展名返回 HTTP content type。
- `openExternal(url)`：按 WSL、Windows、macOS、Linux 调用系统方式打开浏览器。
- `pickUrl(text)`：从 Vite 输出中挑选浏览器访问 URL。
- `maybeOpenBrowser()`：检测到 URL 后只打开一次浏览器。
- `createPackagedServer(state)`：创建本地静态 HTTP server，支持 heartbeat、page closed 和 SPA fallback。
- `startPackagedApp()`：在存在 `dist/index.html` 时启动静态服务器。
- `startDevServer()`：在没有 dist 时启动 Vite dev server。

### `web/scripts/start-windows.ps1`

Windows 侧 Web 启动脚本。

- `Get-ContentType(path)`：根据扩展名返回 content type。
- `Start-StaticApp(root)`：启动本地 HttpListener 静态服务器，支持端口递增、heartbeat、page closed 和 SPA fallback。
- `Quote-BashPath(path)`：把 Windows/WSL 路径安全放入 bash 命令。
- 主流程：优先服务 `dist`；否则尝试 WSL；最后尝试 Windows Node。

### `web/scripts/verify-3d-playwright.mjs`

3D 指板 Playwright 验证脚本。

- `baseUrl`：待测页面 URL，可由 `GUITAR_TRAINING_URL` 覆盖。
- `outputDir`：截图和 summary 输出目录。
- `canvasStats(page)`：读取 WebGL canvas 像素，计算非空和有色像素比例。
- `verifyViewport(browser, name, viewport)`：在指定视口验证 3D canvas 渲染、截图和拖拽后仍非空。
- 主流程：启动 Chromium，验证 desktop 和 mobile 两个视口，并写入 summary。

## Electron 桌面层

### `desktop/src/main.cjs`

Electron 主进程。

- `APP_DATA_DIR_NAME`：当前产品本地数据目录名。
- `WINDOW_WIDTH` / `WINDOW_HEIGHT`：默认窗口大小。
- `getWebDistPath()`：打包态返回 resources 中的 `web-dist`，开发态返回仓库 `web/dist`。
- `createWindow()`：创建主窗口、设置安全选项、外链处理、移除菜单并加载 `index.html`。
- `appDataPath`：派生用户数据目录。
- `app.whenReady()`：应用准备后创建窗口并处理 macOS activate。
- `window-all-closed` handler：非 macOS 平台关闭所有窗口后退出。

### `desktop/package.json`

Electron 包配置。

- `version: 1.0.0`：第一版 semver。
- `package:win`：构建 Web 并生成 portable exe。
- `package:win:local-signed`：执行 Node 本机签名打包入口。
- `build.extraResources`：把 `../web/dist` 打入 Electron resources 的 `web-dist`。
- `build.portable.artifactName`：固定输出 `Guitar-Training-v1.0-windows-portable.exe`。

## Windows 打包与签名脚本

### `desktop/scripts/package-win-local-signed.mjs`

WSL/Windows 可用的本机签名打包主入口。

- `scriptDir` / `desktopDir` / `repoRoot` / `webDir` / `releaseDir` / `unpackedDir`：路径常量。
- `signScript`：PowerShell 签名 helper 路径。
- `confirmationPhrase`：必须输入的确认短语。
- `run(command, args, cwd)`：运行子命令并继承 stdio。
- `commandName(base)`：Windows 下补 `.cmd`。
- `electronBuilderCommand()`：定位 `electron-builder` CLI。
- `toWindowsPath(filePath)`：把 WSL 路径转换成 Windows 路径。
- `powershellCommand()`：返回 PowerShell 命令名。
- `listExeFiles(directory)`：递归列出 exe 文件。
- `latestPortableExe()`：从 release 目录选择最新 portable exe。
- `signFiles(filePaths)`：调用 PowerShell 签名脚本，传入 `-ConfirmedLocalDevSigning` 和 `-NoTimestamp`。
- `confirmLocalSigning()`：打印风险说明并要求输入确认短语。
- `main()`：确认、安装依赖、构建 Web、生成 unpacked、签名、生成 portable、签名最终 exe。

### `desktop/scripts/sign-windows-local-dev.ps1`

PowerShell 单文件/多文件本机签名 helper。

- 参数 `FilePath`：要签名的 exe 列表。
- 参数 `CertificateSubject`：本机开发证书 subject。
- 参数 `CertificateYears`：证书有效年限。
- 参数 `ConfirmedLocalDevSigning`：上层已确认时跳过二次提示。
- 参数 `NoTimestamp`：跳过外部时间戳服务器。
- `Confirm-LocalDevSigning`：打印警告并要求确认短语。
- `Get-LocalCodeSigningCertificate`：查找当前用户可用代码签名证书。
- `New-LocalCodeSigningCertificate`：创建当前用户自签名代码签名证书。
- `Trust-LocalCertificate`：把证书导入当前用户 Root 和 TrustedPublisher。
- `Ensure-LocalSigningCertificate`：查找或创建证书并确保信任。
- `Set-LocalSignature`：对目标文件执行 Authenticode 签名并验证状态。
- 主流程：确认、确保证书、逐个签名、输出签名状态。

### `desktop/scripts/package-win-local-signed.ps1`

纯 Windows PowerShell 版本的本机签名打包流程。

- 参数与 Node 入口基本一致，另有 `SkipInstall` 和 `SkipWebBuild` 便于调试。
- `Confirm-LocalDevSigning`：交互确认备用方案。
- `Get-NativeCommandPath`：定位 npm/node。
- `Invoke-NativeCommand`：带工作目录运行原生命令并检查退出码。
- `Get-LocalCodeSigningCertificate`：查找证书。
- `New-LocalCodeSigningCertificate`：创建证书。
- `Trust-LocalCertificate`：导入当前用户信任库。
- `Ensure-LocalSigningCertificate`：确保证书存在且受信。
- `Set-LocalSignature`：签名并验证。
- `Get-PortableExe`：查找最新 portable exe。
- 主流程：安装依赖、构建 Web、生成 unpacked、签名、生成 portable、签名最终 exe。

### `desktop/scripts/remove-local-dev-signing.mjs`

Node 包装入口，用于调用 Windows PowerShell 移除本机签名证书。

- `scriptDir`：当前脚本目录。
- `signScript`：PowerShell 移除脚本路径。
- `toWindowsPath(filePath)`：把 WSL 路径转换成 Windows 路径。
- `result`：执行 PowerShell 的结果对象；失败时抛错或用退出码退出。

### `desktop/scripts/remove-local-dev-signing.ps1`

移除当前用户本机开发签名证书。

- 参数 `CertificateSubject`：要移除的证书 subject。
- `$stores`：当前用户 My、Root、TrustedPublisher 三个证书库。
- 主循环：按 subject 查找匹配证书，按 thumbprint 去重并删除。

### `desktop/scripts/start-windows-desktop.ps1`

Windows 桌面启动 helper。

- `$portableExe`：优先启动 `Guitar-Training-v1.0-windows-portable.exe`。
- 如果 portable exe 存在：直接 `Start-Process` 并退出。
- 如果不存在：检测 npm，必要时安装 `web/` 和 `desktop/` 依赖，然后运行 Electron dev。

## 测试文件索引

测试文件与被测模块同目录：

- `web/src/features/ear-training/challenges.test.ts`：听力题目生成。
- `web/src/shared/audio/synth.test.ts`：音频纯函数。
- `web/src/shared/fretboard/Fretboard.test.tsx`：二维排序和 3D 默认方向相关逻辑。
- `web/src/shared/music/spelling.test.ts`：音名拼写。
- `web/src/shared/music/theory.test.ts`：理论数据和随机工具。
- `web/src/shared/storage/localStorageAdapter.test.ts`：本地数据归一化和统计。

## 文档维护规则

新增或修改函数后，同步更新本文对应文件段落。新增功能需求后，同步更新：

- `docs/requirements/YYYY-MM-DD.md`
- `docs/v1.0/requirements.md` 或后续版本需求文档
- `docs/v1.0/features.md` 或后续版本功能文档
- `log/YYYY-MM-DD-execution.md`
