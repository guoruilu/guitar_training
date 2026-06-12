import { describe, expect, it } from 'vitest';
import { evaluateFindAll, getPitchAt, makeFretboard } from './fretboard';
import { getChordQuality, getScaleDefinition, normalizePitchClass, pitchClassesFromIntervals } from './theory';

describe('music theory helpers', () => {
  it('normalizes pitch classes across octaves', () => {
    expect(normalizePitchClass(12)).toBe(0);
    expect(normalizePitchClass(-1)).toBe(11);
  });

  it('builds chord pitch classes from intervals', () => {
    const maj7 = getChordQuality('maj7');
    expect(pitchClassesFromIntervals(0, maj7.intervals)).toEqual([0, 4, 7, 11]);
  });

  it('builds scale pitch classes from intervals', () => {
    const minorPentatonic = getScaleDefinition('minor-pentatonic');
    expect(pitchClassesFromIntervals(9, minorPentatonic.intervals)).toEqual([9, 0, 2, 4, 7]);
  });

  it('calculates standard tuning fretboard pitches', () => {
    expect(getPitchAt(0, 0)).toBe(4);
    expect(getPitchAt(0, 1)).toBe(5);
    expect(getPitchAt(5, 8)).toBe(0);
  });

  it('evaluates find-all coverage by target pitch classes', () => {
    const fretboard = makeFretboard(3);
    const selected = fretboard.filter((position) => ['0:0', '1:3'].includes(`${position.stringIndex}:${position.fret}`));
    const result = evaluateFindAll(selected, [4, 0]);
    expect(result.correct).toBe(true);
  });
});
