# 2026-06-14 执行日志

## 指板视角与琴弦顺序

- 新增设置字段：`fretboardViewMode` 和 `fretboardStringOrder`，默认分别为 `diagram` 和 `first-string-bottom`，保持旧显示不变。
- 左侧指板设置新增两个选择框：`图表视角 / 第一人称演奏视角`，以及 `1弦在下 / 1弦在上`。
- `Fretboard` 组件支持琴弦上下顺序切换；第一人称演奏视角会镜像品位顺序，并把空弦列放到右侧。
- 琶音训练和音阶训练共用 `FretboardPractice`，因此两个模块同时获得新视角设置。
- 补充测试：存储设置归一化、琴弦顺序排序、第一人称品位顺序。

## Windows portable exe 更新

- 用户发现 `desktop/release/Guitar-Training-0.1.0-windows-portable.exe` 仍是旧时间戳，未包含最新指板视角功能。
- 执行 `npm --prefix desktop run package:win` 重新构建 Web 资源并生成 Windows portable exe。
- 新 exe 时间戳：`2026-06-14 11:58`，大小约 `81M`。
- 包内资源确认更新为 `index-Bhgzz8gC.js` 和 `index-DdvOQC2R.css`。
- 注意：`desktop/release/` 被 `.gitignore` 忽略，exe 不会进入 Git；每次代码功能更新后需要重新打包并替换本地分发文件。
