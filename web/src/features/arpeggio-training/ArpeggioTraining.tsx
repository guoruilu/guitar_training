import { FretboardPractice } from '../../shared/fretboard/FretboardPractice';
import { CHORD_QUALITIES } from '../../shared/music/theory';
import type { TrainingArea, TrainingStats, UserSettings } from '../../shared/storage/types';

interface ArpeggioTrainingProps {
  settings: UserSettings;
  stats: TrainingStats;
  onUpdateSettings(settings: Partial<UserSettings>): void;
  onRecordAttempt(area: TrainingArea, correct: boolean): void;
}

export function ArpeggioTraining({ settings, stats, onUpdateSettings, onRecordAttempt }: ArpeggioTrainingProps) {
  return (
    <FretboardPractice
      area="arpeggio"
      title="指板琶音训练"
      definitions={CHORD_QUALITIES}
      settings={settings}
      stats={stats}
      onUpdateSettings={onUpdateSettings}
      onRecordAttempt={onRecordAttempt}
    />
  );
}
