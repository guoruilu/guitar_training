# 2026-06-25 Execution Log

## 第一版 v1.0 发布整理

User requirement:

> 目前的版本命名为第一版。.exe文件也要重新生成的命名为v1.0。然后要给这一版的代码整理好，并且要写一份十分详细的文档，把代码的架构，实现的功能和需求，每份代码乃至函数的功能都要写清楚。可以分别写在注释和文档当中。

Scope:

- Renamed the current release line to 第一版 / v1.0 in user-facing docs.
- Updated package semver from `0.1.0` to `1.0.0` in:
  - `package.json`
  - `web/package.json`
  - `desktop/package.json`
  - `web/package-lock.json`
  - `desktop/package-lock.json`
- Changed Electron Builder portable artifact name to
  `Guitar-Training-v1.0-windows-portable.exe`.
- Updated `desktop/scripts/start-windows-desktop.ps1` so the helper launches
  the v1.0 portable exe.
- Added first-version documentation under `docs/v1.0/`:
  - `README.md`
  - `requirements.md`
  - `architecture.md`
  - `features.md`
  - `build-and-release.md`
  - `code-reference.md`
- Added the 2026-06-25 user requirement verbatim under
  `docs/requirements/2026-06-25.md`.
- Updated the root README, desktop README, and docs index to point to the v1.0
  documentation and executable name.

Documentation details:

- `docs/v1.0/requirements.md` maps original requirements to v1.0 behavior and
  documents boundaries.
- `docs/v1.0/architecture.md` documents the Web/Electron split, data flow,
  training flow, music-theory layer, storage, audio, runtime server, and local
  signing fallback.
- `docs/v1.0/features.md` documents the implemented user-facing training
  workflows.
- `docs/v1.0/build-and-release.md` documents normal package generation,
  necessary local signing fallback, removal of local trust, and verification.
- `docs/v1.0/code-reference.md` documents production source files, scripts,
  tests, components, functions, classes, constants, and script entry points.
- Total v1.0 documentation size: 1,267 lines.

Verification:

- JSON parse check for package files and lock files: passed.
- `node --check desktop/scripts/package-win-local-signed.mjs`: passed.
- `node --check web/scripts/launch-dev.mjs`: passed.
- `node --check web/scripts/verify-3d-playwright.mjs`: passed.
- Windows PowerShell parser check for
  `desktop/scripts/start-windows-desktop.ps1`: passed.
- Windows PowerShell parser check for
  `desktop/scripts/package-win-local-signed.ps1`: passed.
- `npm run test`: passed, 6 files and 30 tests.
- `npm run build`: passed.

Packaging:

- Because this machine previously had Windows Smart App Control block the
  normal unsigned exe, the v1.0 package was generated with the necessary local
  signing fallback.
- `npm run desktop:package:win:local-signed` displayed the local signing warning
  and required `SMART APP CONTROL BLOCKED` before continuing.
- The script reused the current-user local development code-signing certificate:
  - Subject: `CN=Guitar Training Local Dev Code Signing`
  - Thumbprint: `8D72604AFFC7DF1A9E4A44280633F8AC97DF6BF3`
- Generated local-signed v1.0 portable exe:
  - Path: `desktop/release/Guitar-Training-v1.0-windows-portable.exe`
  - Size: 81M
  - SHA256: `d892f41100aceef5c66aca54946de53e80c32c8ed9f8f3b2fc3d796a3b346b58`
  - `Get-AuthenticodeSignature`: `Valid`
  - Status message: `Signature verified.`

Notes:

- `desktop/release/` still contains the historical ignored
  `Guitar-Training-0.1.0-windows-portable.exe` generated during earlier work.
  It was left untouched to avoid deleting generated artifacts without an
  explicit cleanup request.
- The untracked screenshot `log/智能应用控制.png` remains untracked and was not
  included in this task.
