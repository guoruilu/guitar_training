# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript browser app. Source code lives in `src/`.

- `src/features/ear-training/`: interval and chord ear-training UI.
- `src/features/arpeggio-training/`: fretboard arpeggio training entry point.
- `src/features/scale-training/`: fretboard scale training entry point.
- `src/shared/music/`: theory data, pitch helpers, calculations, and tests.
- `src/shared/audio/`: Web Audio synth playback.
- `src/shared/fretboard/`: reusable fretboard UI and practice flow.
- `src/shared/storage/`: local progress storage and sync interface.
- `docs/`: plans, architecture notes, usage, progress, and feature docs.
- `log/`: execution details, errors, and verification notes.

Place tests next to covered code as `*.test.ts`.

## Build, Test, and Development Commands

- `npm install`: install locked dependencies.
- `npm run dev`: start Vite.
- `npm run test`: run Vitest once.
- `npm run build`: type-check and build `dist/`.
- `npm run preview`: serve the production build.

Do not commit `node_modules/` or `dist/`; both are ignored.

## Coding Style & Naming Conventions

Use strict TypeScript. Prefer small typed functions and shared helpers over duplicated music-theory logic. Components use PascalCase (`FretboardPractice.tsx`); helpers use camelCase or descriptive lowercase names (`fretboardTrainer.ts`). Use two-space indentation, single quotes, and semicolons. Keep UI text concise and Chinese-facing unless English is clearer.

## Testing Guidelines

Vitest is the test framework. Cover theory helpers, fretboard calculations, answer evaluation, and storage behavior when changing shared logic. Run `npm run test` before functional commits, and `npm run build` before pushing or opening a PR.

## Commit & Pull Request Guidelines

History uses concise summary commits, for example `Initial guitar training app`. Keep messages short, imperative, and specific: `Add scale route trainer`.

Pull requests should include a description, test results, UI screenshots when relevant, and linked docs or issues.

## Agent-Specific Instructions

This project is guided by human-written requirements and docs, with code generated and maintained by OpenAI Codex. Preserve that attribution in `README.md`.

- Keep `AGENTS.md` concise. Put detailed notes in structured files under `docs/`, using date or feature subdirectories when content grows.
- After every task, update `docs/` and `log/` with enough context, decisions, errors, and next steps for a new agent to resume quickly.
- Keep the app self-contained from source: no required untracked assets or manually fetched audio/files. Build or prewarm steps are acceptable only when project commands can reproduce everything.
- Keep changes scoped, avoid rewriting unrelated files, then commit and push to `origin/main` unless the user says not to.
