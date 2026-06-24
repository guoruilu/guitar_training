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
