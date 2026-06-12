import type { StorageAdapter, TrainingArea, TrainingStats, UserProgress, UserSettings } from './types';

const STORAGE_KEY = 'guitar-learning-assistant:progress:v1';

const EMPTY_STATS: Record<TrainingArea, TrainingStats> = {
  'ear-interval': { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
  'ear-chord': { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
  arpeggio: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
  scale: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
};

export const DEFAULT_SETTINGS: UserSettings = {
  fretCount: 12,
  showDegrees: true,
  showNoteNames: true,
  preferredSynth: 'clean',
};

export function defaultProgress(): UserProgress {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    stats: structuredClone(EMPTY_STATS),
  };
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseProgress(raw: string | null): UserProgress {
  if (!raw) {
    return defaultProgress();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      version: 1,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      stats: {
        ...structuredClone(EMPTY_STATS),
        ...parsed.stats,
      },
    };
  } catch {
    return defaultProgress();
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  getProgress(): UserProgress {
    if (!canUseLocalStorage()) {
      return defaultProgress();
    }

    return parseProgress(window.localStorage.getItem(STORAGE_KEY));
  }

  saveSettings(settings: UserSettings): void {
    const progress = this.getProgress();
    this.save({ ...progress, settings });
  }

  recordAttempt(area: TrainingArea, correct: boolean): UserProgress {
    const progress = this.getProgress();
    const current = progress.stats[area];
    const streak = correct ? current.streak + 1 : 0;
    const updated: TrainingStats = {
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      lastPracticedAt: new Date().toISOString(),
    };

    const next = {
      ...progress,
      stats: {
        ...progress.stats,
        [area]: updated,
      },
    };
    this.save(next);
    return next;
  }

  resetProgress(): UserProgress {
    const next = defaultProgress();
    this.save(next);
    return next;
  }

  private save(progress: UserProgress): void {
    if (!canUseLocalStorage()) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

export const storageAdapter = new LocalStorageAdapter();
