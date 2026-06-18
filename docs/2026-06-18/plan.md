# 2026-06-18 Implementation Plan

## Requirement Breakdown

1. 默认指板琴弦顺序改为 `1弦在上`，并保持用户可切换。
2. 琶音和音阶训练显示音名时，要按当前和弦或调正确拼写，而不是只显示升号音名。
3. 音名拼写要支持升、降、重升、重降，例如 `F#7 = F# A# C# E`，`Gb7 = Gb Bb Db Fb`。
4. 扩展和弦与音阶库，覆盖常见三和弦、七和弦、扩展和弦、变化属和弦、减/增/挂留和爵士常用音阶/调式。
5. 琶音和音阶训练新增随机题模式：系统可随机选择根音/调和类型。
6. 用户可以选择哪些根音或调进入随机题库，包括自然音、升号、降号等。
7. 第一人称视角必须是 3D 指板，不是 2D 镜像；默认角度应接近用户提供的照片，并可用鼠标调整角度。
8. 保持文档、日志、测试、exe 打包和 Git 提交流程。

## Execution Steps

1. Inspect current music definitions, storage schema, fretboard rendering, and build setup.
2. Add a music spelling layer:
   - Represent roots with spelled note names and pitch classes.
   - Represent chord/scale formulas as interval + degree letter offsets.
   - Generate context-aware spelled notes from root + formula.
   - Add tests for enharmonic spelling, including double accidentals.
3. Extend chord and scale definitions:
   - Add jazz/common chord qualities and scale definitions.
   - Keep definitions structured so UI labels and spellings come from one source.
4. Add random practice settings:
   - Store enabled root/key ids and random/manual mode per fretboard trainer.
   - Add controls in arpeggio/scale panels.
   - Ensure imported old progress files normalize to defaults.
5. Update fretboard labels:
   - Display context spelling for selected/revealed target notes.
   - Keep pitch-class logic for actual answer evaluation.
6. Update default string order:
   - Change default to `first-string-top`.
   - Preserve user setting migration.
7. Build 3D first-person fretboard:
   - Add Three.js dependency.
   - Implement a reusable `Fretboard3D` view for player perspective.
   - Allow pointer drag to orbit within constrained angles.
   - Use the same enabled range, selected keys, target notes, and click behavior as 2D view.
8. Add verification:
   - Unit tests for spelling, settings normalization, random pools, and display ordering.
   - Build and package Windows portable exe.
   - Verify 3D canvas renders nonblank where possible in local environment.
9. Update docs/log, commit, push, and refresh the local portable exe.

## Risk Notes

- "全部包含" for jazz harmony is open-ended. Implementation will cover a broad practical library first and keep definitions extensible.
- 3D interaction can be implemented in code and build-verified here; visual inspection in the Windows desktop app may still require user confirmation.
- The portable exe is ignored by Git, so each code change must be followed by a local rebuild before sharing.
