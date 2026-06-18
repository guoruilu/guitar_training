import type { PitchClass } from './types';
import { normalizePitchClass } from './theory';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const NATURAL_PITCH_CLASSES: Record<(typeof LETTERS)[number], PitchClass> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export interface RootOption {
  id: string;
  label: string;
  letter: (typeof LETTERS)[number];
  accidental: number;
  pitchClass: PitchClass;
}

export const ROOT_OPTIONS: RootOption[] = [
  rootOption('C'),
  rootOption('C#'),
  rootOption('Db'),
  rootOption('D'),
  rootOption('D#'),
  rootOption('Eb'),
  rootOption('E'),
  rootOption('E#'),
  rootOption('Fb'),
  rootOption('F'),
  rootOption('F#'),
  rootOption('Gb'),
  rootOption('G'),
  rootOption('G#'),
  rootOption('Ab'),
  rootOption('A'),
  rootOption('A#'),
  rootOption('Bb'),
  rootOption('B'),
  rootOption('B#'),
  rootOption('Cb'),
];

export const DEFAULT_FRETBOARD_ROOT_IDS = ROOT_OPTIONS.map((root) => root.id);

function accidentalText(value: number) {
  if (value === -2) {
    return 'bb';
  }
  if (value === -1) {
    return 'b';
  }
  if (value === 1) {
    return '#';
  }
  if (value === 2) {
    return '##';
  }
  return '';
}

function parseAccidental(text: string) {
  if (text === 'bb') {
    return -2;
  }
  if (text === 'b') {
    return -1;
  }
  if (text === '#' || text === '♯') {
    return 1;
  }
  if (text === '##' || text === 'x') {
    return 2;
  }
  return 0;
}

function rootOption(name: string): RootOption {
  const letter = name[0] as RootOption['letter'];
  const accidental = parseAccidental(name.slice(1));

  return {
    id: name,
    label: name,
    letter,
    accidental,
    pitchClass: normalizePitchClass(NATURAL_PITCH_CLASSES[letter] + accidental),
  };
}

export function getRootOption(id: string): RootOption {
  return ROOT_OPTIONS.find((root) => root.id === id) ?? ROOT_OPTIONS[0];
}

export function normalizeRootIds(ids: unknown): string[] {
  const validIds = new Set(ROOT_OPTIONS.map((root) => root.id));
  if (!Array.isArray(ids)) {
    return DEFAULT_FRETBOARD_ROOT_IDS;
  }

  const result = ids.filter((id): id is string => typeof id === 'string' && validIds.has(id));
  return result.length > 0 ? result : DEFAULT_FRETBOARD_ROOT_IDS;
}

function degreeNumber(degree: string): number {
  if (degree === 'R') {
    return 1;
  }

  const match = degree.match(/\d+/);
  if (!match) {
    return 1;
  }

  const number = Number(match[0]);
  return ((number - 1) % 7) + 1;
}

function closestAccidental(targetPitchClass: PitchClass, naturalPitchClass: PitchClass) {
  let diff = targetPitchClass - naturalPitchClass;
  while (diff > 6) {
    diff -= 12;
  }
  while (diff < -6) {
    diff += 12;
  }

  if (diff > 2) {
    diff -= 12;
  }
  if (diff < -2) {
    diff += 12;
  }

  return diff;
}

export function spellPitchForDegree(root: RootOption, semitones: number, degree: string): string {
  const rootLetterIndex = LETTERS.indexOf(root.letter);
  const targetDegree = degreeNumber(degree);
  const targetLetter = LETTERS[(rootLetterIndex + targetDegree - 1) % LETTERS.length];
  const targetPitchClass = normalizePitchClass(root.pitchClass + semitones);
  const accidental = closestAccidental(targetPitchClass, NATURAL_PITCH_CLASSES[targetLetter]);

  return `${targetLetter}${accidentalText(accidental)}`;
}

export function spellFormula(root: RootOption, intervals: number[], degrees: string[]): string[] {
  return intervals.map((interval, index) => spellPitchForDegree(root, interval, degrees[index] ?? 'R'));
}
