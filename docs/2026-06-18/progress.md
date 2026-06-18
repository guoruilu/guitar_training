# 2026-06-18 项目进展

## 已完成

- 记录本次用户原始需求到 `docs/requirements/2026-06-18.md`，并保存参考图片。
- 默认琴弦顺序改为 `1弦在上`，仍可在设置中切换为 `1弦在下`。
- 新增上下文音名拼写层，琶音/音阶目标音可按根音、调和音级显示升降、重升、重降。
- 扩展琶音和音阶题库，加入常见爵士和弦、调式、bebop、altered、diminished 等练习内容。
- 琶音和音阶训练新增 `手动/随机` 出题方式，随机模式可由用户选择根音/调池。
- 新增 Three.js 3D 第一人称指板视角，支持鼠标拖拽调节角度和点击选音。
- 新增 Playwright 3D 验证脚本 `web/scripts/verify-3d-playwright.mjs`。

## 重要说明

- 用户举例中写到 `F#7` 的七音为 `Eb`，实现采用标准属七拼写：`F# A# C# E`。`Eb` 会出现在例如 `F#dim7` 的减七语境。
- `Gb7` 会拼作 `Gb Bb Db Fb`，避免把七音显示为 `E`。
- `web/dist` 和 `desktop/release/` 仍是构建产物，不提交到 Git；每次代码更新后需要本地重打 Windows portable exe。

## 验证结果

- `npm run test`：通过，6 个测试文件、29 个测试。
- `npm run build`：通过；Vite 提示 Three.js 使 bundle 超过 500KB。
- Playwright 3D 检查：通过，桌面和移动视口均生成截图并完成 canvas 非空像素检查。
- `npm run desktop:package:win`：通过，已刷新 Windows portable exe。

## 生成文件

- 3D 验证截图和统计：`log/playwright-2026-06-18/`。
- 参考需求图片：`docs/requirements/first_perscpective_view_of_fret_board.jpg`。
- 最新本地 exe：`desktop/release/Guitar-Training-0.1.0-windows-portable.exe`，时间戳 `2026-06-18 12:07:06 +0200`。
