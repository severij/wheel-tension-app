import { useState, type Dispatch } from 'react'
import type { Wheel } from '../types'
import type { AppAction } from '../state/AppStore'

const GAUGES = [1.6, 1.8, 2.0]

const DENSITIES = [
  { label: 'Steel', value: 7850 },
  { label: 'Aluminium', value: 2700 },
  { label: 'Titanium', value: 4500 },
  { label: 'Custom', value: null as number | null },
]

interface WheelDraft {
  name: string
  leftCount?: number
  rightCount?: number
  gaugePreset: string
  customGauge?: number
  densityPreset: string
  customDensity?: number
  freeLengthMmLeft?: number
  freeLengthMmRight?: number
  notes: string
}

function initDraft(wheel: Wheel): WheelDraft {
  const gaugePreset = GAUGES.includes(wheel.gaugeMm) ? String(wheel.gaugeMm) : 'custom'
  const customDensity = !DENSITIES.some(
    (d) => d.value !== null && d.value === wheel.densityKgM3,
  )
  const densityPreset = customDensity ? 'custom' : String(wheel.densityKgM3)
  return {
    name: wheel.name,
    leftCount: wheel.leftCount,
    rightCount: wheel.rightCount,
    gaugePreset,
    customGauge: gaugePreset === 'custom' ? wheel.gaugeMm : undefined,
    densityPreset,
    customDensity: customDensity ? wheel.densityKgM3 : undefined,
    freeLengthMmLeft: wheel.freeLengthMmLeft,
    freeLengthMmRight: wheel.freeLengthMmRight,
    notes: wheel.notes ?? '',
  }
}

interface NumericFieldProps {
  id: string
  label: string
  value?: number
  onChange: (v: number | undefined) => void
  unit?: string
  step?: string
  required?: boolean
}

function NumericField({ id, label, value, onChange, unit, step, required }: NumericFieldProps) {
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
        required={required}
        aria-describedby={required ? `${id}-hint` : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
      {required && (
        <span id={`${id}-hint`} className="field-hint">
          Required
        </span>
      )}
    </div>
  )
}

interface WheelSetupProps {
  wheel: Wheel
  dispatch: Dispatch<AppAction>
  /** Called after a successful save. */
  onSaved?: () => void
  /** Reports whether there are unsaved changes. */
  onDirtyChange?: (dirty: boolean) => void
  /** Overrides the default `wheel/update` dispatch (e.g. to create a new wheel). */
  onSave?: (wheel: Wheel) => void
}

export function WheelSetup({ wheel, dispatch, onSaved, onDirtyChange, onSave }: WheelSetupProps) {
  const [draft, setDraft] = useState<WheelDraft>(() => initDraft(wheel))
  const [dirty, setDirty] = useState(false)

  function patch(p: Partial<WheelDraft>) {
    setDraft((d) => ({ ...d, ...p }))
    setDirty(true)
    onDirtyChange?.(true)
  }

  function save() {
    const gaugeMm =
      draft.gaugePreset === 'custom'
        ? (draft.customGauge ?? wheel.gaugeMm)
        : Number(draft.gaugePreset)
    const densityKgM3 =
      draft.densityPreset === 'custom'
        ? (draft.customDensity ?? wheel.densityKgM3)
        : Number(draft.densityPreset)
    const updated: Wheel = {
      ...wheel,
      name: draft.name,
      leftCount: draft.leftCount ?? wheel.leftCount,
      rightCount: draft.rightCount ?? wheel.rightCount,
      gaugeMm,
      densityKgM3,
      freeLengthMmLeft: draft.freeLengthMmLeft ?? wheel.freeLengthMmLeft,
      freeLengthMmRight: draft.freeLengthMmRight ?? wheel.freeLengthMmRight,
      notes: draft.notes,
    }
    if (onSave) {
      onSave(updated)
    } else {
      dispatch({ type: 'wheel/update', id: wheel.id, patch: updated })
    }
    setDirty(false)
    onDirtyChange?.(false)
    onSaved?.()
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <h2>Wheel setup</h2>
      <div className="stack">
        <div className="row">
          <div className="field flex-1">
            <label htmlFor={`wheel-name-${wheel.id}`}>Name</label>
            <input
              id={`wheel-name-${wheel.id}`}
              className="input"
              required
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              aria-describedby={`wheel-name-${wheel.id}-hint`}
            />
            <span id={`wheel-name-${wheel.id}-hint`} className="field-hint">
              Required
            </span>
          </div>
        </div>

        <div className="row">
          <NumericField
            id={`wheel-left-${wheel.id}`}
            label="Left spokes"
            value={draft.leftCount}
            onChange={(v) => patch({ leftCount: v })}
            required
          />
          <NumericField
            id={`wheel-right-${wheel.id}`}
            label="Right spokes"
            value={draft.rightCount}
            onChange={(v) => patch({ rightCount: v })}
            required
          />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={`wheel-gauge-${wheel.id}`}>Spoke gauge (mm)</label>
            <select
              id={`wheel-gauge-${wheel.id}`}
              className="select"
              value={draft.gaugePreset}
              onChange={(e) => patch({ gaugePreset: e.target.value })}
            >
              {GAUGES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>
          {draft.gaugePreset === 'custom' && (
            <NumericField
              id={`wheel-gauge-custom-${wheel.id}`}
              label="Custom gauge"
              value={draft.customGauge}
              onChange={(v) => patch({ customGauge: v })}
              required
            />
          )}
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor={`wheel-density-${wheel.id}`}>Spoke material density (kg/m³)</label>
            <select
              id={`wheel-density-${wheel.id}`}
              className="select"
              value={draft.densityPreset}
              onChange={(e) => patch({ densityPreset: e.target.value })}
            >
              {DENSITIES.filter(
                (d): d is { label: string; value: number } => d.value !== null,
              ).map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label} ({d.value})
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>
          {draft.densityPreset === 'custom' && (
            <NumericField
              id={`wheel-density-custom-${wheel.id}`}
              label="Custom density"
              value={draft.customDensity}
              onChange={(v) => patch({ customDensity: v })}
              required
            />
          )}
        </div>

        <div className="row">
          <NumericField
            id={`wheel-free-left-${wheel.id}`}
            label="Free length left"
            unit="mm"
            value={draft.freeLengthMmLeft}
            onChange={(v) => patch({ freeLengthMmLeft: v })}
            required
          />
          <NumericField
            id={`wheel-free-right-${wheel.id}`}
            label="Free length right"
            unit="mm"
            value={draft.freeLengthMmRight}
            onChange={(v) => patch({ freeLengthMmRight: v })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor={`wheel-notes-${wheel.id}`}>Notes</label>
          <textarea
            id={`wheel-notes-${wheel.id}`}
            className="input"
            rows={2}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>

        <div className="button-row">
          <button className="button button--primary" type="submit" disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </form>
  )
}
