import { FretboardPractice } from '../../shared/fretboard/FretboardPractice';
import { SCALE_DEFINITIONS } from '../../shared/music/theory';
import type { TrainingArea, TrainingStats, UserSettings } from '../../shared/storage/types';

interface ScaleTrainingProps {
  settings: UserSettings;
  stats: TrainingStats;
  onUpdateSettings(settings: Partial<UserSettings>): void;
  onRecordAttempt(area: TrainingArea, correct: boolean): void;
}

export function ScaleTraining({ settings, stats, onUpdateSettings, onRecordAttempt }: ScaleTrainingProps) {
  return (
    <FretboardPractice
      area="scale"
      title="指板音阶训练"
      definitions={SCALE_DEFINITIONS}
      settings={settings}
      stats={stats}
      onUpdateSettings={onUpdateSettings}
      onRecordAttempt={onRecordAttempt}
    />
  );
}
