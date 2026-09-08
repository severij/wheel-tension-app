import type { Dispatch } from 'react'
import type { Wheel } from '../types'
import type { AppAction } from '../state/AppStore'

const GAUGES = [1.6, 1.8, 2.0]

const DENSITIES = [
  { label: 'Steel', value: 7850 },
  { label: 'Aluminium', value: 2700 },
  { label: 'Titanium', value: 4500 },
  { label: 'Custom', value: null as number | null },
]

interface NumericFieldProps {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
  step?: string
}

function NumericField({ id, label, value, onChange, unit, step }: NumericFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {unit ? ` (${unit})` : ''}
      </label>
      <input
        id={id}
        className="input"
        type="number"
        step={step ?? 'any'}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? NaN : Number(v))
        }}
      />
    </div>
  )
}

interface WheelSetupProps {
  wheel: Wheel
  dispatch: Dispatch<AppAction>
}

export function WheelSetup({ wheel, dispatch }: WheelSetupProps) {
  const customDensity = !DENSITIES.some((d) => d.value !== null && d.value === wheel.densityKgM3)

  function patch(p: Partial<Wheel>) {
    dispatch({ type: 'wheel/update', id: wheel.id, patch: p })
  }

  return (
    <div className="card">
      <h2>Wheel setup</h2>
      <div className="stack">
        <div className="row">
          <div className="field flex-1">
            <label htmlFor={`wheel-name-${wheel.id}`}>Name</label>
            <input
              id={`wheel-name-${wheel.id}`}
              className="input"
              value={wheel.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </div>
        </div>

        <div className="row">
          <NumericField id={`wheel-left-${wheel.id}`} label="Left spokes" value={wheel.leftCount} onChange={(v) => patch({ leftCount: v })} />
          <NumericField id={`wheel-right-${wheel.id}`} label="Right spokes" value={wheel.rightCount} onChange={(v) => patch({ rightCount: v })} />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={`wheel-gauge-${wheel.id}`}>Spoke gauge (mm)</label>
            <select
              id={`wheel-gauge-${wheel.id}`}
              className="select"
              value={GAUGES.includes(wheel.gaugeMm) ? String(wheel.gaugeMm) : 'custom'}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'custom') {
                  if (!GAUGES.includes(wheel.gaugeMm)) return
                  patch({ gaugeMm: NaN })
                } else {
                  patch({ gaugeMm: Number(v) })
                }
              }}
            >
              {GAUGES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>
          {!GAUGES.includes(wheel.gaugeMm) && (
            <NumericField id={`wheel-gauge-custom-${wheel.id}`} label="Custom gauge" value={wheel.gaugeMm} onChange={(v) => patch({ gaugeMm: v })} />
          )}
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={`wheel-density-${wheel.id}`}>Spoke material density (kg/m³)</label>
            <select
              id={`wheel-density-${wheel.id}`}
              className="select"
              value={customDensity ? 'custom' : String(wheel.densityKgM3)}
              onChange={(e) => {
                const v = e.target.value
                const preset = DENSITIES.find((d) => d.value !== null && String(d.value) === v)
                patch({ densityKgM3: preset ? preset.value! : wheel.densityKgM3 })
              }}
            >
              {DENSITIES.filter((d): d is { label: string; value: number } => d.value !== null).map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label} ({d.value})
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>
          {customDensity && (
            <NumericField id={`wheel-density-custom-${wheel.id}`} label="Custom density" value={wheel.densityKgM3} onChange={(v) => patch({ densityKgM3: v })} />
          )}
        </div>

        <div className="row">
          <NumericField id={`wheel-free-left-${wheel.id}`} label="Free length left" unit="mm" value={wheel.freeLengthMmLeft} onChange={(v) => patch({ freeLengthMmLeft: v })} />
          <NumericField id={`wheel-free-right-${wheel.id}`} label="Free length right" unit="mm" value={wheel.freeLengthMmRight} onChange={(v) => patch({ freeLengthMmRight: v })} />
        </div>

        <div className="field">
          <label htmlFor={`wheel-notes-${wheel.id}`}>Notes</label>
          <textarea
            id={`wheel-notes-${wheel.id}`}
            className="input"
            rows={2}
            value={wheel.notes ?? ''}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
