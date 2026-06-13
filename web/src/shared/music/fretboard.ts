import type { FretPosition, PitchClass } from './types';
import { normalizePitchClass, noteName } from './theory';

export const STANDARD_TUNING: PitchClass[] = [4, 9, 2, 7, 11, 4];

export function positionKey(position: Pick<FretPosition, 'stringIndex' | 'fret'>): string {
  return `${position.stringIndex}:${position.fret}`;
}

export function parsePositionKey(key: string): { stringIndex: number; fret: number } {
  const [stringIndex, fret] = key.split(':').map(Number);
  return { stringIndex, fret };
}

export function getPitchAt(stringIndex: number, fret: number, tuning: PitchClass[] = STANDARD_TUNING): PitchClass {
  return normalizePitchClass(tuning[stringIndex] + fret);
}

export function makeFretboard(fretCount = 12, tuning: PitchClass[] = STANDARD_TUNING): FretPosition[] {
  const positions: FretPosition[] = [];

  tuning.forEach((openPitch, stringIndex) => {
    for (let fret = 0; fret <= fretCount; fret += 1) {
      const pitchClass = normalizePitchClass(openPitch + fret);
      positions.push({
        stringIndex,
        stringNumber: tuning.length - stringIndex,
        fret,
        pitchClass,
        noteName: noteName(pitchClass),
      });
    }
  });

  return positions;
}

export function isTargetPosition(position: FretPosition, targetPitchClasses: PitchClass[]): boolean {
  return targetPitchClasses.includes(position.pitchClass);
}

export function coveredPitchClasses(selected: FretPosition[], targetPitchClasses: PitchClass[]): PitchClass[] {
  const covered = new Set<PitchClass>();

  selected.forEach((position) => {
    if (targetPitchClasses.includes(position.pitchClass)) {
      covered.add(position.pitchClass);
    }
  });

  return Array.from(covered);
}

export function evaluateFindAll(selected: FretPosition[], targetPitchClasses: PitchClass[]) {
  const wrongPositions = selected.filter((position) => !targetPitchClasses.includes(position.pitchClass));
  const covered = coveredPitchClasses(selected, targetPitchClasses);
  const missingPitchClasses = targetPitchClasses.filter((pitchClass) => !covered.includes(pitchClass));

  return {
    correct: wrongPositions.length === 0 && missingPitchClasses.length === 0,
    wrongPositions,
    missingPitchClasses,
  };
}

export function evaluateSingleNote(selected: FretPosition[], targetPitchClass: PitchClass) {
  return selected.length === 1 && selected[0].pitchClass === targetPitchClass;
}

export function evaluateRoute(selected: FretPosition[], expectedPitchClasses: PitchClass[]) {
  if (selected.length !== expectedPitchClasses.length) {
    return false;
  }

  return selected.every((position, index) => position.pitchClass === expectedPitchClasses[index]);
}
