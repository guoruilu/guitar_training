import { describe, expect, it } from 'vitest';
import { defaultProgress, normalizeProgress } from './localStorageAdapter';

describe('local storage progress import', () => {
  it('normalizes a valid exported progress payload', () => {
    const progress = defaultProgress();
    progress.settings.theme = 'light';
    progress.settings.enabledIntervalIds = ['m3', 'P5'];
    progress.settings.intervalDirection = 'up';
    progress.stats.arpeggio = {
      attempts: 3,
      correct: 2,
      streak: 1,
      bestStreak: 2,
      lastPracticedAt: '2026-06-12T18:00:00.000Z',
    };

    expect(normalizeProgress(progress).stats.arpeggio.correct).toBe(2);
    expect(normalizeProgress(progress).settings.theme).toBe('light');
    expect(normalizeProgress(progress).settings.enabledIntervalIds).toEqual(['m3', 'P5']);
    expect(normalizeProgress(progress).settings.intervalDirection).toBe('up');
  });

  it('falls back to the default interval pool if import has no valid interval ids', () => {
    const progress = defaultProgress();
    progress.settings.enabledIntervalIds = [];

    expect(normalizeProgress(progress).settings.enabledIntervalIds.length).toBeGreaterThan(1);
  });

  it('rejects unsupported progress payloads', () => {
    expect(() => normalizeProgress({ version: 99 })).toThrow('Unsupported progress file');
  });
});
