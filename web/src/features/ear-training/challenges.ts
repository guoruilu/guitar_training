import { CHORD_QUALITIES, INTERVALS, normalizePitchClass, randomInt, randomItem } from '../../shared/music/theory';
import type { ChordQuality, IntervalDefinition, PitchClass } from '../../shared/music/types';
import type { IntervalDirection } from '../../shared/storage/types';

export const EAR_TRAINING_MIN_MIDI = 21; // A0, piano low end.
export const EAR_TRAINING_MAX_MIDI = 108; // C8, piano high end.
export const EAR_TRAINING_RANGE_LABEL = 'A0-C8';

export interface IntervalChallenge {
  rootMidi: number;
  secondMidi: number;
  interval: IntervalDefinition;
  direction: Exclude<IntervalDirection, 'both'>;
}

export interface ChordChallenge {
  root: PitchClass;
  rootMidi: number;
  quality: ChordQuality;
  midiNotes: number[];
}

export function randomMidiInRange(minInclusive: number, maxInclusive: number): number {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive) || minInclusive > maxInclusive) {
    throw new Error(`Invalid MIDI range: ${minInclusive}-${maxInclusive}`);
  }

  return minInclusive + randomInt(maxInclusive - minInclusive + 1);
}

export function intervalRootMidiRange(
  interval: IntervalDefinition,
  direction: Exclude<IntervalDirection, 'both'>,
): { min: number; max: number } {
  if (direction === 'up') {
    return {
      min: EAR_TRAINING_MIN_MIDI,
      max: EAR_TRAINING_MAX_MIDI - interval.semitones,
    };
  }

  return {
    min: EAR_TRAINING_MIN_MIDI + interval.semitones,
    max: EAR_TRAINING_MAX_MIDI,
  };
}

export function chordRootMidiRange(quality: ChordQuality): { min: number; max: number } {
  const highestInterval = Math.max(...quality.intervals);

  return {
    min: EAR_TRAINING_MIN_MIDI,
    max: EAR_TRAINING_MAX_MIDI - highestInterval,
  };
}

export function createIntervalChallenge(direction: IntervalDirection, intervalPool: IntervalDefinition[]): IntervalChallenge {
  const interval = randomItem(intervalPool.length > 0 ? intervalPool : INTERVALS);
  const resolvedDirection = direction === 'both' ? randomItem(['up', 'down'] as const) : direction;
  const rootRange = intervalRootMidiRange(interval, resolvedDirection);
  const rootMidi = randomMidiInRange(rootRange.min, rootRange.max);

  return {
    rootMidi,
    secondMidi: resolvedDirection === 'up' ? rootMidi + interval.semitones : rootMidi - interval.semitones,
    interval,
    direction: resolvedDirection,
  };
}

export function createChordChallenge(): ChordChallenge {
  const quality = randomItem(CHORD_QUALITIES);
  const rootRange = chordRootMidiRange(quality);
  const rootMidi = randomMidiInRange(rootRange.min, rootRange.max);

  return {
    root: normalizePitchClass(rootMidi),
    rootMidi,
    quality,
    midiNotes: quality.intervals.map((interval) => rootMidi + interval),
  };
}

export function allMidiNotesInEarTrainingRange(midiNotes: number[]): boolean {
  return midiNotes.every((midi) => midi >= EAR_TRAINING_MIN_MIDI && midi <= EAR_TRAINING_MAX_MIDI);
}
