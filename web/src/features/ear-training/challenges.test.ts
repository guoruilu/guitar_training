import { describe, expect, it } from 'vitest';
import { CHORD_QUALITIES, INTERVALS } from '../../shared/music/theory';
import {
  allMidiNotesInEarTrainingRange,
  chordRootMidiRange,
  createChordChallenge,
  createIntervalChallenge,
  EAR_TRAINING_MAX_MIDI,
  EAR_TRAINING_MIN_MIDI,
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
