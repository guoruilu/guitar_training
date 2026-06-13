import { describe, expect, it } from 'vitest';
import { filterCutoffForMidi, midiToFrequency } from './synth';

describe('audio synth helpers', () => {
  it('converts the requested ear-training endpoints to frequencies', () => {
    expect(midiToFrequency(21)).toBeCloseTo(27.5, 5);
    expect(midiToFrequency(108)).toBeCloseTo(4186.009, 3);
  });

  it('keeps the low-pass filter above high-note fundamentals', () => {
    expect(filterCutoffForMidi(108)).toBeGreaterThan(midiToFrequency(108));
    expect(filterCutoffForMidi(21)).toBe(2200);
  });
});
