import type { Dispatch } from 'react'
import type {
  MeasurementMode,
  MeasurementSet,
  Tensiometer,
  Wheel,
} from '../types'
import { newtonsToDisplay } from '../lib/display'
import type { AppAction } from '../state/AppStore'

const MODES: { value: MeasurementMode; label: string }[] = [
  { value: 'tensiometer', label: 'Tensiometer reading' },
  { value: 'frequency', label: 'Frequency reading' },
  { value: 'direct', label: 'Tension value' },
]

interface SetEditorProps {
  set: MeasurementSet
  wheel: Wheel
  tensiometers: Tensiometer[]
  displayUnit: 'kgf' | 'N'
  dispatch: Dispatch<AppAction>
}

export function SetConfig({ set, wheel, tensiometers, displayUnit, dispatch }: SetEditorProps) {
  function patch(p: Partial<MeasurementSet>) {
    dispatch({ type: 'set/update', wheelId: wheel.id, setId: set.id, patch: p })
  }

  const curves = tensiometers.flatMap((t) =>
    t.curves.map((c) => ({ tensiometer: t, curve: c })),
  )

  return (
    <div className="stack">
      <div className="row">
        <div className="field">
          <label>Measurement mode</label>
          <select
            className="select"
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
            <label>Calibration curve</label>
            <select
              className="select"
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
          value={set.targetN}
          displayUnit={displayUnit}
          onChange={(n) => patch({ targetN: n })}
        />
        <div className="field">
          <label>Tolerance (%)</label>
          <input
            className="input"
            type="number"
            step="any"
            placeholder="Default"
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
  value?: number
  displayUnit: 'kgf' | 'N'
  onChange: (newtons?: number) => void
}

function TargetField({ label, value, displayUnit, onChange }: TargetFieldProps) {
  const shown =
    value !== undefined ? newtonsToDisplay(value, displayUnit) : undefined
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        type="number"
        step="any"
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
