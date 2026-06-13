import { noteName } from './theory';

export const EAR_TRAINING_MIN_MIDI = 21; // A0, piano low end.
export const EAR_TRAINING_MAX_MIDI = 108; // C8, piano high end.
export const EAR_TRAINING_RANGE_LABEL = 'A0-C8';
export const EAR_TRAINING_MIN_SPAN = 12;

export interface EarTrainingMidiRange {
  minMidi: number;
  maxMidi: number;
}

export const DEFAULT_EAR_TRAINING_RANGE: EarTrainingMidiRange = {
  minMidi: EAR_TRAINING_MIN_MIDI,
  maxMidi: EAR_TRAINING_MAX_MIDI,
};

export const EAR_TRAINING_MIDI_OPTIONS = Array.from(
  { length: EAR_TRAINING_MAX_MIDI - EAR_TRAINING_MIN_MIDI + 1 },
  (_, index) => EAR_TRAINING_MIN_MIDI + index,
);

export function midiNoteLabel(midi: number): string {
  return `${noteName(midi)}${Math.floor(midi / 12) - 1}`;
}

export function earTrainingRangeLabel(range: EarTrainingMidiRange): string {
  return `${midiNoteLabel(range.minMidi)}-${midiNoteLabel(range.maxMidi)}`;
}

export function normalizeEarTrainingRange(input: Partial<EarTrainingMidiRange> | undefined): EarTrainingMidiRange {
  const minCandidate = Number(input?.minMidi);
  const maxCandidate = Number(input?.maxMidi);
  let minMidi = Number.isInteger(minCandidate) ? minCandidate : DEFAULT_EAR_TRAINING_RANGE.minMidi;
  let maxMidi = Number.isInteger(maxCandidate) ? maxCandidate : DEFAULT_EAR_TRAINING_RANGE.maxMidi;

  minMidi = Math.max(EAR_TRAINING_MIN_MIDI, Math.min(minMidi, EAR_TRAINING_MAX_MIDI - EAR_TRAINING_MIN_SPAN));
  maxMidi = Math.max(EAR_TRAINING_MIN_MIDI + EAR_TRAINING_MIN_SPAN, Math.min(maxMidi, EAR_TRAINING_MAX_MIDI));

  if (maxMidi - minMidi < EAR_TRAINING_MIN_SPAN) {
    if (minMidi + EAR_TRAINING_MIN_SPAN <= EAR_TRAINING_MAX_MIDI) {
      maxMidi = minMidi + EAR_TRAINING_MIN_SPAN;
    } else {
      minMidi = maxMidi - EAR_TRAINING_MIN_SPAN;
    }
  }

  return { minMidi, maxMidi };
}
