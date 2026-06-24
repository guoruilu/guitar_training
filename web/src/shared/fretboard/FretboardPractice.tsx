import { useEffect, useMemo, useState } from 'react';
import { playPitchClasses } from '../audio/synth';
import {
  evaluateFindAllPositions,
  evaluateRoute,
  evaluateSingleNote,
  isPositionInFretRange,
  makeFretboard,
  parsePositionKey,
  positionKey,
} from '../music/fretboard';
import { createFretboardChallenge, fretRangeLabel, modeLabel, randomFretRange } from '../music/fretboardTrainer';
import { DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS, noteName, pitchClassesFromIntervals, randomItem } from '../music/theory';
import { DEFAULT_FRETBOARD_ROOT_IDS, getRootOption, ROOT_OPTIONS, spellFormula, type RootOption } from '../music/spelling';
import type { FretboardChallenge, FretboardExerciseMode, FretPosition, PitchClass } from '../music/types';
import type { FretboardQuestionMode, TrainingArea, TrainingStats, UserSettings } from '../storage/types';
import { Fretboard } from './Fretboard';
import { Fretboard3D } from './Fretboard3D';

export interface FretboardDefinition {
  id: string;
  label: string;
  symbol?: string;
  intervals: number[];
  degrees: string[];
}

interface FretboardPracticeProps {
  area: TrainingArea;
  title: string;
  definitions: FretboardDefinition[];
  settings: UserSettings;
  stats: TrainingStats;
  onUpdateSettings(settings: Partial<UserSettings>): void;
  onRecordAttempt(area: TrainingArea, correct: boolean): void;
}

type ResultState =
  | { status: 'idle' }
  | { status: 'pending'; message: string }
  | { status: 'answered'; correct: boolean; message: string };

const MODES: FretboardExerciseMode[] = ['find-all', 'single-note', 'route'];

function selectedPositionsFromKeys(keys: string[], fretCount: number): FretPosition[] {
  const positions = makeFretboard(fretCount);
  const byKey = new Map(positions.map((position) => [positionKey(position), position]));
  return keys
    .map((key) => {
      const parsed = parsePositionKey(key);
      return byKey.get(`${parsed.stringIndex}:${parsed.fret}`);
    })
    .filter((position): position is FretPosition => Boolean(position));
}

function buildTitle(root: RootOption, definition: FretboardDefinition) {
  return `${root.label}${definition.symbol ?? ` ${definition.label}`}`;
}

function challengeNoteLabel(challenge: FretboardChallenge, pitchClass: PitchClass): string {
  const targetIndex = challenge.targetPitchClasses.indexOf(pitchClass);
  return targetIndex >= 0 ? challenge.targetNoteLabels[targetIndex] : positionPitchName(pitchClass);
}

function positionPitchName(pitchClass: PitchClass): string {
  return noteName(pitchClass);
}

function formatPosition(position: FretPosition, challenge: FretboardChallenge): string {
  const fretLabel = position.fret === 0 ? '空弦' : `${position.fret}品`;
  return `${position.stringNumber}弦${fretLabel} ${challengeNoteLabel(challenge, position.pitchClass)}`;
}

function targetPositionsForChallenge(fretCount: number, challenge: FretboardChallenge): FretPosition[] {
  return makeFretboard(fretCount).filter(
    (position) => isPositionInFretRange(position, challenge.fretRange) && challenge.targetPitchClasses.includes(position.pitchClass),
  );
}

function buildChallenge(
  root: RootOption,
  definition: FretboardDefinition,
  mode: FretboardExerciseMode,
  fretCount: number,
): FretboardChallenge {
  const fretRange = randomFretRange(fretCount);
  const targetPitchClasses = pitchClassesFromIntervals(root.pitchClass, definition.intervals);
  const targetNoteLabels = spellFormula(root, definition.intervals, definition.degrees);
  const rangePositions = makeFretboard(fretCount).filter((position) => isPositionInFretRange(position, fretRange));
  const focusIndexes = targetPitchClasses
    .map((pitchClass, index) => (rangePositions.some((position) => position.pitchClass === pitchClass) ? index : undefined))
    .filter((index): index is number => index !== undefined);

  return createFretboardChallenge({
    mode,
    title: buildTitle(root, definition),
    root: root.pitchClass,
    rootName: root.label,
    fretRange,
    intervals: definition.intervals,
    degrees: definition.degrees,
    noteLabels: targetNoteLabels,
    focusIndexes,
  });
}

function accuracy(stats: TrainingStats) {
  if (stats.attempts === 0) {
    return '0%';
  }

  return `${Math.round((stats.correct / stats.attempts) * 100)}%`;
}

function targetLabelList(challenge: FretboardChallenge, separator: string): string {
  return challenge.targetDegrees
    .map((degree, index) => `${degree}/${challenge.targetNoteLabels[index]}`)
    .join(separator);
}

function questionModeKey(area: TrainingArea): 'arpeggioQuestionMode' | 'scaleQuestionMode' {
  return area === 'scale' ? 'scaleQuestionMode' : 'arpeggioQuestionMode';
}

function definitionShortLabel(definition: FretboardDefinition): string {
  return definition.symbol || definition.id;
}

export function FretboardPractice({
  area,
  title,
  definitions,
  settings,
  stats,
  onUpdateSettings,
  onRecordAttempt,
}: FretboardPracticeProps) {
  const isArpeggio = area === 'arpeggio';
  const enabledRootIds = useMemo(
    () => (settings.enabledFretboardRootIds.length > 0 ? settings.enabledFretboardRootIds : DEFAULT_FRETBOARD_ROOT_IDS),
    [settings.enabledFretboardRootIds],
  );
  const enabledArpeggioChordIds = useMemo(() => {
    if (!isArpeggio) {
      return definitions.map((item) => item.id);
    }

    const validIds = new Set(definitions.map((item) => item.id));
    const configuredIds = settings.enabledArpeggioChordIds.filter((id) => validIds.has(id));
    const fallbackIds = DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS.filter((id) => validIds.has(id));

    if (configuredIds.length > 0) {
      return configuredIds;
    }

    return fallbackIds.length > 0 ? fallbackIds : definitions.map((item) => item.id);
  }, [definitions, isArpeggio, settings.enabledArpeggioChordIds]);
  const randomDefinitionPool = useMemo(() => {
    if (!isArpeggio) {
      return definitions;
    }

    const enabledIds = new Set(enabledArpeggioChordIds);
    const pool = definitions.filter((item) => enabledIds.has(item.id));
    return pool.length > 0 ? pool : definitions;
  }, [definitions, enabledArpeggioChordIds, isArpeggio]);
  const modeSettingKey = questionModeKey(area);
  const questionMode = settings[modeSettingKey] as FretboardQuestionMode;
  const [rootId, setRootId] = useState(() => randomItem(enabledRootIds));
  const [definitionId, setDefinitionId] = useState(definitions[0].id);
  const [mode, setMode] = useState<FretboardExerciseMode>('find-all');
  const rootOption = useMemo(() => getRootOption(rootId), [rootId]);
  const definition = useMemo(() => definitions.find((item) => item.id === definitionId) ?? definitions[0], [definitionId, definitions]);
  const [challenge, setChallenge] = useState(() => buildChallenge(rootOption, definition, mode, settings.fretCount));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState>({ status: 'idle' });
  const targetPositionsInRange = useMemo(
    () => targetPositionsForChallenge(settings.fretCount, challenge),
    [settings.fretCount, challenge],
  );
  const expectedSelectionCount = challenge.mode === 'route'
    ? challenge.targetPitchClasses.length
    : challenge.mode === 'single-note'
      ? 1
      : targetPositionsInRange.length;

  useEffect(() => {
    if (questionMode === 'random' && !enabledRootIds.includes(rootId)) {
      setRootId(enabledRootIds[0] ?? DEFAULT_FRETBOARD_ROOT_IDS[0]);
    }
  }, [enabledRootIds, questionMode, rootId]);

  useEffect(() => {
    if (questionMode === 'random' && isArpeggio && !enabledArpeggioChordIds.includes(definitionId)) {
      setDefinitionId(enabledArpeggioChordIds[0] ?? definitions[0].id);
    }
  }, [definitionId, definitions, enabledArpeggioChordIds, isArpeggio, questionMode]);

  useEffect(() => {
    if (questionMode === 'manual') {
      setChallenge(buildChallenge(rootOption, definition, mode, settings.fretCount));
      setSelectedKeys([]);
      setResult({ status: 'idle' });
    }
  }, [rootOption, definition, mode, settings.fretCount, questionMode]);

  useEffect(() => {
    if (questionMode === 'random') {
      resetChallenge();
    }
  }, [questionMode, mode, settings.fretCount, enabledRootIds, randomDefinitionPool]);

  function resetChallenge() {
    const nextRootId = questionMode === 'random' ? randomItem(enabledRootIds) : rootId;
    const nextDefinition = questionMode === 'random' ? randomItem(randomDefinitionPool) : definition;
    const nextRootOption = getRootOption(nextRootId);

    setRootId(nextRootId);
    setDefinitionId(nextDefinition.id);
    setChallenge(buildChallenge(nextRootOption, nextDefinition, mode, settings.fretCount));
    setSelectedKeys([]);
    setResult({ status: 'idle' });
  }

  function updateQuestionMode(nextMode: FretboardQuestionMode) {
    onUpdateSettings({ [modeSettingKey]: nextMode } as Partial<UserSettings>);
  }

  function toggleRootInPool(root: RootOption) {
    const hasRoot = enabledRootIds.includes(root.id);
    if (hasRoot && enabledRootIds.length === 1) {
      return;
    }

    const nextRootIds = hasRoot ? enabledRootIds.filter((id) => id !== root.id) : [...enabledRootIds, root.id];
    onUpdateSettings({ enabledFretboardRootIds: nextRootIds });
  }

  function toggleArpeggioChordInPool(item: FretboardDefinition) {
    const hasDefinition = enabledArpeggioChordIds.includes(item.id);
    if (hasDefinition && enabledArpeggioChordIds.length === 1) {
      return;
    }

    const nextDefinitionIds = hasDefinition
      ? enabledArpeggioChordIds.filter((id) => id !== item.id)
      : [...enabledArpeggioChordIds, item.id];
    onUpdateSettings({ enabledArpeggioChordIds: nextDefinitionIds });
  }

  function useDefaultArpeggioChordPool() {
    const validIds = new Set(definitions.map((item) => item.id));
    const defaultIds = DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS.filter((id) => validIds.has(id));
    onUpdateSettings({ enabledArpeggioChordIds: defaultIds.length > 0 ? defaultIds : definitions.map((item) => item.id) });
  }

  function togglePosition(position: FretPosition) {
    if (result.status === 'answered') {
      return;
    }

    if (!isPositionInFretRange(position, challenge.fretRange)) {
      return;
    }

    const key = positionKey(position);
    setSelectedKeys((current) => {
      if (challenge.mode === 'single-note') {
        return [key];
      }

      if (challenge.mode === 'route') {
        if (current.includes(key)) {
          return current.filter((item) => item !== key);
        }

        return current.length >= challenge.targetPitchClasses.length ? current : [...current, key];
      }

      return current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    });
    setResult({ status: 'idle' });
  }

  function submitAnswer() {
    const selectedPositions = selectedPositionsFromKeys(selectedKeys, settings.fretCount).filter((position) =>
      isPositionInFretRange(position, challenge.fretRange),
    );
    if (selectedPositions.length === 0) {
      setResult({ status: 'pending', message: '需要先选择至少一个位置。' });
      return;
    }

    let correct = false;
    let message = '';

    if (challenge.mode === 'find-all') {
      const evaluation = evaluateFindAllPositions(selectedPositions, targetPositionsInRange);
      correct = evaluation.correct;
      message = correct
        ? '正确。'
        : `还缺 ${evaluation.missingPositions.map((position) => formatPosition(position, challenge)).join('、') || '无'}；误选 ${evaluation.wrongPositions.map((position) => formatPosition(position, challenge)).join('、') || '无'}。`;
    }

    if (challenge.mode === 'single-note') {
      correct = challenge.focusPitchClass !== undefined && evaluateSingleNote(selectedPositions, challenge.focusPitchClass);
      message = correct ? '正确。' : `目标是 ${challenge.focusDegree} / ${challenge.focusNoteLabel ?? challenge.rootName}。`;
    }

    if (challenge.mode === 'route') {
      correct = evaluateRoute(selectedPositions, challenge.targetPitchClasses);
      message = correct ? '正确。' : `顺序应为 ${targetLabelList(challenge, ' - ')}。`;
    }

    onRecordAttempt(area, correct);
    setResult({ status: 'answered', correct, message });
  }

  function promptText() {
    if (challenge.mode === 'find-all') {
      return `${challenge.title}：找出范围内所有 ${targetLabelList(challenge, '、')}`;
    }

    if (challenge.mode === 'single-note') {
      return `${challenge.title}：${challenge.focusDegree} / ${challenge.focusNoteLabel ?? challenge.rootName}`;
    }

    return `${challenge.title}：${targetLabelList(challenge, ' - ')}`;
  }

  return (
    <section className="training-layout" aria-labelledby={`${area}-title`}>
      <div className="exercise-main">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{questionMode === 'random' ? '随机出题' : '手动出题'} · {modeLabel(mode)}</p>
            <h2 id={`${area}-title`}>{title}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => playPitchClasses(challenge.targetPitchClasses)}>
            播放目标音
          </button>
        </div>

        <div className="prompt-strip">
          <strong>{promptText()}</strong>
          <span>{fretRangeLabel(challenge.fretRange)} · {selectedKeys.length} / {expectedSelectionCount}</span>
        </div>
        <p className="helper-text">本题只在 {fretRangeLabel(challenge.fretRange)} 内作答；范围外位置已禁用。</p>

        {settings.fretboardViewMode === 'player' ? (
          <Fretboard3D
            fretCount={settings.fretCount}
            selectedKeys={selectedKeys}
            targetPitchClasses={challenge.targetPitchClasses}
            targetDegrees={challenge.targetDegrees}
            targetNoteLabels={challenge.targetNoteLabels}
            revealed={result.status === 'answered'}
            showNoteNames={settings.showNoteNames}
            showDegrees={settings.showDegrees}
            stringOrder={settings.fretboardStringOrder}
            isPositionEnabled={(position) => isPositionInFretRange(position, challenge.fretRange)}
            onToggle={togglePosition}
          />
        ) : (
          <Fretboard
            fretCount={settings.fretCount}
            selectedKeys={selectedKeys}
            targetPitchClasses={challenge.targetPitchClasses}
            targetDegrees={challenge.targetDegrees}
            targetNoteLabels={challenge.targetNoteLabels}
            revealed={result.status === 'answered'}
            showNoteNames={settings.showNoteNames}
            showDegrees={settings.showDegrees}
            viewMode={settings.fretboardViewMode}
            stringOrder={settings.fretboardStringOrder}
            isPositionEnabled={(position) => isPositionInFretRange(position, challenge.fretRange)}
            onToggle={togglePosition}
          />
        )}

        <div className="action-row">
          <button type="button" className="primary-button" onClick={submitAnswer}>
            提交
          </button>
          <button type="button" className="secondary-button" onClick={resetChallenge}>
            下一题
          </button>
          <button type="button" className="ghost-button" onClick={() => setSelectedKeys([])}>
            清空
          </button>
        </div>

        {result.status !== 'idle' && (
          <p className={result.status === 'answered' && result.correct ? 'feedback correct' : 'feedback'}>
            {result.message}
          </p>
        )}
      </div>

      <aside className="control-panel">
        <div>
          <span className="field-label">出题方式</span>
          <div className="segmented">
            <button
              type="button"
              className={questionMode === 'manual' ? 'active' : ''}
              onClick={() => updateQuestionMode('manual')}
            >
              手动
            </button>
            <button
              type="button"
              className={questionMode === 'random' ? 'active' : ''}
              onClick={() => updateQuestionMode('random')}
            >
              随机
            </button>
          </div>
        </div>

        <label>
          根音 / 调
          <select value={rootId} disabled={questionMode === 'random'} onChange={(event) => setRootId(event.target.value)}>
            {ROOT_OPTIONS.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          类型
          <select
            value={definitionId}
            disabled={questionMode === 'random'}
            onChange={(event) => setDefinitionId(event.target.value)}
          >
            {definitions.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {isArpeggio && (
          <div>
            <div className="inline-heading">
              <span className="field-label">随机和弦池</span>
              <div className="inline-actions">
                <button type="button" className="ghost-button compact-button" onClick={useDefaultArpeggioChordPool}>
                  默认
                </button>
                <button
                  type="button"
                  className="ghost-button compact-button"
                  onClick={() => onUpdateSettings({ enabledArpeggioChordIds: definitions.map((item) => item.id) })}
                >
                  全选
                </button>
              </div>
            </div>
            <div className="chord-toggle-grid">
              {definitions.map((item) => {
                const checked = enabledArpeggioChordIds.includes(item.id);
                return (
                  <label className="chord-toggle" key={item.id} title={item.label}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={checked && enabledArpeggioChordIds.length === 1}
                      onChange={() => toggleArpeggioChordInPool(item)}
                    />
                    <span>{definitionShortLabel(item)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <span className="field-label">模式</span>
          <div className="segmented">
            {MODES.map((item) => (
              <button
                type="button"
                className={item === mode ? 'active' : ''}
                key={item}
                onClick={() => setMode(item)}
              >
                {modeLabel(item)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="inline-heading">
            <span className="field-label">随机根音 / 调池</span>
            <button
              type="button"
              className="ghost-button compact-button"
              onClick={() => onUpdateSettings({ enabledFretboardRootIds: [...DEFAULT_FRETBOARD_ROOT_IDS] })}
            >
              全选
            </button>
          </div>
          <div className="root-toggle-grid">
            {ROOT_OPTIONS.map((item) => {
              const checked = enabledRootIds.includes(item.id);
              return (
                <label className="root-toggle" key={item.id}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked && enabledRootIds.length === 1}
                    onChange={() => toggleRootInPool(item)}
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="stats-grid">
          <span>次数<strong>{stats.attempts}</strong></span>
          <span>正确率<strong>{accuracy(stats)}</strong></span>
          <span>连续<strong>{stats.streak}</strong></span>
          <span>最佳<strong>{stats.bestStreak}</strong></span>
        </div>
      </aside>
    </section>
  );
}
