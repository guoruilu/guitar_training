export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface IntervalDefinition {
  id: string;
  label: string;
  shortLabel: string;
  semitones: number;
}

export interface ChordQuality {
  id: string;
  label: string;
  symbol: string;
  intervals: number[];
  degrees: string[];
}

export interface ScaleDefinition {
  id: string;
  label: string;
  intervals: number[];
  degrees: string[];
}

export interface FretPosition {
  stringIndex: number;
  stringNumber: number;
  fret: number;
  pitchClass: PitchClass;
  noteName: string;
}

export interface FretboardRange {
  startFret: number;
  endFret: number;
}

export type FretboardExerciseMode = 'find-all' | 'single-note' | 'route';

export interface FretboardChallenge {
  id: string;
  mode: FretboardExerciseMode;
  title: string;
  root: PitchClass;
  rootName: string;
  fretRange: FretboardRange;
  targetPitchClasses: PitchClass[];
  targetDegrees: string[];
  targetNoteLabels: string[];
  focusPitchClass?: PitchClass;
  focusDegree?: string;
  focusNoteLabel?: string;
}
