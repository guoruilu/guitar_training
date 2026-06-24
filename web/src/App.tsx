import { useMemo, useRef, useState } from 'react';
import { ArpeggioTraining } from './features/arpeggio-training/ArpeggioTraining';
import { EarTraining } from './features/ear-training/EarTraining';
import { ScaleTraining } from './features/scale-training/ScaleTraining';
import { EXPORT_FILE_NAME, STORAGE_KEY, storageAdapter } from './shared/storage/localStorageAdapter';
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
  const [dataStatus, setDataStatus] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
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
    setDataStatus('本地记录已重置');
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(storageAdapter.getProgress(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = EXPORT_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setDataStatus(`已导出 ${EXPORT_FILE_NAME}`);
  }

  async function importProgressFile(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      const next = storageAdapter.importProgress(parsed);
      setProgress(next);
      setDataStatus(`已导入 ${file.name}`);
    } catch {
      setDataStatus('导入失败：文件格式不匹配');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="app-shell" data-theme={progress.settings.theme}>
      <header className="app-header">
        <div>
          <p className="eyebrow">Guitar Learning Assistant</p>
          <h1>吉他学习辅助工具</h1>
        </div>
        <div className="header-actions">
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
          <button type="button" className="secondary-button" onClick={() => setHelpOpen(true)}>
            说明
          </button>
        </div>
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
            <label>
              视角
              <select
                value={progress.settings.fretboardViewMode}
                onChange={(event) => updateSettings({ fretboardViewMode: event.target.value as UserSettings['fretboardViewMode'] })}
              >
                <option value="diagram">图表视角</option>
                <option value="player">第一人称演奏视角</option>
              </select>
            </label>
            <label>
              琴弦顺序
              <select
                value={progress.settings.fretboardStringOrder}
                onChange={(event) => updateSettings({ fretboardStringOrder: event.target.value as UserSettings['fretboardStringOrder'] })}
              >
                <option value="first-string-top">1弦在上</option>
                <option value="first-string-bottom">1弦在下</option>
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

          <section>
            <p className="panel-label">外观</p>
            <label>
              主题
              <select
                value={progress.settings.theme}
                onChange={(event) => updateSettings({ theme: event.target.value as UserSettings['theme'] })}
              >
                <option value="dark">暗色</option>
                <option value="light">明色</option>
              </select>
            </label>
          </section>

          <button type="button" className="danger-button" onClick={resetProgress}>
            重置本地记录
          </button>

          <section>
            <p className="panel-label">数据位置</p>
            <div className="storage-box">
              <span>Browser localStorage</span>
              <code>{STORAGE_KEY}</code>
              <span>迁移文件</span>
              <code>{EXPORT_FILE_NAME}</code>
            </div>
            <div className="storage-actions">
              <button type="button" className="secondary-button" onClick={exportProgress}>
                导出数据
              </button>
              <button type="button" className="secondary-button" onClick={() => importInputRef.current?.click()}>
                导入数据
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="visually-hidden"
                onChange={(event) => importProgressFile(event.target.files?.[0])}
              />
            </div>
            {dataStatus && <p className="storage-status">{dataStatus}</p>}
          </section>
        </aside>

        <div className="feature-surface">
          {activeFeature === 'ear' && (
            <EarTraining
              settings={progress.settings}
              intervalStats={progress.stats['ear-interval']}
              chordStats={progress.stats['ear-chord']}
              onUpdateSettings={updateSettings}
              onRecordAttempt={recordAttempt}
            />
          )}

          {activeFeature === 'arpeggio' && (
            <ArpeggioTraining
              settings={progress.settings}
              stats={progress.stats.arpeggio}
              onUpdateSettings={updateSettings}
              onRecordAttempt={recordAttempt}
            />
          )}

          {activeFeature === 'scale' && (
            <ScaleTraining
              settings={progress.settings}
              stats={progress.stats.scale}
              onUpdateSettings={updateSettings}
              onRecordAttempt={recordAttempt}
            />
          )}
        </div>
      </main>

      {helpOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setHelpOpen(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Guide</p>
                <h2 id="help-title">使用说明</h2>
              </div>
              <button type="button" className="secondary-button" onClick={() => setHelpOpen(false)}>
                关闭
              </button>
            </div>

            <div className="help-grid">
              <section>
                <h3>访问地址</h3>
                <p>在 WSL 中运行时，Windows 浏览器优先使用 Vite 输出的 Network 地址。</p>
              </section>
              <section>
                <h3>听力训练</h3>
                <p>音程页可选择训练音程池和上下行方向。默认随机上下行，并从已选音程中随机出题。</p>
              </section>
              <section>
                <h3>指板训练</h3>
                <p>琶音和音阶页支持手动或随机出题、点选找音、逐题定位和路线练习。随机琶音可选择和弦池，可切换图表视角或 3D 第一人称视角。</p>
              </section>
              <section>
                <h3>数据迁移</h3>
                <p>左侧数据区可导出 <code>guitar-training-progress.json</code>，换设备后导入即可继续。</p>
              </section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
