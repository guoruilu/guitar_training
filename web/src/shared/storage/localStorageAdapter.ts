import type { StorageAdapter, TrainingArea, TrainingStats, UserProgress, UserSettings } from './types';
import { DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS, INTERVALS, normalizeChordQualityIds } from '../music/theory';
import { DEFAULT_EAR_TRAINING_RANGE, normalizeEarTrainingRange } from '../music/midi';
import { DEFAULT_FRETBOARD_ROOT_IDS, normalizeRootIds } from '../music/spelling';

export const STORAGE_KEY = 'guitar-learning-assistant:progress:v1';
export const EXPORT_FILE_NAME = 'guitar-training-progress.json';

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
  fretboardViewMode: 'diagram',
  fretboardStringOrder: 'first-string-top',
  preferredSynth: 'clean',
  theme: 'dark',
  enabledIntervalIds: INTERVALS.map((interval) => interval.id),
  intervalDirection: 'both',
  earTrainingMinMidi: DEFAULT_EAR_TRAINING_RANGE.minMidi,
  earTrainingMaxMidi: DEFAULT_EAR_TRAINING_RANGE.maxMidi,
  enabledFretboardRootIds: [...DEFAULT_FRETBOARD_ROOT_IDS],
  enabledArpeggioChordIds: [...DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS],
  arpeggioQuestionMode: 'manual',
  scaleQuestionMode: 'manual',
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
    return normalizeProgress({ version: 1, settings: parsed.settings, stats: parsed.stats });
  } catch {
    return defaultProgress();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeStats(value: unknown): TrainingStats {
  const input = isRecord(value) ? value : {};
  const attempts = Number(input.attempts) || 0;
  const correct = Number(input.correct) || 0;
  const streak = Number(input.streak) || 0;
  const bestStreak = Number(input.bestStreak) || 0;
  const lastPracticedAt = typeof input.lastPracticedAt === 'string' ? input.lastPracticedAt : undefined;

  return {
    attempts: Math.max(0, attempts),
    correct: Math.max(0, Math.min(correct, attempts)),
    streak: Math.max(0, streak),
    bestStreak: Math.max(0, bestStreak),
    ...(lastPracticedAt ? { lastPracticedAt } : {}),
  };
}

export function normalizeProgress(value: unknown): UserProgress {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error('Unsupported progress file');
  }

  const settings = isRecord(value.settings) ? value.settings : {};
  const stats = isRecord(value.stats) ? value.stats : {};
  const validIntervalIds = new Set(INTERVALS.map((interval) => interval.id));
  const enabledIntervalIds = Array.isArray(settings.enabledIntervalIds)
    ? settings.enabledIntervalIds.filter((id): id is string => typeof id === 'string' && validIntervalIds.has(id))
    : DEFAULT_SETTINGS.enabledIntervalIds;
  const intervalDirection = settings.intervalDirection === 'up' || settings.intervalDirection === 'down'
    ? settings.intervalDirection
    : DEFAULT_SETTINGS.intervalDirection;
  const theme = settings.theme === 'light' ? 'light' : DEFAULT_SETTINGS.theme;
  const fretboardViewMode = settings.fretboardViewMode === 'player' ? 'player' : DEFAULT_SETTINGS.fretboardViewMode;
  const fretboardStringOrder = settings.fretboardStringOrder === 'first-string-bottom'
    ? 'first-string-bottom'
    : DEFAULT_SETTINGS.fretboardStringOrder;
  const enabledFretboardRootIds = normalizeRootIds(settings.enabledFretboardRootIds);
  const enabledArpeggioChordIds = normalizeChordQualityIds(settings.enabledArpeggioChordIds);
  const arpeggioQuestionMode = settings.arpeggioQuestionMode === 'random' ? 'random' : DEFAULT_SETTINGS.arpeggioQuestionMode;
  const scaleQuestionMode = settings.scaleQuestionMode === 'random' ? 'random' : DEFAULT_SETTINGS.scaleQuestionMode;
  const earTrainingRange = normalizeEarTrainingRange({
    minMidi: Number(settings.earTrainingMinMidi),
    maxMidi: Number(settings.earTrainingMaxMidi),
  });

  return {
    version: 1,
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
      fretCount: [12, 15, 17].includes(Number(settings.fretCount)) ? Number(settings.fretCount) : DEFAULT_SETTINGS.fretCount,
      showDegrees: typeof settings.showDegrees === 'boolean' ? settings.showDegrees : DEFAULT_SETTINGS.showDegrees,
      showNoteNames: typeof settings.showNoteNames === 'boolean' ? settings.showNoteNames : DEFAULT_SETTINGS.showNoteNames,
      fretboardViewMode,
      fretboardStringOrder,
      preferredSynth: 'clean',
      theme,
      enabledIntervalIds: enabledIntervalIds.length > 0 ? enabledIntervalIds : DEFAULT_SETTINGS.enabledIntervalIds,
      intervalDirection,
      earTrainingMinMidi: earTrainingRange.minMidi,
      earTrainingMaxMidi: earTrainingRange.maxMidi,
      enabledFretboardRootIds,
      enabledArpeggioChordIds,
      arpeggioQuestionMode,
      scaleQuestionMode,
    },
    stats: {
      'ear-interval': normalizeStats(stats['ear-interval']),
      'ear-chord': normalizeStats(stats['ear-chord']),
      arpeggio: normalizeStats(stats.arpeggio),
      scale: normalizeStats(stats.scale),
    },
  };
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

  importProgress(progress: unknown): UserProgress {
    const next = normalizeProgress(progress);
    this.save(next);
    return next;
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
