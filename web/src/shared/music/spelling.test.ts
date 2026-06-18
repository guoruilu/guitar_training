import { describe, expect, it } from 'vitest';
import { getRootOption, normalizeRootIds, spellFormula } from './spelling';

describe('context-aware note spelling', () => {
  it('spells dominant seventh chords from the chord root', () => {
    expect(spellFormula(getRootOption('F#'), [0, 4, 7, 10], ['R', '3', '5', 'b7'])).toEqual([
      'F#',
      'A#',
      'C#',
      'E',
    ]);
    expect(spellFormula(getRootOption('Gb'), [0, 4, 7, 10], ['R', '3', '5', 'b7'])).toEqual([
      'Gb',
      'Bb',
      'Db',
      'Fb',
    ]);
  });

  it('supports diminished seventh double flats and major seventh double sharps', () => {
    expect(spellFormula(getRootOption('Gb'), [0, 3, 6, 9], ['R', 'b3', 'b5', 'bb7'])).toEqual([
      'Gb',
      'Bbb',
      'Dbb',
      'Fbb',
    ]);
    expect(spellFormula(getRootOption('G#'), [0, 4, 7, 11], ['R', '3', '5', '7'])).toEqual([
      'G#',
      'B#',
      'D#',
      'F##',
    ]);
  });

  it('normalizes root pools to valid spellings', () => {
    expect(normalizeRootIds(['C', 'not-a-note', 'Bb'])).toEqual(['C', 'Bb']);
    expect(normalizeRootIds([]).length).toBeGreaterThan(12);
  });
});
