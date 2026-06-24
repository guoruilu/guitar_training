import type { ChordQuality, IntervalDefinition, PitchClass, ScaleDefinition } from './types';

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const PITCH_CLASS_BY_NAME: Record<string, PitchClass> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

export const INTERVALS: IntervalDefinition[] = [
  { id: 'P1', label: '纯一度', shortLabel: 'P1', semitones: 0 },
  { id: 'm2', label: '小二度', shortLabel: 'm2', semitones: 1 },
  { id: 'M2', label: '大二度', shortLabel: 'M2', semitones: 2 },
  { id: 'm3', label: '小三度', shortLabel: 'm3', semitones: 3 },
  { id: 'M3', label: '大三度', shortLabel: 'M3', semitones: 4 },
  { id: 'P4', label: '纯四度', shortLabel: 'P4', semitones: 5 },
  { id: 'TT', label: '三全音', shortLabel: 'TT', semitones: 6 },
  { id: 'P5', label: '纯五度', shortLabel: 'P5', semitones: 7 },
  { id: 'm6', label: '小六度', shortLabel: 'm6', semitones: 8 },
  { id: 'M6', label: '大六度', shortLabel: 'M6', semitones: 9 },
  { id: 'm7', label: '小七度', shortLabel: 'm7', semitones: 10 },
  { id: 'M7', label: '大七度', shortLabel: 'M7', semitones: 11 },
  { id: 'P8', label: '八度', shortLabel: 'P8', semitones: 12 },
];

export const CHORD_QUALITIES: ChordQuality[] = [
  { id: 'maj', label: '大三和弦', symbol: '', intervals: [0, 4, 7], degrees: ['R', '3', '5'] },
  { id: 'min', label: '小三和弦', symbol: 'm', intervals: [0, 3, 7], degrees: ['R', 'b3', '5'] },
  { id: 'dim', label: '减三和弦', symbol: 'dim', intervals: [0, 3, 6], degrees: ['R', 'b3', 'b5'] },
  { id: 'aug', label: '增三和弦', symbol: 'aug', intervals: [0, 4, 8], degrees: ['R', '3', '#5'] },
  { id: 'sus2', label: '挂二和弦', symbol: 'sus2', intervals: [0, 2, 7], degrees: ['R', '2', '5'] },
  { id: 'sus4', label: '挂四和弦', symbol: 'sus4', intervals: [0, 5, 7], degrees: ['R', '4', '5'] },
  { id: '6', label: '大六和弦', symbol: '6', intervals: [0, 4, 7, 9], degrees: ['R', '3', '5', '6'] },
  { id: 'min6', label: '小六和弦', symbol: 'm6', intervals: [0, 3, 7, 9], degrees: ['R', 'b3', '5', '6'] },
  { id: 'add9', label: '加九和弦', symbol: 'add9', intervals: [0, 4, 7, 14], degrees: ['R', '3', '5', '9'] },
  { id: 'minadd9', label: '小加九和弦', symbol: 'm(add9)', intervals: [0, 3, 7, 14], degrees: ['R', 'b3', '5', '9'] },
  { id: '6-9', label: '六九和弦', symbol: '6/9', intervals: [0, 4, 7, 9, 14], degrees: ['R', '3', '5', '6', '9'] },
  { id: 'min6-9', label: '小六九和弦', symbol: 'm6/9', intervals: [0, 3, 7, 9, 14], degrees: ['R', 'b3', '5', '6', '9'] },
  { id: 'maj7', label: '大七和弦', symbol: 'maj7', intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'] },
  { id: '7', label: '属七和弦', symbol: '7', intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', 'b7'] },
  { id: 'min7', label: '小七和弦', symbol: 'm7', intervals: [0, 3, 7, 10], degrees: ['R', 'b3', '5', 'b7'] },
  { id: 'minMaj7', label: '小大七和弦', symbol: 'm(maj7)', intervals: [0, 3, 7, 11], degrees: ['R', 'b3', '5', '7'] },
  { id: 'm7b5', label: '半减七和弦', symbol: 'm7b5', intervals: [0, 3, 6, 10], degrees: ['R', 'b3', 'b5', 'b7'] },
  { id: 'dim7', label: '减七和弦', symbol: 'dim7', intervals: [0, 3, 6, 9], degrees: ['R', 'b3', 'b5', 'bb7'] },
  { id: '7sus4', label: '属七挂四和弦', symbol: '7sus4', intervals: [0, 5, 7, 10], degrees: ['R', '4', '5', 'b7'] },
  { id: '9', label: '属九和弦', symbol: '9', intervals: [0, 4, 7, 10, 14], degrees: ['R', '3', '5', 'b7', '9'] },
  { id: 'maj9', label: '大九和弦', symbol: 'maj9', intervals: [0, 4, 7, 11, 14], degrees: ['R', '3', '5', '7', '9'] },
  { id: 'min9', label: '小九和弦', symbol: 'm9', intervals: [0, 3, 7, 10, 14], degrees: ['R', 'b3', '5', 'b7', '9'] },
  { id: '11', label: '属十一和弦', symbol: '11', intervals: [0, 4, 7, 10, 14, 17], degrees: ['R', '3', '5', 'b7', '9', '11'] },
  { id: 'min11', label: '小十一和弦', symbol: 'm11', intervals: [0, 3, 7, 10, 14, 17], degrees: ['R', 'b3', '5', 'b7', '9', '11'] },
  { id: '13', label: '属十三和弦', symbol: '13', intervals: [0, 4, 7, 10, 14, 21], degrees: ['R', '3', '5', 'b7', '9', '13'] },
  { id: 'maj13', label: '大十三和弦', symbol: 'maj13', intervals: [0, 4, 7, 11, 14, 21], degrees: ['R', '3', '5', '7', '9', '13'] },
  { id: 'min13', label: '小十三和弦', symbol: 'm13', intervals: [0, 3, 7, 10, 14, 21], degrees: ['R', 'b3', '5', 'b7', '9', '13'] },
  { id: '7b5', label: '属七降五和弦', symbol: '7b5', intervals: [0, 4, 6, 10], degrees: ['R', '3', 'b5', 'b7'] },
  { id: '7#5', label: '属七升五和弦', symbol: '7#5', intervals: [0, 4, 8, 10], degrees: ['R', '3', '#5', 'b7'] },
  { id: '7b9', label: '属七降九和弦', symbol: '7b9', intervals: [0, 4, 7, 10, 13], degrees: ['R', '3', '5', 'b7', 'b9'] },
  { id: '7#9', label: '属七升九和弦', symbol: '7#9', intervals: [0, 4, 7, 10, 15], degrees: ['R', '3', '5', 'b7', '#9'] },
  { id: '7#11', label: '属七升十一和弦', symbol: '7#11', intervals: [0, 4, 7, 10, 18], degrees: ['R', '3', '5', 'b7', '#11'] },
  { id: '7b13', label: '属七降十三和弦', symbol: '7b13', intervals: [0, 4, 7, 10, 20], degrees: ['R', '3', '5', 'b7', 'b13'] },
  { id: '13b9', label: '十三降九和弦', symbol: '13b9', intervals: [0, 4, 7, 10, 13, 21], degrees: ['R', '3', '5', 'b7', 'b9', '13'] },
  { id: '7alt', label: '变化属七和弦', symbol: '7alt', intervals: [0, 4, 10, 13, 15, 18, 20], degrees: ['R', '3', 'b7', 'b9', '#9', '#11', 'b13'] },
  { id: 'maj7#11', label: '大七升十一和弦', symbol: 'maj7#11', intervals: [0, 4, 7, 11, 18], degrees: ['R', '3', '5', '7', '#11'] },
];

export const DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS = ['7', 'maj7', 'min7', 'm7b5', 'dim7'] as const;

export function normalizeChordQualityIds(
  ids: unknown,
  fallback: readonly string[] = DEFAULT_RANDOM_ARPEGGIO_CHORD_IDS,
): string[] {
  const validIds = new Set(CHORD_QUALITIES.map((quality) => quality.id));
  const fallbackIds = fallback.filter((id) => validIds.has(id));

  if (!Array.isArray(ids)) {
    return fallbackIds.length > 0 ? [...fallbackIds] : CHORD_QUALITIES.map((quality) => quality.id);
  }

  const seen = new Set<string>();
  const result = ids.filter((id): id is string => {
    if (typeof id !== 'string' || !validIds.has(id) || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });

  return result.length > 0
    ? result
    : fallbackIds.length > 0
      ? [...fallbackIds]
      : CHORD_QUALITIES.map((quality) => quality.id);
}

export const SCALE_DEFINITIONS: ScaleDefinition[] = [
  { id: 'major', label: '大调音阶', intervals: [0, 2, 4, 5, 7, 9, 11], degrees: ['R', '2', '3', '4', '5', '6', '7'] },
  { id: 'natural-minor', label: '自然小调音阶', intervals: [0, 2, 3, 5, 7, 8, 10], degrees: ['R', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'harmonic-minor', label: '和声小调音阶', intervals: [0, 2, 3, 5, 7, 8, 11], degrees: ['R', '2', 'b3', '4', '5', 'b6', '7'] },
  { id: 'melodic-minor', label: '旋律小调音阶', intervals: [0, 2, 3, 5, 7, 9, 11], degrees: ['R', '2', 'b3', '4', '5', '6', '7'] },
  { id: 'major-pentatonic', label: '大调五声音阶', intervals: [0, 2, 4, 7, 9], degrees: ['R', '2', '3', '5', '6'] },
  { id: 'minor-pentatonic', label: '小调五声音阶', intervals: [0, 3, 5, 7, 10], degrees: ['R', 'b3', '4', '5', 'b7'] },
  { id: 'blues', label: '布鲁斯音阶', intervals: [0, 3, 5, 6, 7, 10], degrees: ['R', 'b3', '4', 'b5', '5', 'b7'] },
  { id: 'dorian', label: 'Dorian 多利亚', intervals: [0, 2, 3, 5, 7, 9, 10], degrees: ['R', '2', 'b3', '4', '5', '6', 'b7'] },
  { id: 'phrygian', label: 'Phrygian 弗里几亚', intervals: [0, 1, 3, 5, 7, 8, 10], degrees: ['R', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'lydian', label: 'Lydian 利底亚', intervals: [0, 2, 4, 6, 7, 9, 11], degrees: ['R', '2', '3', '#4', '5', '6', '7'] },
  { id: 'mixolydian', label: 'Mixolydian 混合利底亚', intervals: [0, 2, 4, 5, 7, 9, 10], degrees: ['R', '2', '3', '4', '5', '6', 'b7'] },
  { id: 'locrian', label: 'Locrian 洛克里亚', intervals: [0, 1, 3, 5, 6, 8, 10], degrees: ['R', 'b2', 'b3', '4', 'b5', 'b6', 'b7'] },
  { id: 'locrian-natural-2', label: 'Locrian natural 2', intervals: [0, 2, 3, 5, 6, 8, 10], degrees: ['R', '2', 'b3', '4', 'b5', 'b6', 'b7'] },
  { id: 'lydian-dominant', label: 'Lydian dominant', intervals: [0, 2, 4, 6, 7, 9, 10], degrees: ['R', '2', '3', '#4', '5', '6', 'b7'] },
  { id: 'altered', label: 'Altered 变化音阶', intervals: [0, 1, 3, 4, 6, 8, 10], degrees: ['R', 'b2', '#2', '3', 'b5', 'b6', 'b7'] },
  { id: 'whole-tone', label: '全音音阶', intervals: [0, 2, 4, 6, 8, 10], degrees: ['R', '2', '3', '#4', '#5', 'b7'] },
  { id: 'diminished-wh', label: '减音阶 W-H', intervals: [0, 2, 3, 5, 6, 8, 9, 11], degrees: ['R', '2', 'b3', '4', 'b5', 'b6', '6', '7'] },
  { id: 'diminished-hw', label: '半全减音阶 H-W', intervals: [0, 1, 3, 4, 6, 7, 9, 10], degrees: ['R', 'b2', '#2', '3', 'b5', '5', '6', 'b7'] },
  { id: 'bebop-dominant', label: '属 Bebop 音阶', intervals: [0, 2, 4, 5, 7, 9, 10, 11], degrees: ['R', '2', '3', '4', '5', '6', 'b7', '7'] },
  { id: 'bebop-major', label: '大 Bebop 音阶', intervals: [0, 2, 4, 5, 7, 8, 9, 11], degrees: ['R', '2', '3', '4', '5', '#5', '6', '7'] },
  { id: 'minor-major-bebop', label: '小大 Bebop 音阶', intervals: [0, 2, 3, 5, 7, 8, 10, 11], degrees: ['R', '2', 'b3', '4', '5', 'b6', 'b7', '7'] },
  { id: 'mixolydian-b9-b13', label: 'Mixolydian b9 b13', intervals: [0, 1, 4, 5, 7, 8, 10], degrees: ['R', 'b2', '3', '4', '5', 'b6', 'b7'] },
  { id: 'major-blues', label: '大调布鲁斯音阶', intervals: [0, 2, 3, 4, 7, 9], degrees: ['R', '2', '#2', '3', '5', '6'] },
];

export function normalizePitchClass(value: number): PitchClass {
  return (((value % 12) + 12) % 12) as PitchClass;
}

export function noteName(pitchClass: number): string {
  return NOTE_NAMES_SHARP[normalizePitchClass(pitchClass)];
}

export function transpose(root: PitchClass, semitones: number): PitchClass {
  return normalizePitchClass(root + semitones);
}

export function pitchClassesFromIntervals(root: PitchClass, intervals: number[]): PitchClass[] {
  return intervals.map((interval) => transpose(root, interval));
}

export function chordLabel(root: PitchClass, quality: ChordQuality): string {
  return `${noteName(root)}${quality.symbol}`;
}

export function getChordQuality(id: string): ChordQuality {
  const quality = CHORD_QUALITIES.find((item) => item.id === id);
  if (!quality) {
    throw new Error(`Unknown chord quality: ${id}`);
  }
  return quality;
}

export function getScaleDefinition(id: string): ScaleDefinition {
  const scale = SCALE_DEFINITIONS.find((item) => item.id === id);
  if (!scale) {
    throw new Error(`Unknown scale: ${id}`);
  }
  return scale;
}

export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error(`Invalid random range: ${maxExclusive}`);
  }

  const cryptoObject = globalThis.crypto;
  if (cryptoObject?.getRandomValues) {
    const limit = 0xffffffff - (0xffffffff % maxExclusive);
    const randomValues = new Uint32Array(1);

    do {
      cryptoObject.getRandomValues(randomValues);
    } while (randomValues[0] >= limit);

    return randomValues[0] % maxExclusive;
  }

  return Math.floor((Math.random() + Date.now() % 997 / 997) % 1 * maxExclusive);
}

export function randomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot choose from an empty list');
  }

  return items[randomInt(items.length)];
}

export function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}
