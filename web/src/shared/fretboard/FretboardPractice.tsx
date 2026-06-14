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
import { createFretboardChallenge, fretRangeLabel, modeLabel, randomFretRange, randomRoot } from '../music/fretboardTrainer';
import { NOTE_NAMES_SHARP, noteName, pitchClassesFromIntervals } from '../music/theory';
import type { FretboardChallenge, FretboardExerciseMode, FretPosition, PitchClass } from '../music/types';
import type { TrainingArea, TrainingStats, UserSettings } from '../storage/types';
import { Fretboard } from './Fretboard';

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

function buildTitle(root: PitchClass, definition: FretboardDefinition) {
  return `${noteName(root)}${definition.symbol ?? ` ${definition.label}`}`;
}

function formatPosition(position: FretPosition): string {
  return `${position.stringNumber}弦${position.fret}品 ${noteName(position.pitchClass)}`;
}

function targetPositionsForChallenge(fretCount: number, challenge: FretboardChallenge): FretPosition[] {
  return makeFretboard(fretCount).filter(
    (position) => isPositionInFretRange(position, challenge.fretRange) && challenge.targetPitchClasses.includes(position.pitchClass),
  );
}

function buildChallenge(
  root: PitchClass,
  definition: FretboardDefinition,
  mode: FretboardExerciseMode,
  fretCount: number,
): FretboardChallenge {
  const fretRange = randomFretRange(fretCount);
  const targetPitchClasses = pitchClassesFromIntervals(root, definition.intervals);
  const rangePositions = makeFretboard(fretCount).filter((position) => isPositionInFretRange(position, fretRange));
  const focusIndexes = targetPitchClasses
    .map((pitchClass, index) => (rangePositions.some((position) => position.pitchClass === pitchClass) ? index : undefined))
    .filter((index): index is number => index !== undefined);

  return createFretboardChallenge({
    mode,
    title: buildTitle(root, definition),
    root,
    fretRange,
    intervals: definition.intervals,
    degrees: definition.degrees,
    focusIndexes,
  });
}

function accuracy(stats: TrainingStats) {
  if (stats.attempts === 0) {
    return '0%';
  }

  return `${Math.round((stats.correct / stats.attempts) * 100)}%`;
}

export function FretboardPractice({ area, title, definitions, settings, stats, onRecordAttempt }: FretboardPracticeProps) {
  const [root, setRoot] = useState<PitchClass>(() => randomRoot());
  const [definitionId, setDefinitionId] = useState(definitions[0].id);
  const [mode, setMode] = useState<FretboardExerciseMode>('find-all');
  const definition = useMemo(() => definitions.find((item) => item.id === definitionId) ?? definitions[0], [definitionId, definitions]);
  const [challenge, setChallenge] = useState(() => buildChallenge(root, definition, mode, settings.fretCount));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState>({ status: 'idle' });
  const targetPitchClasses = useMemo(() => pitchClassesFromIntervals(root, definition.intervals), [root, definition]);
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
    setChallenge(buildChallenge(root, definition, mode, settings.fretCount));
    setSelectedKeys([]);
    setResult({ status: 'idle' });
  }, [root, definition, mode, settings.fretCount]);

  function resetChallenge() {
    const nextRoot = randomRoot();
    setRoot(nextRoot);
    setChallenge(buildChallenge(nextRoot, definition, mode, settings.fretCount));
    setSelectedKeys([]);
    setResult({ status: 'idle' });
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
      if (mode === 'single-note') {
        return [key];
      }

      if (mode === 'route') {
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
        : `还缺 ${evaluation.missingPositions.map(formatPosition).join('、') || '无'}；误选 ${evaluation.wrongPositions.map(formatPosition).join('、') || '无'}。`;
    }

    if (challenge.mode === 'single-note') {
      correct = challenge.focusPitchClass !== undefined && evaluateSingleNote(selectedPositions, challenge.focusPitchClass);
      message = correct ? '正确。' : `目标是 ${challenge.focusDegree} / ${noteName(challenge.focusPitchClass ?? challenge.root)}。`;
    }

    if (challenge.mode === 'route') {
      correct = evaluateRoute(selectedPositions, challenge.targetPitchClasses);
      message = correct ? '正确。' : `顺序应为 ${challenge.targetDegrees.join(' - ')}。`;
    }

    onRecordAttempt(area, correct);
    setResult({ status: 'answered', correct, message });
  }

  function promptText() {
    if (challenge.mode === 'find-all') {
      return `${challenge.title}：找出范围内所有 ${challenge.targetDegrees.join('、')}`;
    }

    if (challenge.mode === 'single-note') {
      return `${challenge.title}：${challenge.focusDegree} / ${noteName(challenge.focusPitchClass ?? challenge.root)}`;
    }

    return `${challenge.title}：${challenge.targetDegrees.join(' - ')}`;
  }

  return (
    <section className="training-layout" aria-labelledby={`${area}-title`}>
      <div className="exercise-main">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{modeLabel(mode)}</p>
            <h2 id={`${area}-title`}>{title}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => playPitchClasses(targetPitchClasses)}>
            播放目标音
          </button>
        </div>

        <div className="prompt-strip">
          <strong>{promptText()}</strong>
          <span>{fretRangeLabel(challenge.fretRange)} · {selectedKeys.length} / {expectedSelectionCount}</span>
        </div>
        <p className="helper-text">本题只在 {fretRangeLabel(challenge.fretRange)} 内作答；范围外位置已禁用。</p>

        <Fretboard
          fretCount={settings.fretCount}
          selectedKeys={selectedKeys}
          targetPitchClasses={challenge.targetPitchClasses}
          targetDegrees={challenge.targetDegrees}
          revealed={result.status === 'answered'}
          showNoteNames={settings.showNoteNames}
          showDegrees={settings.showDegrees}
          viewMode={settings.fretboardViewMode}
          stringOrder={settings.fretboardStringOrder}
          isPositionEnabled={(position) => isPositionInFretRange(position, challenge.fretRange)}
          onToggle={togglePosition}
        />

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
        <label>
          根音
          <select value={root} onChange={(event) => setRoot(Number(event.target.value) as PitchClass)}>
            {NOTE_NAMES_SHARP.map((name, index) => (
              <option value={index} key={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          类型
          <select value={definitionId} onChange={(event) => setDefinitionId(event.target.value)}>
            {definitions.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

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
