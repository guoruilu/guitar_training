# 2026-06-12 架构说明

## 顶层结构

`src/App.tsx` 负责主导航、设置面板、本地统计总览和三个功能模块的统一调用。

根目录启动入口：

- `start-guitar-training.cmd`：Windows 双击启动入口；优先通过 PowerShell 为 `dist/` 启动本机静态服务，没有构建产物时进入开发模式。
- `start-guitar-training.sh`：Linux/macOS/WSL 启动入口。
- `scripts/launch-dev.mjs`：为构建产物启动本机静态服务，或安装依赖、启动 dev server、打开浏览器。
- `.github/workflows/build-static-app.yml`：在 GitHub 上构建普通用户可下载的 Windows 静态包。

三个功能目录分别是：

- `src/features/ear-training/`
- `src/features/arpeggio-training/`
- `src/features/scale-training/`

## 共享模块

`src/shared/music/` 是核心乐理层：

- `theory.ts`：音名、音程、和弦、音阶、转调、随机工具。
- `fretboard.ts`：标准调弦指板位置、位置 key、判题函数。
- `fretboardTrainer.ts`：指板练习题生成与模式标签。

`src/shared/fretboard/` 是指板交互层：

- `Fretboard.tsx`：纯指板 UI。
- `FretboardPractice.tsx`：三种指板练习模式的通用流程。

`src/shared/audio/` 是音频层：

- `synth.ts`：Web Audio 合成音、顺序播放、和弦同时播放。

`src/shared/storage/` 是保存层：

- `StorageAdapter` 定义保存接口。
- `LocalStorageAdapter` 当前实现本地保存。
- 训练记录自动保存在浏览器 `localStorage`，并通过 JSON 导入/导出支持跨设备迁移。
- 用户设置包含主题、指板显示、音程训练题库和音程方向。

`src/shared/runtime/` 是运行时协作层：

- `localServerHeartbeat.ts`：发布包在 `127.0.0.1:5190-5289` 运行时向本机服务发送心跳，并在页面关闭时发送关闭信号。
- Windows PowerShell 启动器和 Node 静态服务共同实现 `__guitar_training_heartbeat` 与 `__guitar_training_page_closed` 端点；关闭信号会延迟约 15 秒执行，刷新页面时由新心跳取消退出。

## 扩展方向

- 新增爵士和弦、调式或扩展音阶时，优先扩展 `src/shared/music/theory.ts` 的数据定义。
- 新增账号同步时，实现新的 `StorageAdapter`，训练模块不需要直接改成后端调用。
- 新增 MIDI 或麦克风输入时，建议在 `src/shared/audio/` 或新建 `src/shared/input/` 中隔离设备逻辑。
- 开发服务器固定端口为 `5180` 且使用 strict port，避免多个 Vite 实例导致浏览器访问旧代码。
- Vite `base` 使用相对路径，保证构建产物可由本机静态服务从任意发布目录加载。
- 发布包本机静态服务使用 `5190-5289` 端口范围，并自动跳过占用端口。
