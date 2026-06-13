export type TrainingArea = 'ear-interval' | 'ear-chord' | 'arpeggio' | 'scale';
export type ThemeMode = 'dark' | 'light';
export type IntervalDirection = 'both' | 'up' | 'down';

export interface TrainingStats {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  lastPracticedAt?: string;
}

export interface UserSettings {
  fretCount: number;
  showDegrees: boolean;
  showNoteNames: boolean;
  preferredSynth: 'clean';
  theme: ThemeMode;
  enabledIntervalIds: string[];
  intervalDirection: IntervalDirection;
  earTrainingMinMidi: number;
  earTrainingMaxMidi: number;
}

export interface UserProgress {
  version: 1;
  settings: UserSettings;
  stats: Record<TrainingArea, TrainingStats>;
}

export interface StorageAdapter {
  getProgress(): UserProgress;
  saveSettings(settings: UserSettings): void;
  importProgress(progress: unknown): UserProgress;
  recordAttempt(area: TrainingArea, correct: boolean): UserProgress;
  resetProgress(): UserProgress;
}
