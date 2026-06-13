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

## Data

The app still uses browser `localStorage`, persisted by Electron under its
`userData` directory for the product name `Guitar Training`.
