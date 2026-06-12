import { useMemo, useState } from 'react';
import { buildChordMidiNotes, playMidiNotes } from '../../shared/audio/synth';
import { CHORD_QUALITIES, INTERVALS, NOTE_NAMES_SHARP, randomItem, shuffled } from '../../shared/music/theory';
import type { ChordQuality, IntervalDefinition, PitchClass } from '../../shared/music/types';
import type { TrainingArea, TrainingStats } from '../../shared/storage/types';

interface EarTrainingProps {
  intervalStats: TrainingStats;
  chordStats: TrainingStats;
  onRecordAttempt(area: TrainingArea, correct: boolean): void;
}

type Direction = 'both' | 'up' | 'down';
type EarTab = 'interval' | 'chord';

interface IntervalChallenge {
  rootMidi: number;
  secondMidi: number;
  interval: IntervalDefinition;
  direction: Exclude<Direction, 'both'>;
}

interface ChordChallenge {
  root: PitchClass;
  quality: ChordQuality;
  midiNotes: number[];
}

function createIntervalChallenge(direction: Direction): IntervalChallenge {
  const interval = randomItem(INTERVALS);
  const resolvedDirection = direction === 'both' ? randomItem(['up', 'down'] as const) : direction;
  const rootMidi = resolvedDirection === 'up' ? 54 + Math.floor(Math.random() * 12) : 66 + Math.floor(Math.random() * 12);

  return {
    rootMidi,
    secondMidi: resolvedDirection === 'up' ? rootMidi + interval.semitones : rootMidi - interval.semitones,
    interval,
    direction: resolvedDirection,
  };
}

function createChordChallenge(): ChordChallenge {
  const root = Math.floor(Math.random() * 12) as PitchClass;
  const quality = randomItem(CHORD_QUALITIES);

  return {
    root,
    quality,
    midiNotes: buildChordMidiNotes(root, quality.intervals, 4),
  };
}

function accuracy(stats: TrainingStats) {
  if (stats.attempts === 0) {
    return '0%';
  }

  return `${Math.round((stats.correct / stats.attempts) * 100)}%`;
}

function StatsLine({ stats }: { stats: TrainingStats }) {
  return (
    <div className="stats-grid compact">
      <span>次数<strong>{stats.attempts}</strong></span>
      <span>正确率<strong>{accuracy(stats)}</strong></span>
      <span>连续<strong>{stats.streak}</strong></span>
      <span>最佳<strong>{stats.bestStreak}</strong></span>
    </div>
  );
}

function IntervalTrainer({ stats, onRecordAttempt }: { stats: TrainingStats; onRecordAttempt(area: TrainingArea, correct: boolean): void }) {
  const [direction, setDirection] = useState<Direction>('both');
  const [challenge, setChallenge] = useState(() => createIntervalChallenge('both'));
  const [answered, setAnswered] = useState<string | null>(null);

  async function play(challengeToPlay = challenge) {
    await playMidiNotes([challengeToPlay.rootMidi, challengeToPlay.secondMidi], { stagger: 0.75, duration: 0.72 });
  }

  async function next() {
    const nextChallenge = createIntervalChallenge(direction);
    setChallenge(nextChallenge);
    setAnswered(null);
    await play(nextChallenge);
  }

  function answer(interval: IntervalDefinition) {
    if (answered) {
      return;
    }

    const correct = interval.id === challenge.interval.id;
    setAnswered(interval.id);
    onRecordAttempt('ear-interval', correct);
  }

  return (
    <div className="ear-panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Interval</p>
          <h2>音程听力</h2>
        </div>
        <div className="action-row tight">
          <button type="button" className="secondary-button" onClick={() => play()}>
            重播
          </button>
          <button type="button" className="primary-button" onClick={next}>
            下一题
          </button>
        </div>
      </div>

      <div className="prompt-strip">
        <strong>{challenge.direction === 'up' ? '上行' : '下行'}音程</strong>
        <span>{answered ? `答案：${challenge.interval.label}` : '待作答'}</span>
      </div>

      <label className="inline-field">
        方向
        <select value={direction} onChange={(event) => setDirection(event.target.value as Direction)}>
          <option value="both">随机</option>
          <option value="up">上行</option>
          <option value="down">下行</option>
        </select>
      </label>

      <div className="choice-grid">
        {INTERVALS.map((interval) => {
          const isChosen = answered === interval.id;
          const isCorrect = answered && interval.id === challenge.interval.id;
          return (
            <button
              type="button"
              key={interval.id}
              className={['choice-button', isChosen ? 'chosen' : '', isCorrect ? 'correct' : ''].filter(Boolean).join(' ')}
              onClick={() => answer(interval)}
              disabled={Boolean(answered)}
            >
              <strong>{interval.shortLabel}</strong>
              <span>{interval.label}</span>
            </button>
          );
        })}
      </div>

      <StatsLine stats={stats} />
    </div>
  );
}

function ChordTrainer({ stats, onRecordAttempt }: { stats: TrainingStats; onRecordAttempt(area: TrainingArea, correct: boolean): void }) {
  const [challenge, setChallenge] = useState(() => createChordChallenge());
  const [answered, setAnswered] = useState<string | null>(null);
  const answers = useMemo(() => shuffled(CHORD_QUALITIES), [challenge]);

  async function play(challengeToPlay = challenge) {
    await playMidiNotes(challengeToPlay.midiNotes, { duration: 1.15, stagger: 0 });
  }

  async function next() {
    const nextChallenge = createChordChallenge();
    setChallenge(nextChallenge);
    setAnswered(null);
    await play(nextChallenge);
  }

  function answer(quality: ChordQuality) {
    if (answered) {
      return;
    }

    const correct = quality.id === challenge.quality.id;
    setAnswered(quality.id);
    onRecordAttempt('ear-chord', correct);
  }

  return (
    <div className="ear-panel">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Chord</p>
          <h2>和声听力</h2>
        </div>
        <div className="action-row tight">
          <button type="button" className="secondary-button" onClick={() => play()}>
            重播
          </button>
          <button type="button" className="primary-button" onClick={next}>
            下一题
          </button>
        </div>
      </div>

      <div className="prompt-strip">
        <strong>识别和弦性质</strong>
        <span>{answered ? `答案：${NOTE_NAMES_SHARP[challenge.root]}${challenge.quality.symbol}` : '待作答'}</span>
      </div>

      <div className="choice-grid chords">
        {answers.map((quality) => {
          const isChosen = answered === quality.id;
          const isCorrect = answered && quality.id === challenge.quality.id;
          return (
            <button
              type="button"
              key={quality.id}
              className={['choice-button', isChosen ? 'chosen' : '', isCorrect ? 'correct' : ''].filter(Boolean).join(' ')}
              onClick={() => answer(quality)}
              disabled={Boolean(answered)}
            >
              <strong>{quality.symbol || 'maj'}</strong>
              <span>{quality.label}</span>
            </button>
          );
        })}
      </div>

      <StatsLine stats={stats} />
    </div>
  );
}

export function EarTraining({ intervalStats, chordStats, onRecordAttempt }: EarTrainingProps) {
  const [tab, setTab] = useState<EarTab>('interval');

  return (
    <section className="training-layout single-column" aria-labelledby="ear-training-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Ear Training</p>
          <h1 id="ear-training-title">听力训练</h1>
        </div>
        <div className="segmented standalone">
          <button type="button" className={tab === 'interval' ? 'active' : ''} onClick={() => setTab('interval')}>
            音程
          </button>
          <button type="button" className={tab === 'chord' ? 'active' : ''} onClick={() => setTab('chord')}>
            和声
          </button>
        </div>
      </div>

      {tab === 'interval' ? (
        <IntervalTrainer stats={intervalStats} onRecordAttempt={onRecordAttempt} />
      ) : (
        <ChordTrainer stats={chordStats} onRecordAttempt={onRecordAttempt} />
      )}
    </section>
  );
}
