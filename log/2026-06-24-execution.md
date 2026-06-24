# 2026-06-24 Execution Log

## Scope

Added a local Windows development signing workflow for machines that do not use
a public code-signing certificate yet.

## Context

- The generated portable exe was blocked by Windows 11 Smart App Control.
- `Get-AuthenticodeSignature` reported `NotSigned` for:
  - `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`
  - `desktop/release/win-unpacked/Guitar Training.exe`
- A public OV/EV code-signing certificate or Microsoft Store distribution is
  still the correct long-term public distribution solution.

## Implementation

- Added `desktop/scripts/package-win-local-signed.ps1`.
  - Provides a Windows PowerShell-only version of the local signed package
    workflow.
- Added `desktop/scripts/package-win-local-signed.mjs`.
  - Runs the build with the current command environment's Node/npm, so the same
    npm script works from Windows PowerShell or WSL.
  - Calls Windows PowerShell only for local certificate trust and Authenticode
    signing.
  - Installs `web/` and `desktop/` dependencies with `npm ci`.
  - Builds `web/dist`.
  - Builds the Electron `win-unpacked` directory.
  - Builds the portable exe from the signed unpacked app with
    `electron-builder --prepackaged`.
- Added `desktop/scripts/sign-windows-local-dev.ps1`.
  - Creates or reuses a self-signed code-signing certificate in
    `Cert:\CurrentUser\My`.
  - Trusts the public certificate for the current Windows user in
    `Cert:\CurrentUser\Root` and `Cert:\CurrentUser\TrustedPublisher`.
  - Signs unpacked `.exe` files.
  - Signs the final portable exe and verifies Authenticode status.
- Added `desktop/scripts/remove-local-dev-signing.ps1` to remove the local
  development signing certificate entries from the current Windows user stores.
- Added root helper `package-guitar-training-local-signed.cmd`.
- Added npm scripts:
  - `npm run desktop:package:win:local-signed`
  - `npm run desktop:remove-local-dev-signing`
  - `npm --prefix desktop run package:win:local-signed`
  - `npm --prefix desktop run remove-local-dev-signing`
- Updated `README.md` and `desktop/README.md` with the workflow and warnings.

## Notes

- This is a local development workaround. It does not create a portable public
  trust chain for other Windows computers.
- The documented order is to try the normal package first, then use local
  signing only as a fallback if Windows Smart App Control blocks the normal exe.
- Each developer/user must run the local signed package workflow on their own
  Windows account, or the project must use a public code-signing certificate.

## Verification

- PowerShell parser checks passed for:
  - `desktop/scripts/package-win-local-signed.ps1`
  - `desktop/scripts/sign-windows-local-dev.ps1`
  - `desktop/scripts/remove-local-dev-signing.ps1`
- Node syntax checks passed for:
  - `desktop/scripts/package-win-local-signed.mjs`
  - `desktop/scripts/remove-local-dev-signing.mjs`
- `npm run test`: passed, 6 files and 29 tests.
- `npm run build`: passed.
- `npm run desktop:package:win`: passed and refreshed the normal unsigned
  portable exe at `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`
  with timestamp `2026-06-24 15:09 +0200`.
- `Get-AuthenticodeSignature` still reports `NotSigned` for the normal portable
  exe.

## Deferred Local Signing Run

Attempted to run `npm run desktop:package:win:local-signed`, but the environment
blocked it because it would persistently modify the current Windows user's
certificate trust stores. The workflow is implemented, but it still needs an
explicit user approval before executing on this machine.

## Arpeggio Random Chord Pool And 3D Direction Marker

Scope:

- Added a configurable random chord pool for arpeggio fretboard practice.
- Kept the default random arpeggio pool to dominant seventh, major seventh,
  minor seventh, half-diminished seventh, and diminished seventh chords:
  `7`, `maj7`, `min7`, `m7b5`, `dim7`.
- Added first-person 3D fretboard orientation cues: a headstock shape, nut,
  tuning pegs, a scene `琴头` label, and fixed `琴头端` / `琴身端` canvas labels.

Implementation notes:

- Added `enabledArpeggioChordIds` to persisted user settings.
- Normalization removes invalid/duplicate chord ids and falls back to the
  default five-chord pool when imported or legacy data has no valid chord ids.
- Random arpeggio questions now draw chord definitions from the enabled chord
  pool instead of the full chord library.
- Manual arpeggio selection still exposes the full chord definition list.

Verification:

- `npm run test`: passed, 6 files and 29 tests.
- `npm run build`: passed.
- `npm run desktop:package:win`: passed and refreshed
  `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`.
- Playwright 3D verification:
  - Generated desktop and mobile screenshots under
    `log/playwright-2026-06-24/`.
  - WebGL `readPixels` found non-background pixels in both viewports.
  - Drag interaction changed the rendered checksum in both viewports.
  - Final screenshots show the headstock/nut/tuning pegs and fixed
    `琴头端` / `琴身端` labels without a central label obstruction.
- Refreshed portable exe:
  - Size: 81M.
  - SHA256: `ebb598cbd54d7356885b1905dea2a43c857941963f9f592198bfeafec55bea96`.
  - `Get-AuthenticodeSignature`: `NotSigned`, because this run intentionally
    used the normal package flow rather than the local signing fallback.

Environment notes:

- The local WSL Playwright browser cache was missing Chromium at first.
- `npm --prefix web exec playwright install chromium` downloaded the browser
  cache.
- The environment could not install system dependencies through sudo, so the
  missing Chromium runtime libraries were downloaded with `apt-get download`
  and unpacked under `/tmp/playwright-libs` for this verification only.

## Default 3D Sixth-String Near Side

Scope:

- Updated the first-person 3D fretboard default so the 6th string is on the
  side closer to the player camera.
- Kept the global string-order toggle meaningful in 3D: switching the order
  flips which outside string is closer to the camera.

Implementation notes:

- Exported `PLAYER_CAMERA_X` and `stringXPositions` from `Fretboard3D` for
  deterministic tests.
- Changed the default player camera X offset to the 6th-string side.
- Changed the default 3D string ordering so `first-string-top` places string
  index `0` / string number `6` on the near side.

Verification:

- `npm run test`: passed, 6 files and 30 tests.
- `npm run build`: passed.
- Playwright 3D verification:
  - Generated desktop and mobile screenshots under
    `log/playwright-2026-06-24-sixth-string-near/`.
  - WebGL `readPixels` found non-background pixels in both viewports.
  - Drag interaction changed the rendered checksum in both viewports.
  - Direction labels were present in both viewports.
- `npm run desktop:package:win`: passed and refreshed
  `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`.
- Refreshed portable exe:
  - Size: 81M.
  - SHA256: `4f6500289e341550ecb0d96c582dca96b02c703e3a4caeab678e2e5bede3ef09`.
  - `Get-AuthenticodeSignature`: `NotSigned`, because this run intentionally
    used the normal package flow rather than the local signing fallback.

## Collapsible Random Pools

Scope:

- Changed the random arpeggio chord pool selector into a collapsible panel.
- Changed the random root/key pool selector into a collapsible panel.
- Kept the existing selected pools, default/all actions, and one-item minimum
  selection guards unchanged.

Implementation notes:

- Used native `details` / `summary` so the panels can expand and collapse
  without extra persisted UI state.
- Panel summaries show the current selected count and total option count.
- The expanded content keeps the existing checkbox grids.

Verification:

- `npm run test`: passed, 6 files and 30 tests.
- `npm run build`: passed.
- Playwright control-panel verification:
  - Generated desktop and mobile screenshots under
    `log/playwright-2026-06-24-collapsible-pools/`.
  - Arpeggio chord and root/key pool panels were collapsed by default.
  - Panel summaries showed selected counts.
  - Clicking each summary expanded the checkbox grids on desktop and mobile
    viewports.
- `npm run desktop:package:win`: passed and refreshed
  `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`.
- Refreshed portable exe:
  - Size: 81M.
  - SHA256: `7ab895e7b8974f0afb001352ac4715465330a3dde87ca542b3f9577a8792d49b`.
  - `Get-AuthenticodeSignature`: `NotSigned`, because this run intentionally
    used the normal package flow rather than the local signing fallback.

## Local Signing Confirmation Guard

Scope:

- Added an explicit interactive confirmation before any local development
  signing fallback can change the current Windows user's certificate stores.
- The Node packaging entry, the PowerShell packaging entry, and the PowerShell
  single-file signing helper now all explain that the fallback should only be
  used when the normal unsigned portable exe is blocked by Windows Smart App
  Control.
- The fallback requires typing `SMART APP CONTROL BLOCKED` before it creates or
  reuses the self-signed code-signing certificate, trusts it for the current
  Windows user, and signs exe files.

Implementation notes:

- The Node packaging script passes `-ConfirmedLocalDevSigning` to the lower
  level PowerShell signing helper after the top-level confirmation has already
  been accepted, avoiding duplicate prompts in the normal fallback workflow.
- The Node packaging script also passes `-NoTimestamp` so the local fallback
  does not depend on an external timestamp server during signing.
- Documentation now calls out the confirmation phrase, the current-user trust
  store impact, the same-computer/current-user limitation, and the removal
  command.

Execution notes:

- First execution of `npm run desktop:package:win:local-signed` displayed the
  confirmation warning and waited for `SMART APP CONTROL BLOCKED` as intended.
- The first run stalled while Windows PowerShell attempted the external
  timestamp signing path, so it was stopped and the npm packaging entry was
  changed to pass `-NoTimestamp` by default.
- Re-ran `npm run desktop:package:win:local-signed`, confirmed with
  `SMART APP CONTROL BLOCKED`, and completed the local signing fallback.
- The signing flow created or reused this current-user certificate:
  - Subject: `CN=Guitar Training Local Dev Code Signing`
  - Thumbprint: `8D72604AFFC7DF1A9E4A44280633F8AC97DF6BF3`
  - Valid from: `2026-06-24 18:02:16`
  - Valid until: `2029-06-24 18:12:16`
- Refreshed local-signed portable exe:
  - Path: `desktop/release/Guitar-Training-0.1.0-windows-portable.exe`
  - Size: 81M
  - SHA256: `ddaab4315165775b806d07d678b820bdb3e9b2535a7098f0729f3b1edc3ccac5`
  - `Get-AuthenticodeSignature`: `Valid`
  - Status message: `Signature verified.`

Verification:

- `node --check desktop/scripts/package-win-local-signed.mjs`: passed.
- Windows PowerShell parser check for `desktop/scripts/sign-windows-local-dev.ps1`: passed.
- Windows PowerShell parser check for `desktop/scripts/package-win-local-signed.ps1`: passed.
- `npm run test`: passed, 6 files and 30 tests.
- `npm run build`: passed before packaging.
- `npm run desktop:package:win:local-signed`: passed after confirming the
  warning prompt.
