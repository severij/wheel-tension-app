import type {
  MeasurementMode,
  MeasurementSet,
  Tensiometer,
} from '../types'
import { newtonsToDisplay } from '../lib/display'

const MODES: { value: MeasurementMode; label: string }[] = [
  { value: 'tensiometer', label: 'Tensiometer reading' },
  { value: 'frequency', label: 'Frequency reading' },
  { value: 'direct', label: 'Tension value' },
]

interface SetEditorProps {
  set: MeasurementSet
  tensiometers: Tensiometer[]
  displayUnit: 'kgf' | 'N'
  readOnly?: boolean
  onChange: (patch: Partial<MeasurementSet>) => void
}

export function SetConfig({ set, tensiometers, displayUnit, readOnly, onChange }: SetEditorProps) {
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
          <label htmlFor={`set-mode-${set.id}`}>Measurement mode</label>
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
                  {tensiometer.name} · {curve.gaugeMm}mm · {new Date(curve.calibratedOn).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="row">
        <TargetField
          label={`Target (${displayUnit})`}
          fieldId={`set-target-${set.id}`}
          value={set.targetN}
          displayUnit={displayUnit}
          readOnly={readOnly}
          onChange={(n) => patch({ targetN: n })}
        />
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

interface TargetFieldProps {
  label: string
  fieldId: string
  value?: number
  displayUnit: 'kgf' | 'N'
  readOnly?: boolean
  onChange: (newtons?: number) => void
}

function TargetField({ label, fieldId, value, displayUnit, readOnly, onChange }: TargetFieldProps) {
  const shown =
    value !== undefined ? newtonsToDisplay(value, displayUnit) : undefined
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        className="input"
        type="number"
        step="any"
        disabled={readOnly}
        value={shown ?? ''}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') {
            onChange(undefined)
            return
          }
          const nm = Number(v)
          if (Number.isNaN(nm)) return
          // convert display unit back to Newtons
          onChange(
            displayUnit === 'kgf' ? nm * 9.80665 : nm,
          )
        }}
      />
    </div>
  )
}
