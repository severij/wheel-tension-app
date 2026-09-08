import type { Dispatch } from 'react'
import type {
  MeasurementSet,
  Settings,
  SpokeTensions,
  Tensiometer,
  Wheel,
} from '../types'
import { derivedNewtons, colorFor, sideAverage } from '../lib/wheel'
import { newtonsToDisplay } from '../lib/display'
import type { AppAction } from '../state/AppStore'

interface TensionTableProps {
  set: MeasurementSet
  wheel: Wheel
  tensiometers: Tensiometer[]
  settings: Settings
  dispatch: Dispatch<AppAction>
  readOnly?: boolean
}

export function TensionTable({
  set,
  wheel,
  tensiometers,
  settings,
  dispatch,
  readOnly,
}: TensionTableProps) {
  const derived = derivedNewtons(set, wheel, tensiometers, settings)
  const leftAvg = sideAverage(derived, 'left')
  const rightAvg = sideAverage(derived, 'right')
  const maxCount = Math.max(wheel.leftCount, wheel.rightCount)

  function setTension(spoke: number, side: 'left' | 'right', value: string) {
    if (readOnly) return
    const existing = set.tensions[spoke] ?? {}
    const update: { left?: number; right?: number } = { ...existing }
    const parsed = value === '' ? undefined : Number(value)
    if (parsed === undefined || Number.isNaN(parsed)) {
      delete update[side]
    } else {
      update[side] = parsed
    }
    const tensions: SpokeTensions = { ...set.tensions }
    if (Object.values(update).every((v) => v === undefined)) {
      delete tensions[spoke]
    } else {
      tensions[spoke] = update
    }
    dispatch({ type: 'set/update', wheelId: wheel.id, setId: set.id, patch: { tensions } })
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Spoke</th>
            <th>Left (raw)</th>
            <th>Left ({settings.displayUnit})</th>
            <th>Right ({settings.displayUnit})</th>
            <th>Right (raw)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxCount }, (_, i) => i + 1).map((spoke) => {
            const hasLeft = spoke <= wheel.leftCount
            const hasRight = spoke <= wheel.rightCount
            const dleft = derived[spoke]?.left
            const dright = derived[spoke]?.right
            return (
              <tr key={spoke}>
                <td>{spoke}</td>
                <td>
                  {hasLeft ? (
                    <SpokeValue
                      readOnly={readOnly}
                      label={`Spoke ${spoke} left reading`}
                      value={set.tensions[spoke]?.left}
                      color={colorFor(dleft, leftAvg, set, settings)}
                      onChange={(v) => setTension(spoke, 'left', v)}
                    />
                  ) : null}
                </td>
                <td className="derived">{dleft !== undefined ? fmt(settings, dleft) : ''}</td>
                <td className="derived">{dright !== undefined ? fmt(settings, dright) : ''}</td>
                <td>
                  {hasRight ? (
                    <SpokeValue
                      readOnly={readOnly}
                      label={`Spoke ${spoke} right reading`}
                      value={set.tensions[spoke]?.right}
                      color={colorFor(dright, rightAvg, set, settings)}
                      onChange={(v) => setTension(spoke, 'right', v)}
                    />
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function fmt(settings: Settings, newtons: number): string {
  return newtonsToDisplay(newtons, settings.displayUnit).toFixed(1)
}

interface SpokeValueProps {
  label: string
  value?: number
  color: 'ok' | 'warn' | 'bad' | null
  onChange: (value: string) => void
  readOnly?: boolean
}

function SpokeValue({ label, value, color, onChange, readOnly }: SpokeValueProps) {
  const cls = color ? `cell-${color}` : ''
  return (
    <input
      className={`cell-input ${cls}`}
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={value ?? ''}
      disabled={readOnly}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
