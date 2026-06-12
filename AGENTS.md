# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript browser app for guitar training. Source code lives in `src/`.

- `src/features/ear-training/`: interval and chord ear-training UI.
- `src/features/arpeggio-training/`: fretboard arpeggio training entry point.
- `src/features/scale-training/`: fretboard scale training entry point.
- `src/shared/music/`: theory data, pitch helpers, fretboard calculations, and tests.
- `src/shared/audio/`: Web Audio synth playback.
- `src/shared/fretboard/`: reusable fretboard UI and practice flow.
- `src/shared/storage/`: local progress storage and sync interface.
- `docs/`: plans, architecture notes, usage, progress, and feature docs.
- `log/`: execution details, errors, and verification notes.

Place tests next to the code they cover, using `*.test.ts` or `*.test.tsx`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server.
- `npm run test`: run Vitest once.
- `npm run build`: run TypeScript checking and create a production build in `dist/`.
- `npm run preview`: serve the production build locally.

Do not commit `node_modules/` or `dist/`; both are ignored.

## Coding Style & Naming Conventions

Use TypeScript with strict checks. Prefer small, typed functions and shared helpers over duplicated music-theory logic. Components use PascalCase (`FretboardPractice.tsx`); helper modules use camelCase or descriptive lowercase names (`fretboardTrainer.ts`). Use two-space indentation, single quotes, and semicolons to match the current codebase. Keep UI text concise and Chinese-facing unless a technical label is clearer in English.

## Testing Guidelines

Vitest is the test framework. Cover music theory helpers, fretboard calculations, answer evaluation, and storage behavior when changing shared logic. Run `npm run test` before committing functional changes, and run `npm run build` before pushing or opening a PR.

## Commit & Pull Request Guidelines

The current history uses concise summary commits, for example `Initial guitar training app`. Keep commit messages short, imperative, and specific: `Add scale route trainer` or `Fix interval answer scoring`.

Pull requests should include a brief description, test results, screenshots for UI changes, and links to relevant docs or issues. Update `docs/` for design or usage changes, and update `log/` when errors, verification steps, or project process details matter for review.

## Agent-Specific Instructions

This project is guided by human-written requirements and documentation, with code generated and maintained by OpenAI Codex. Preserve that attribution in `README.md`, keep changes scoped, and avoid rewriting unrelated files. After completing a repository-changing task, commit and push to `origin/main` unless the user says not to.
