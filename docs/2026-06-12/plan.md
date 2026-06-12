# 2026-06-12 代码计划

## 目标

建立一个跨系统浏览器端吉他学习辅助工具，首版包含：

- 听力训练：音程听辨、和弦性质听辨。
- 指板琶音训练：围绕和弦音在指板上进行定位。
- 指板音阶训练：围绕音阶音在指板上进行定位。

## 技术方案

- 使用 `Vite + React + TypeScript` 搭建前端应用。
- 音频首版使用浏览器原生 Web Audio 合成音色。
- 数据首版保存在浏览器 `localStorage`。
- 后续账号同步通过 `StorageAdapter` 扩展，不直接绑定训练模块。

## 目录计划

- `src/features/ear-training/`：听力训练。
- `src/features/arpeggio-training/`：指板琶音训练。
- `src/features/scale-training/`：指板音阶训练。
- `src/shared/music/`：音程、和弦、音阶、指板计算。
- `src/shared/audio/`：浏览器音频播放。
- `src/shared/fretboard/`：可复用指板 UI 和练习组件。
- `src/shared/storage/`：本地保存与未来同步接口。
- `docs/`：计划、架构、使用说明、进展、功能文档。
- `log/`：执行过程、错误、测试记录。

## 首版范围

- 初中级用户。
- 常用核心乐理：12 个调、常见音程、三和弦/七和弦、大小调/五声音阶/布鲁斯音阶。
- 指板训练包含三种模式：点选找音、逐题定位、路线练习。
- 不做账号、后端、麦克风检测、MIDI 输入和真实吉他采样。
