import { describe, expect, it } from 'vitest';
import { EAR_TRAINING_MAX_MIDI, EAR_TRAINING_MIN_MIDI, normalizeEarTrainingRange } from '../../shared/music/midi';
import { CHORD_QUALITIES, INTERVALS } from '../../shared/music/theory';
import {
  allMidiNotesInEarTrainingRange,
  chordRootMidiRange,
  createChordChallenge,
  createIntervalChallenge,
  intervalRootMidiRange,
} from './challenges';

describe('ear training challenge ranges', () => {
  it('covers the requested band and keyboard range', () => {
    expect(EAR_TRAINING_MIN_MIDI).toBe(21);
    expect(EAR_TRAINING_MAX_MIDI).toBe(108);
  });

  it('keeps interval challenges inside the ear-training range', () => {
    for (const interval of INTERVALS) {
      expect(intervalRootMidiRange(interval, 'up')).toEqual({
        min: EAR_TRAINING_MIN_MIDI,
        max: EAR_TRAINING_MAX_MIDI - interval.semitones,
      });
      expect(intervalRootMidiRange(interval, 'down')).toEqual({
        min: EAR_TRAINING_MIN_MIDI + interval.semitones,
        max: EAR_TRAINING_MAX_MIDI,
      });
    }

    for (let index = 0; index < 200; index += 1) {
      const challenge = createIntervalChallenge('both', INTERVALS);
      expect(allMidiNotesInEarTrainingRange([challenge.rootMidi, challenge.secondMidi])).toBe(true);
      expect(Math.abs(challenge.secondMidi - challenge.rootMidi)).toBe(challenge.interval.semitones);
    }
  });

  it('keeps interval and chord challenges inside a custom user range', () => {
    const customRange = { minMidi: 40, maxMidi: 64 };

    for (let index = 0; index < 200; index += 1) {
      const intervalChallenge = createIntervalChallenge('both', INTERVALS, customRange);
      expect(allMidiNotesInEarTrainingRange([intervalChallenge.rootMidi, intervalChallenge.secondMidi], customRange)).toBe(true);

      const chordChallenge = createChordChallenge(customRange);
      expect(allMidiNotesInEarTrainingRange(chordChallenge.midiNotes, customRange)).toBe(true);
    }
  });

  it('normalizes imported or user-picked ranges to at least one octave', () => {
    expect(normalizeEarTrainingRange({ minMidi: 20, maxMidi: 200 })).toEqual({
      minMidi: EAR_TRAINING_MIN_MIDI,
      maxMidi: EAR_TRAINING_MAX_MIDI,
    });
    expect(normalizeEarTrainingRange({ minMidi: 60, maxMidi: 62 })).toEqual({
      minMidi: 60,
      maxMidi: 72,
    });
  });

  it('keeps chord challenges inside the ear-training range', () => {
    for (const quality of CHORD_QUALITIES) {
      const highestInterval = Math.max(...quality.intervals);
      expect(chordRootMidiRange(quality)).toEqual({
        min: EAR_TRAINING_MIN_MIDI,
        max: EAR_TRAINING_MAX_MIDI - highestInterval,
      });
    }

    for (let index = 0; index < 200; index += 1) {
      const challenge = createChordChallenge();
      expect(allMidiNotesInEarTrainingRange(challenge.midiNotes)).toBe(true);
      expect(challenge.rootMidi).toBe(challenge.midiNotes[0]);
    }
  });
});
