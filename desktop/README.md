# Desktop App

Electron desktop shell for the guitar training web app in `../web`.

## Development

Install dependencies once:

```bash
npm --prefix ../web install
npm install
```

Run from this directory:

```bash
npm run dev
```

The dev command builds `../web/dist` and opens it in an Electron window.
Closing the Electron window exits the app process.

## Windows Package

```bash
npm run package:win
```

The portable Windows executable is written to `desktop/release/`.
It includes the built web app as an Electron resource, so users do not need
Node.js, npm, WSL, or separate audio/assets.

The normal package is unsigned. On Windows 11 machines with Smart App Control
enabled, an unsigned portable exe can be blocked before it starts.

Try the normal package first. If it opens on the current computer, no local
signing step is needed. If Windows 11 Smart App Control blocks the normal
package and a public code-signing certificate is not available yet, use this as
a fallback from Windows PowerShell or WSL. The signing step must be able to call
Windows `powershell.exe`:

```powershell
npm run package:win:local-signed
```

This creates or reuses a self-signed code-signing certificate for the current
Windows user, trusts it in the current user's certificate stores, installs
dependencies with `npm ci` in the current command environment, signs the
unpacked app, packages the portable exe from the signed app, then signs the
portable exe. Use it only when the normal package or direct run path fails. The
result is intended for the same Windows user on the same computer. It is not a
public distribution signature.

Remove the local development certificate trust with:

```powershell
npm run remove-local-dev-signing
```

## Data

The app still uses browser `localStorage`, persisted by Electron under its
`userData` directory for the product name `Guitar Training`.
