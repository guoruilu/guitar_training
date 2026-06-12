import { useMemo, useState } from 'react';
import { ArpeggioTraining } from './features/arpeggio-training/ArpeggioTraining';
import { EarTraining } from './features/ear-training/EarTraining';
import { ScaleTraining } from './features/scale-training/ScaleTraining';
import { storageAdapter } from './shared/storage/localStorageAdapter';
import type { TrainingArea, TrainingStats, UserSettings } from './shared/storage/types';

type FeatureKey = 'ear' | 'arpeggio' | 'scale';

const NAV_ITEMS: { id: FeatureKey; label: string }[] = [
  { id: 'ear', label: '听力训练' },
  { id: 'arpeggio', label: '琶音训练' },
  { id: 'scale', label: '音阶训练' },
];

function combineStats(stats: TrainingStats[]) {
  const attempts = stats.reduce((sum, item) => sum + item.attempts, 0);
  const correct = stats.reduce((sum, item) => sum + item.correct, 0);
  const bestStreak = Math.max(0, ...stats.map((item) => item.bestStreak));

  return {
    attempts,
    correct,
    accuracy: attempts === 0 ? '0%' : `${Math.round((correct / attempts) * 100)}%`,
    bestStreak,
  };
}

export function App() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('ear');
  const [progress, setProgress] = useState(() => storageAdapter.getProgress());
  const combined = useMemo(() => combineStats(Object.values(progress.stats)), [progress.stats]);

  function updateSettings(partial: Partial<UserSettings>) {
    const nextSettings = { ...progress.settings, ...partial };
    storageAdapter.saveSettings(nextSettings);
    setProgress(storageAdapter.getProgress());
  }

  function recordAttempt(area: TrainingArea, correct: boolean) {
    setProgress(storageAdapter.recordAttempt(area, correct));
  }

  function resetProgress() {
    setProgress(storageAdapter.resetProgress());
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Guitar Learning Assistant</p>
          <h1>吉他学习辅助工具</h1>
        </div>
        <nav className="top-nav" aria-label="主功能">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activeFeature === item.id ? 'active' : ''}
              onClick={() => setActiveFeature(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="workspace">
        <aside className="settings-panel" aria-label="设置和总览">
          <section>
            <p className="panel-label">本地统计</p>
            <div className="overview-number">
              <span>{combined.accuracy}</span>
              <small>{combined.correct} / {combined.attempts}</small>
            </div>
            <div className="mini-metrics">
              <span>最佳连续<strong>{combined.bestStreak}</strong></span>
              <span>模块<strong>3</strong></span>
            </div>
          </section>

          <section>
            <p className="panel-label">指板设置</p>
            <label>
              品位
              <select
                value={progress.settings.fretCount}
                onChange={(event) => updateSettings({ fretCount: Number(event.target.value) })}
              >
                <option value={12}>空弦 + 1-12</option>
                <option value={15}>空弦 + 1-15</option>
                <option value={17}>空弦 + 1-17</option>
              </select>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={progress.settings.showNoteNames}
                onChange={(event) => updateSettings({ showNoteNames: event.target.checked })}
              />
              音名
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={progress.settings.showDegrees}
                onChange={(event) => updateSettings({ showDegrees: event.target.checked })}
              />
              音级
            </label>
          </section>

          <button type="button" className="danger-button" onClick={resetProgress}>
            重置本地记录
          </button>
        </aside>

        <div className="feature-surface">
          {activeFeature === 'ear' && (
            <EarTraining
              intervalStats={progress.stats['ear-interval']}
              chordStats={progress.stats['ear-chord']}
              onRecordAttempt={recordAttempt}
            />
          )}

          {activeFeature === 'arpeggio' && (
            <ArpeggioTraining settings={progress.settings} stats={progress.stats.arpeggio} onRecordAttempt={recordAttempt} />
          )}

          {activeFeature === 'scale' && (
            <ScaleTraining settings={progress.settings} stats={progress.stats.scale} onRecordAttempt={recordAttempt} />
          )}
        </div>
      </main>
    </div>
  );
}
