import { describe, expect, it } from 'vitest';
import { DEFAULT_EAR_TRAINING_RANGE } from '../music/midi';
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

  it('normalizes fretboard display settings', () => {
    const progress = defaultProgress();
    progress.settings.fretboardViewMode = 'player';
    progress.settings.fretboardStringOrder = 'first-string-top';

    expect(normalizeProgress(progress).settings.fretboardViewMode).toBe('player');
    expect(normalizeProgress(progress).settings.fretboardStringOrder).toBe('first-string-top');
    expect(normalizeProgress({ version: 1, settings: {}, stats: {} }).settings.fretboardViewMode).toBe('diagram');
  });

  it('normalizes missing or invalid ear-training ranges', () => {
    const progress = defaultProgress();
    progress.settings.earTrainingMinMidi = 72;
    progress.settings.earTrainingMaxMidi = 74;

    expect(normalizeProgress(progress).settings.earTrainingMinMidi).toBe(72);
    expect(normalizeProgress(progress).settings.earTrainingMaxMidi).toBe(84);
    expect(normalizeProgress({ version: 1, settings: {}, stats: {} }).settings.earTrainingMinMidi).toBe(
      DEFAULT_EAR_TRAINING_RANGE.minMidi,
    );
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
