import { describe, expect, it } from 'vitest';
import { evaluateFindAll, getPitchAt, makeFretboard } from './fretboard';
import { getChordQuality, getScaleDefinition, normalizePitchClass, pitchClassesFromIntervals, randomInt, randomItem } from './theory';

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

  it('keeps random helpers inside valid ranges', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(randomInt(12)).toBeGreaterThanOrEqual(0);
      expect(randomInt(12)).toBeLessThan(12);
      expect(['a', 'b', 'c']).toContain(randomItem(['a', 'b', 'c']));
    }
  });

  it('rejects invalid random ranges and empty item pools', () => {
    expect(() => randomInt(0)).toThrow('Invalid random range');
    expect(() => randomItem([])).toThrow('Cannot choose from an empty list');
  });
});
