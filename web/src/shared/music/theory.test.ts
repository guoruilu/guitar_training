import { describe, expect, it } from 'vitest';
import { evaluateFindAll, evaluateFindAllPositions, getPitchAt, isPositionInFretRange, makeFretboard, positionsInFretRange } from './fretboard';
import { createFretboardChallenge, randomFretRange } from './fretboardTrainer';
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

  it('filters fretboard positions by a fretted range', () => {
    const fretboard = makeFretboard(12);
    const range = { startFret: 5, endFret: 8 };
    const positions = positionsInFretRange(fretboard, range);

    expect(positions).toHaveLength(24);
    expect(positions.every((position) => isPositionInFretRange(position, range))).toBe(true);
    expect(positions.some((position) => position.fret === 0)).toBe(false);
  });

  it('evaluates find-all coverage by exact target positions inside a range', () => {
    const fretboard = makeFretboard(3);
    const targetPositions = fretboard.filter((position) => position.fret >= 1 && position.fret <= 3 && position.pitchClass === 5);

    expect(evaluateFindAllPositions(targetPositions, targetPositions).correct).toBe(true);
    expect(evaluateFindAllPositions(targetPositions.slice(0, 1), targetPositions).missingPositions.length).toBe(
      targetPositions.length - 1,
    );
    expect(evaluateFindAllPositions([fretboard[0]], targetPositions).wrongPositions).toEqual([fretboard[0]]);
  });

  it('creates random fret ranges within the displayed fret count', () => {
    for (let index = 0; index < 50; index += 1) {
      const range = randomFretRange(12);
      expect(range.startFret).toBeGreaterThanOrEqual(1);
      expect(range.endFret).toBeLessThanOrEqual(12);
      expect(range.endFret - range.startFret + 1).toBe(4);
    }
  });

  it('adds the random fret range to fretboard challenges', () => {
    const challenge = createFretboardChallenge({
      mode: 'single-note',
      title: 'Cmaj',
      root: 0,
      rootName: 'C',
      fretRange: { startFret: 5, endFret: 8 },
      intervals: [0, 4, 7],
      degrees: ['R', '3', '5'],
      noteLabels: ['C', 'E', 'G'],
      focusIndexes: [1],
    });

    expect(challenge.fretRange).toEqual({ startFret: 5, endFret: 8 });
    expect(challenge.focusPitchClass).toBe(4);
    expect(challenge.focusDegree).toBe('3');
    expect(challenge.focusNoteLabel).toBe('E');
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
