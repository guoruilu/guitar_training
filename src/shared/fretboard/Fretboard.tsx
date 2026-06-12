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

export function Fretboard({
  fretCount,
  selectedKeys,
  targetPitchClasses,
  targetDegrees,
  revealed,
  showNoteNames,
  showDegrees,
  onToggle,
}: FretboardProps) {
  const positions = makeFretboard(fretCount);
  const selected = new Set(selectedKeys);
  const strings = Array.from({ length: 6 }, (_, stringIndex) =>
    positions.filter((position) => position.stringIndex === stringIndex),
  );

  return (
    <div className="fretboard-shell" aria-label="吉他指板">
      <div className="fret-number-row" style={{ gridTemplateColumns: `48px repeat(${fretCount + 1}, minmax(42px, 1fr))` }}>
        <span />
        {Array.from({ length: fretCount + 1 }, (_, fret) => (
          <span key={fret}>{fret}</span>
        ))}
      </div>

      {strings.map((stringPositions) => (
        <div
          className="fret-string-row"
          key={stringPositions[0].stringIndex}
          style={{ gridTemplateColumns: `48px repeat(${fretCount + 1}, minmax(42px, 1fr))` }}
        >
          <span className="string-name">{stringPositions[0].stringNumber}弦</span>
          {stringPositions.map((position) => {
            const key = positionKey(position);
            const isSelected = selected.has(key);
            const isTarget = targetPitchClasses.includes(position.pitchClass);
            const classes = [
              'fret-cell',
              isSelected ? 'selected' : '',
              revealed && isTarget ? 'target' : '',
              revealed && isSelected && !isTarget ? 'wrong' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const visibleLabel = isSelected || revealed ? labelForPosition(position, targetPitchClasses, targetDegrees, showNoteNames, showDegrees) : '';

            return (
              <button
                className={classes}
                key={key}
                type="button"
                onClick={() => onToggle(position)}
                aria-pressed={isSelected}
                aria-label={`${position.stringNumber}弦 ${position.fret}品 ${noteName(position.pitchClass)}`}
              >
                <span>{visibleLabel || ' '}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
