import type {
  MeasurementMode,
  MeasurementSet,
  Tensiometer,
} from '../types'
import { formatDateTime } from '../lib/date'

const MODES: { value: MeasurementMode; label: string }[] = [
  { value: 'tensiometer', label: 'Tensiometer reading' },
  { value: 'frequency', label: 'Frequency reading' },
  { value: 'direct', label: 'Tension value' },
]

interface SetEditorProps {
  set: MeasurementSet
  tensiometers: Tensiometer[]
  readOnly?: boolean
  onChange: (patch: Partial<MeasurementSet>) => void
}

export function SetConfig({ set, tensiometers, readOnly, onChange }: SetEditorProps) {
  function patch(p: Partial<MeasurementSet>) {
    onChange(p)
  }

  const curves = tensiometers.flatMap((t) =>
    t.curves.map((c) => ({ tensiometer: t, curve: c })),
  )

  return (
    <div className="stack">
      <div className="row">
        <div className="field">
          <label htmlFor={`set-mode-${set.id}`}>Mode</label>
          <select
            id={`set-mode-${set.id}`}
            className="select"
            disabled={readOnly}
            value={set.mode}
            onChange={(e) => patch({ mode: e.target.value as MeasurementMode })}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {set.mode === 'tensiometer' && (
          <div className="field flex-1">
            <label htmlFor={`set-curve-${set.id}`}>Calibration curve</label>
            <select
              id={`set-curve-${set.id}`}
              className="select"
              disabled={readOnly}
              value={set.curveId ?? ''}
              onChange={(e) => patch({ curveId: e.target.value || undefined })}
            >
              <option value="">— select —</option>
              {curves.map(({ tensiometer, curve }) => (
                <option key={curve.id} value={curve.id}>
                  {tensiometer.name} · {curve.gaugeMm}mm · {formatDateTime(curve.calibratedOn)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor={`set-tolerance-${set.id}`}>Tolerance (%)</label>
          <input
            id={`set-tolerance-${set.id}`}
            className="input"
            type="number"
            step="any"
            placeholder="Default"
            disabled={readOnly}
            value={set.tolerancePct ?? ''}
            onChange={(e) => {
              const v = e.target.value
              patch({ tolerancePct: v === '' ? undefined : Number(v) })
            }}
          />
        </div>
      </div>
    </div>
  )
}
