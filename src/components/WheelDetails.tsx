import type { Wheel } from '../types'

export function WheelDetails({ wheel }: { wheel: Wheel }) {
  return (
    <div className="card">
      <div className="page-head">
        <h2>Wheel setup</h2>
      </div>

      <dl className="details">
        <dt>Name</dt>
        <dd>{wheel.name}</dd>
        <dt>Left spokes</dt>
        <dd>{wheel.leftCount}</dd>
        <dt>Right spokes</dt>
        <dd>{wheel.rightCount}</dd>
        <dt>Spoke gauge (mm)</dt>
        <dd>{Number.isFinite(wheel.gaugeMm) ? wheel.gaugeMm : '—'}</dd>
        <dt>Density (kg/m³)</dt>
        <dd>{Number.isFinite(wheel.densityKgM3) ? wheel.densityKgM3 : '—'}</dd>
        <dt>Free length left (mm)</dt>
        <dd>{Number.isFinite(wheel.freeLengthMmLeft) ? wheel.freeLengthMmLeft : '—'}</dd>
        <dt>Free length right (mm)</dt>
        <dd>{Number.isFinite(wheel.freeLengthMmRight) ? wheel.freeLengthMmRight : '—'}</dd>
        <dt>Notes</dt>
        <dd>{wheel.notes ?? '—'}</dd>
      </dl>
    </div>
  )
}
