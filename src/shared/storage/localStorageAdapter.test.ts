import { describe, expect, it } from 'vitest';
import { defaultProgress, normalizeProgress } from './localStorageAdapter';

describe('local storage progress import', () => {
  it('normalizes a valid exported progress payload', () => {
    const progress = defaultProgress();
    progress.stats.arpeggio = {
      attempts: 3,
      correct: 2,
      streak: 1,
      bestStreak: 2,
      lastPracticedAt: '2026-06-12T18:00:00.000Z',
    };

    expect(normalizeProgress(progress).stats.arpeggio.correct).toBe(2);
  });

  it('rejects unsupported progress payloads', () => {
    expect(() => normalizeProgress({ version: 99 })).toThrow('Unsupported progress file');
  });
});
