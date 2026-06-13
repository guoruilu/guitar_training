import type { FretboardChallenge, FretboardExerciseMode, FretboardRange, PitchClass } from './types';
import { randomInt, randomItem, transpose } from './theory';

const ROOTS: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MODES: FretboardExerciseMode[] = ['find-all', 'single-note', 'route'];
const DEFAULT_FRET_RANGE_SPAN = 4;

export function randomRoot(): PitchClass {
  return randomItem(ROOTS);
}

export function nextMode(current: FretboardExerciseMode): FretboardExerciseMode {
  const index = MODES.indexOf(current);
  return MODES[(index + 1) % MODES.length];
}

export function randomFretRange(fretCount: number, span = DEFAULT_FRET_RANGE_SPAN): FretboardRange {
  const safeFretCount = Math.max(1, Math.floor(fretCount));
  const safeSpan = Math.max(1, Math.min(Math.floor(span), safeFretCount));
  const startFret = 1 + randomInt(safeFretCount - safeSpan + 1);

  return {
    startFret,
    endFret: startFret + safeSpan - 1,
  };
}

export function fretRangeLabel(range: FretboardRange): string {
  return `${range.startFret}-${range.endFret}品`;
}

export function createFretboardChallenge(input: {
  mode: FretboardExerciseMode;
  title: string;
  root: PitchClass;
  fretRange: FretboardRange;
  intervals: number[];
  degrees: string[];
  focusIndexes?: number[];
}): FretboardChallenge {
  const targetPitchClasses = input.intervals.map((interval) => transpose(input.root, interval));
  const defaultFocusIndexes = targetPitchClasses.map((_, index) => index);
  const focusIndexes = input.focusIndexes?.length ? input.focusIndexes : defaultFocusIndexes;
  const focusIndex = input.mode === 'single-note' ? randomItem(focusIndexes) : undefined;

  return {
    id: `${Date.now()}-${randomInt(1_000_000_000).toString(36)}`,
    mode: input.mode,
    title: input.title,
    root: input.root,
    fretRange: input.fretRange,
    targetPitchClasses,
    targetDegrees: input.degrees,
    focusPitchClass: focusIndex === undefined ? undefined : targetPitchClasses[focusIndex],
    focusDegree: focusIndex === undefined ? undefined : input.degrees[focusIndex],
  };
}

export function modeLabel(mode: FretboardExerciseMode): string {
  switch (mode) {
    case 'find-all':
      return '点选找音';
    case 'single-note':
      return '逐题定位';
    case 'route':
      return '路线练习';
  }
}
