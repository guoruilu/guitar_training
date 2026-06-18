# 2026-06-18 Execution Log

## Scope

Implemented the 2026-06-18 fretboard request:

- Default `1弦在上`.
- Context-aware chord/scale note spelling with double sharps/flats.
- Expanded jazz chord and scale libraries.
- Manual/random arpeggio and scale question modes with user-selectable root/key pools.
- Three.js 3D first-person fretboard view with mouse orbit and click selection.

## Commands

- `npm --prefix web install three`
  - Added Three.js runtime dependency.
  - npm reported `1 low severity vulnerability`.
- `npm run test`
  - Passed: 6 files, 29 tests.
- `npm run build`
  - First run failed because `three` type declarations were missing.
- `npm --prefix web install -D @types/three`
  - Added Three.js TypeScript declarations.
- `npm run build`
  - Passed after adding types.
  - Warning: Vite chunk size exceeds 500KB because Three.js is included.
- `npm --prefix web install -D @playwright/test`
  - Added Playwright verification dependency.
  - npm reported `1 low severity vulnerability`.
- `npm --prefix web exec playwright install chromium`
  - Downloaded Chromium, headless shell, and FFmpeg into the local Playwright cache.
- `npm --prefix web run preview -- --port 5181 --strictPort`
  - Served production build for verification.
- `node web/scripts/verify-3d-playwright.mjs`
  - Passed desktop and mobile canvas checks.
- `npm run desktop:package:win`
  - Passed.
  - Rebuilt `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`.
  - Output timestamp: `2026-06-18 12:07:06 +0200`.
  - Output size: `84,361,880` bytes.

## Errors And Fixes

- Build error:
  - `TS7016: Could not find a declaration file for module 'three'`.
  - Fixed by installing `@types/three`.
- Initial 3D verification screenshot showed the fretboard too far from the camera after a drag interaction.
  - Fixed by moving the default camera closer to the body-end first-person position.
  - Updated verification script to save default screenshots before doing a small drag check.

## Verification Artifacts

- `log/playwright-2026-06-18/desktop-3d-fretboard.png`
- `log/playwright-2026-06-18/desktop-3d-fretboard-dragged.png`
- `log/playwright-2026-06-18/mobile-3d-fretboard.png`
- `log/playwright-2026-06-18/mobile-3d-fretboard-dragged.png`
- `log/playwright-2026-06-18/summary.json`

Linux headless screenshots render Chinese text as square placeholders because no CJK font is available in that browser environment. The app CSS still includes system Chinese fonts, and Windows should render the Chinese UI normally.

## Notes

- User example listed `F#7` with `Eb`; implementation uses standard harmony spelling `F# A# C# E`. Diminished seventh contexts still produce `Eb` where correct.
- `Gb7` is covered as `Gb Bb Db Fb`.
- The Windows portable exe was rebuilt locally after these code changes. It remains ignored by Git as a generated artifact.
