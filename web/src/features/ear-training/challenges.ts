import {
  DEFAULT_EAR_TRAINING_RANGE,
  type EarTrainingMidiRange,
  normalizeEarTrainingRange,
} from '../../shared/music/midi';
import { CHORD_QUALITIES, INTERVALS, normalizePitchClass, randomInt, randomItem } from '../../shared/music/theory';
import type { ChordQuality, IntervalDefinition, PitchClass } from '../../shared/music/types';
import type { IntervalDirection } from '../../shared/storage/types';

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
  range: EarTrainingMidiRange = DEFAULT_EAR_TRAINING_RANGE,
): { min: number; max: number } {
  const normalizedRange = normalizeEarTrainingRange(range);
  if (direction === 'up') {
    return {
      min: normalizedRange.minMidi,
      max: normalizedRange.maxMidi - interval.semitones,
    };
  }

  return {
    min: normalizedRange.minMidi + interval.semitones,
    max: normalizedRange.maxMidi,
  };
}

export function chordRootMidiRange(
  quality: ChordQuality,
  range: EarTrainingMidiRange = DEFAULT_EAR_TRAINING_RANGE,
): { min: number; max: number } {
  const normalizedRange = normalizeEarTrainingRange(range);
  const highestInterval = Math.max(...quality.intervals);

  return {
    min: normalizedRange.minMidi,
    max: normalizedRange.maxMidi - highestInterval,
  };
}

export function createIntervalChallenge(
  direction: IntervalDirection,
  intervalPool: IntervalDefinition[],
  range: EarTrainingMidiRange = DEFAULT_EAR_TRAINING_RANGE,
): IntervalChallenge {
  const interval = randomItem(intervalPool.length > 0 ? intervalPool : INTERVALS);
  const resolvedDirection = direction === 'both' ? randomItem(['up', 'down'] as const) : direction;
  const rootRange = intervalRootMidiRange(interval, resolvedDirection, range);
  const rootMidi = randomMidiInRange(rootRange.min, rootRange.max);

  return {
    rootMidi,
    secondMidi: resolvedDirection === 'up' ? rootMidi + interval.semitones : rootMidi - interval.semitones,
    interval,
    direction: resolvedDirection,
  };
}

export function createChordChallenge(range: EarTrainingMidiRange = DEFAULT_EAR_TRAINING_RANGE): ChordChallenge {
  const quality = randomItem(CHORD_QUALITIES);
  const rootRange = chordRootMidiRange(quality, range);
  const rootMidi = randomMidiInRange(rootRange.min, rootRange.max);

  return {
    root: normalizePitchClass(rootMidi),
    rootMidi,
    quality,
    midiNotes: quality.intervals.map((interval) => rootMidi + interval),
  };
}

export function allMidiNotesInEarTrainingRange(
  midiNotes: number[],
  range: EarTrainingMidiRange = DEFAULT_EAR_TRAINING_RANGE,
): boolean {
  const normalizedRange = normalizeEarTrainingRange(range);
  return midiNotes.every((midi) => midi >= normalizedRange.minMidi && midi <= normalizedRange.maxMidi);
}
