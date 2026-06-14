# Repository Guidelines

## Project Structure & Module Organization

The repository is split into a web app and a desktop shell.

- `web/src/features/ear-training/`: interval and chord ear-training UI.
- `web/src/features/arpeggio-training/`: fretboard arpeggio entry point.
- `web/src/features/scale-training/`: fretboard scale entry point.
- `web/src/shared/`: music theory, synth audio, fretboard UI, runtime, and local storage.
- `desktop/`: Electron app that loads `web/dist`.
- `docs/`: plans, architecture notes, usage, progress, and feature docs.
- `log/`: execution details, errors, and verification notes.

Place tests next to covered code as `*.test.ts`.

## Build, Test, and Development Commands

- `npm --prefix web install`: install web dependencies.
- `npm --prefix desktop install`: install desktop dependencies.
- `npm run dev`: start the web Vite server from the root.
- `npm run desktop:dev`: build the web app and open Electron.
- `npm run test`: run web Vitest tests once.
- `npm run build`: type-check and build `web/dist`.
- `npm run desktop:package:win`: build a Windows portable desktop exe.

Do not commit `node_modules/`, `dist/`, or `desktop/release/`; they are ignored.

## Coding Style & Naming Conventions

Use strict TypeScript. Prefer small typed functions and shared helpers. Components use PascalCase (`FretboardPractice.tsx`); helpers use camelCase or descriptive lowercase names (`fretboardTrainer.ts`). Use two-space indentation, single quotes, and semicolons. Keep UI text concise and Chinese-facing unless English is clearer.

## Testing Guidelines

Vitest is the test framework. Cover theory helpers, fretboard calculations, answer evaluation, and storage changes. Run `npm run test` before functional commits, and `npm run build` before pushing or opening a PR.

## Commit & Pull Request Guidelines

History uses concise summary commits, for example `Initial guitar training app`. Keep messages short, imperative, and specific: `Add scale route trainer`.

Pull requests should include a description, test results, UI screenshots when relevant, and linked docs or issues.

## Agent-Specific Instructions

This project is guided by human-written requirements and docs, with code generated and maintained by OpenAI Codex. Preserve that attribution in `README.md`.

- Record each user requirement verbatim in a structured file under `docs/requirements/`.
- Keep `AGENTS.md` concise. Put detailed notes in structured files under `docs/`, using date or feature subdirectories when content grows.
- After every task, update `docs/` and `log/` with enough context, decisions, errors, and next steps for a new agent to resume quickly.
- Keep the app self-contained from source: no required untracked assets or manually fetched audio/files. Build or prewarm steps are acceptable only when project commands can reproduce everything.
- Keep changes scoped, avoid rewriting unrelated files, then commit and push to `origin/main` unless the user says not to.
- Update .exe file after every code update
