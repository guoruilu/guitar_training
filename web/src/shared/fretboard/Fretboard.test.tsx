import { describe, expect, it } from 'vitest';
import { makeFretboard } from '../music/fretboard';
import { orderFrettedPositions, orderStringGroups } from './Fretboard';

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
});
