import { describe, expect, it } from 'vitest';
import { makeFretboard } from '../music/fretboard';
import { orderFrettedPositions, orderStringGroups } from './Fretboard';
import { PLAYER_CAMERA_X, stringXPositions } from './Fretboard3D';

describe('fretboard display ordering', () => {
  it('supports first string at the top or bottom', () => {
    const positions = makeFretboard(3);

    expect(orderStringGroups(positions, 'first-string-bottom').map((group) => group[0].stringNumber)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(orderStringGroups(positions, 'first-string-top').map((group) => group[0].stringNumber)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('mirrors fret order for the player view', () => {
    const sixthString = makeFretboard(4).filter((position) => position.stringNumber === 6);

    expect(orderFrettedPositions(sixthString, 'diagram').map((position) => position.fret)).toEqual([1, 2, 3, 4]);
    expect(orderFrettedPositions(sixthString, 'player').map((position) => position.fret)).toEqual([4, 3, 2, 1]);
  });

  it('places the sixth string closer to the default 3D player camera', () => {
    const defaultPositions = stringXPositions('first-string-top');
    const flippedPositions = stringXPositions('first-string-bottom');
    const distanceToCamera = (x: number) => Math.abs(x - PLAYER_CAMERA_X);

    expect(distanceToCamera(defaultPositions.get(0) ?? 0)).toBeLessThan(distanceToCamera(defaultPositions.get(5) ?? 0));
    expect(distanceToCamera(flippedPositions.get(5) ?? 0)).toBeLessThan(distanceToCamera(flippedPositions.get(0) ?? 0));
  });
});
