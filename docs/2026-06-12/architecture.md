# 2026-06-12 架构说明

## 顶层结构

`src/App.tsx` 负责主导航、设置面板、本地统计总览和三个功能模块的统一调用。

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

## 扩展方向

- 新增爵士和弦、调式或扩展音阶时，优先扩展 `src/shared/music/theory.ts` 的数据定义。
- 新增账号同步时，实现新的 `StorageAdapter`，训练模块不需要直接改成后端调用。
- 新增 MIDI 或麦克风输入时，建议在 `src/shared/audio/` 或新建 `src/shared/input/` 中隔离设备逻辑。
