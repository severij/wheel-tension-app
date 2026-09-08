import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { computeStats, derivedNewtons } from '../lib/wheel'
import { newtonsToDisplay } from '../lib/display'

interface StatsPanelProps {
  set: MeasurementSet
  wheel: Wheel
  tensiometers: Tensiometer[]
  settings: Settings
}

function SideColumn({ title, count, expected, stats, unit }: {
  title: string
  count: number
  expected: number
  stats: { min?: number; max?: number; avg?: number; stdDev?: number }
  unit: string
}) {
  const f = (n?: number) =>
    n === undefined ? '—' : newtonsToDisplay(n, unit as 'kgf' | 'N').toFixed(1)
  const span = (() => {
    if (stats.min === undefined || stats.max === undefined) return '—'
    return (newtonsToDisplay(stats.max - stats.min, unit as 'kgf' | 'N')).toFixed(1)
  })()
  return (
    <div style={{ flex: 1, minWidth: 140 }}>
      <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem' }}>{title}</h3>
      <table className="table">
        <tbody>
          <tr><td>Entered</td><td>{count}/{expected}</td></tr>
          <tr><td>Min</td><td>{f(stats.min)}</td></tr>
          <tr><td>Max</td><td>{f(stats.max)}</td></tr>
          <tr><td>Avg</td><td>{f(stats.avg)}</td></tr>
          <tr><td>Std dev</td><td>{f(stats.stdDev)}</td></tr>
          <tr><td>Spread</td><td>{span}</td></tr>
        </tbody>
      </table>
    </div>
  )
}

export function StatsPanel({ set, wheel, tensiometers, settings }: StatsPanelProps) {
  const derived = derivedNewtons(set, wheel, tensiometers, settings)
  const stats = computeStats(derived)
  const unit = settings.displayUnit

  return (
    <div>
      <h2>Stats</h2>
      <div className="row">
        <SideColumn
          title="Left (non-drive side)"
          count={stats.left.count}
          expected={wheel.leftCount}
          stats={stats.left}
          unit={unit}
        />
        <SideColumn
          title="Right (drive side)"
          count={stats.right.count}
          expected={wheel.rightCount}
          stats={stats.right}
          unit={unit}
        />
      </div>
    </div>
  )
}
