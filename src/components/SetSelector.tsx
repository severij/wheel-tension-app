import type { MeasurementSet } from '../types'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function label(set: MeasurementSet): string {
  return formatDate(set.date)
}

interface SetSelectorProps {
  sets: MeasurementSet[]
  activeIndex: number
  onChange: (index: number) => void
  onNew: () => void
}

/**
 * A combined stepper + dropdown for selecting a measurement set. Shows
 * previous/next arrows plus a dropdown to jump to any set, and a "new" action.
 */
export function SetSelector({
  sets,
  activeIndex,
  onChange,
  onNew,
}: SetSelectorProps) {
  if (sets.length === 0) {
    return (
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={onNew}>
          ＋ New measurement
        </button>
      </div>
    )
  }

  const atStart = activeIndex <= 0
  const atEnd = activeIndex >= sets.length - 1

  return (
    <div className="button-row">
      <div className="selector" aria-label="Select measurement set">
        <button
          type="button"
          aria-label="Previous set"
          disabled={atStart}
          onClick={() => onChange(activeIndex - 1)}
        >
          ‹
        </button>

        <div className="current">
          <select
            className="select"
            value={activeIndex}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label="Current set"
          >
            {sets.map((s, i) => (
              <option key={s.id} value={i}>
                {label(s)}
                {s.notes ? ` · ${s.notes}` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="Next set"
          disabled={atEnd}
          onClick={() => onChange(activeIndex + 1)}
        >
          ›
        </button>
      </div>

      <button className="button button--primary" type="button" onClick={onNew}>
        ＋ New measurement
      </button>
    </div>
  )
}

export { formatDate }
