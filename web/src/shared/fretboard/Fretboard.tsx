import type { FretPosition, PitchClass } from '../music/types';
import { makeFretboard, positionKey } from '../music/fretboard';
import { noteName } from '../music/theory';
import type { FretboardStringOrder, FretboardViewMode } from '../storage/types';

interface FretboardProps {
  fretCount: number;
  selectedKeys: string[];
  targetPitchClasses: PitchClass[];
  targetDegrees: string[];
  targetNoteLabels: string[];
  revealed: boolean;
  showNoteNames: boolean;
  showDegrees: boolean;
  viewMode: FretboardViewMode;
  stringOrder: FretboardStringOrder;
  isPositionEnabled?(position: FretPosition): boolean;
  onToggle(position: FretPosition): void;
}

function labelForPosition(
  position: FretPosition,
  targetPitchClasses: PitchClass[],
  targetDegrees: string[],
  targetNoteLabels: string[],
  showNoteNames: boolean,
  showDegrees: boolean,
) {
  const targetIndex = targetPitchClasses.indexOf(position.pitchClass);
  const labels: string[] = [];

  if (showNoteNames) {
    labels.push(targetIndex >= 0 ? targetNoteLabels[targetIndex] : noteName(position.pitchClass));
  }

  if (showDegrees && targetIndex >= 0) {
    labels.push(targetDegrees[targetIndex]);
  }

  return labels.join(' ');
}

function ariaPositionLabel(position: FretPosition): string {
  const fretLabel = position.fret === 0 ? '空弦' : `${position.fret}品`;
  return `${position.stringNumber}弦 ${fretLabel} ${noteName(position.pitchClass)}`;
}

export function orderStringGroups(
  positions: FretPosition[],
  stringOrder: FretboardStringOrder,
): FretPosition[][] {
  const groups = Array.from({ length: 6 }, (_, stringIndex) =>
    positions.filter((position) => position.stringIndex === stringIndex),
  );

  return stringOrder === 'first-string-top' ? [...groups].reverse() : groups;
}

export function orderFrettedPositions(positions: FretPosition[], viewMode: FretboardViewMode): FretPosition[] {
  const fretted = positions.filter((position) => position.fret > 0);
  return viewMode === 'player' ? [...fretted].reverse() : fretted;
}

export function Fretboard({
  fretCount,
  selectedKeys,
  targetPitchClasses,
  targetDegrees,
  targetNoteLabels,
  revealed,
  showNoteNames,
  showDegrees,
  viewMode,
  stringOrder,
  isPositionEnabled = () => true,
  onToggle,
}: FretboardProps) {
  const positions = makeFretboard(fretCount);
  const selected = new Set(selectedKeys);
  const strings = orderStringGroups(positions, stringOrder);
  const fretNumbers = Array.from({ length: fretCount }, (_, index) => index + 1);
  const visibleFretNumbers = viewMode === 'player' ? [...fretNumbers].reverse() : fretNumbers;
  const gridTemplateColumns = viewMode === 'player'
    ? `48px repeat(${fretCount}, minmax(42px, 1fr)) 62px`
    : `48px 62px repeat(${fretCount}, minmax(42px, 1fr))`;

  function renderPositionButton(position: FretPosition, isOpenString = false) {
    const key = positionKey(position);
    const isSelected = selected.has(key);
    const isTarget = targetPitchClasses.includes(position.pitchClass);
    const isEnabled = isPositionEnabled(position);
    const classes = [
      'fret-cell',
      isOpenString ? 'open-string-cell' : '',
      isSelected ? 'selected' : '',
      !isEnabled ? 'out-of-range' : '',
      revealed && isEnabled && isTarget ? 'target' : '',
      revealed && isSelected && (!isEnabled || !isTarget) ? 'wrong' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const trainingLabel = isSelected || (revealed && isEnabled)
      ? labelForPosition(position, targetPitchClasses, targetDegrees, targetNoteLabels, showNoteNames, showDegrees)
      : '';
    const visibleLabel = trainingLabel || (isOpenString && showNoteNames ? position.noteName : '');

    return (
      <button
        className={classes}
        key={key}
        type="button"
        onClick={() => onToggle(position)}
        disabled={!isEnabled}
        aria-pressed={isSelected}
        aria-label={ariaPositionLabel(position)}
      >
        <span>{visibleLabel || (isOpenString ? '空弦' : ' ')}</span>
      </button>
    );
  }

  return (
    <div className={`fretboard-shell ${viewMode === 'player' ? 'player-view' : 'diagram-view'}`} aria-label="吉他指板">
      <div className="fret-number-row" style={{ gridTemplateColumns }}>
        <span />
        {viewMode === 'diagram' && <span className="open-string-heading">空弦</span>}
        {visibleFretNumbers.map((fret) => (
          <span key={fret}>{fret}</span>
        ))}
        {viewMode === 'player' && <span className="open-string-heading">空弦</span>}
      </div>

      {strings.map((stringPositions) => {
        const openPosition = stringPositions.find((position) => position.fret === 0);
        const frettedPositions = orderFrettedPositions(stringPositions, viewMode);

        return (
          <div
            className="fret-string-row"
            key={stringPositions[0].stringIndex}
            style={{ gridTemplateColumns }}
          >
            <span className="string-name">{stringPositions[0].stringNumber}弦</span>
            {viewMode === 'diagram' && openPosition && renderPositionButton(openPosition, true)}
            {frettedPositions.map((position) => renderPositionButton(position))}
            {viewMode === 'player' && openPosition && renderPositionButton(openPosition, true)}
          </div>
        );
      })}
    </div>
  );
}
