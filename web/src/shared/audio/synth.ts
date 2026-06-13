import type { PitchClass } from '../music/types';

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function filterCutoffForMidi(midi: number): number {
  return Math.min(12000, Math.max(2200, midiToFrequency(midi) * 2.5));
}

export function pitchClassToMidi(pitchClass: PitchClass, octave = 4): number {
  const base = 12 * (octave + 1);
  return base + pitchClass;
}

function createEnvelope(ctx: AudioContext, start: number, duration: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.12, start + duration * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  return gain;
}

export async function playMidiNotes(midiNotes: number[], options: { duration?: number; stagger?: number } = {}) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const duration = options.duration ?? 0.95;
  const stagger = options.stagger ?? 0;
  const now = ctx.currentTime + 0.02;

  midiNotes.forEach((midi, index) => {
    const start = now + index * stagger;
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const envelope = createEnvelope(ctx, start, duration);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoffForMidi(midi), start);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  });
}

export function buildChordMidiNotes(root: PitchClass, intervals: number[], octave = 4): number[] {
  const rootMidi = pitchClassToMidi(root, octave);
  return intervals.map((interval) => rootMidi + interval);
}

export async function playPitchClasses(pitchClasses: PitchClass[], options: { duration?: number; stagger?: number } = {}) {
  await playMidiNotes(
    pitchClasses.map((pitchClass, index) => pitchClassToMidi(pitchClass, index > 2 ? 5 : 4)),
    options,
  );
}
