import type { FretPosition, PitchClass } from '../music/types';
import { makeFretboard, positionKey } from '../music/fretboard';
import { noteName } from '../music/theory';

interface FretboardProps {
  fretCount: number;
  selectedKeys: string[];
  targetPitchClasses: PitchClass[];
  targetDegrees: string[];
  revealed: boolean;
  showNoteNames: boolean;
  showDegrees: boolean;
  isPositionEnabled?(position: FretPosition): boolean;
  onToggle(position: FretPosition): void;
}

function labelForPosition(
  position: FretPosition,
  targetPitchClasses: PitchClass[],
  targetDegrees: string[],
  showNoteNames: boolean,
  showDegrees: boolean,
) {
  const targetIndex = targetPitchClasses.indexOf(position.pitchClass);
  const labels: string[] = [];

  if (showNoteNames) {
    labels.push(noteName(position.pitchClass));
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

export function Fretboard({
  fretCount,
  selectedKeys,
  targetPitchClasses,
  targetDegrees,
  revealed,
  showNoteNames,
  showDegrees,
  isPositionEnabled = () => true,
  onToggle,
}: FretboardProps) {
  const positions = makeFretboard(fretCount);
  const selected = new Set(selectedKeys);
  const strings = Array.from({ length: 6 }, (_, stringIndex) =>
    positions.filter((position) => position.stringIndex === stringIndex),
  );
  const gridTemplateColumns = `48px 62px repeat(${fretCount}, minmax(42px, 1fr))`;

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
      ? labelForPosition(position, targetPitchClasses, targetDegrees, showNoteNames, showDegrees)
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
    <div className="fretboard-shell" aria-label="吉他指板">
      <div className="fret-number-row" style={{ gridTemplateColumns }}>
        <span />
        <span className="open-string-heading">空弦</span>
        {Array.from({ length: fretCount }, (_, index) => (
          <span key={index + 1}>{index + 1}</span>
        ))}
      </div>

      {strings.map((stringPositions) => {
        const openPosition = stringPositions.find((position) => position.fret === 0);
        const frettedPositions = stringPositions.filter((position) => position.fret > 0);

        return (
          <div
            className="fret-string-row"
            key={stringPositions[0].stringIndex}
            style={{ gridTemplateColumns }}
          >
            <span className="string-name">{stringPositions[0].stringNumber}弦</span>
            {openPosition && renderPositionButton(openPosition, true)}
            {frettedPositions.map((position) => renderPositionButton(position))}
          </div>
        );
      })}
    </div>
  );
}
