import type { FretboardChallenge, FretboardExerciseMode, PitchClass } from './types';
import { randomInt, randomItem, transpose } from './theory';

const ROOTS: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MODES: FretboardExerciseMode[] = ['find-all', 'single-note', 'route'];

export function randomRoot(): PitchClass {
  return randomItem(ROOTS);
}

export function nextMode(current: FretboardExerciseMode): FretboardExerciseMode {
  const index = MODES.indexOf(current);
  return MODES[(index + 1) % MODES.length];
}

export function createFretboardChallenge(input: {
  mode: FretboardExerciseMode;
  title: string;
  root: PitchClass;
  intervals: number[];
  degrees: string[];
}): FretboardChallenge {
  const targetPitchClasses = input.intervals.map((interval) => transpose(input.root, interval));
  const focusIndex = input.mode === 'single-note' ? randomInt(targetPitchClasses.length) : undefined;

  return {
    id: `${Date.now()}-${randomInt(1_000_000_000).toString(36)}`,
    mode: input.mode,
    title: input.title,
    root: input.root,
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
