import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { WheelDetails } from '../components/WheelDetails'
import { Dialog } from '../components/Dialog'
import { EditIcon, TrashIcon } from '../components/icons'
import { createSet, derivedNewtons, computeStats } from '../lib/wheel'
import type { MeasurementMode, MeasurementSet, Wheel } from '../types'

const MODE_LABELS: Record<MeasurementMode, string> = {
  tensiometer: 'Tensiometer',
  frequency: 'Frequency',
  direct: 'Tension',
}

export function WheelDetailPage() {
  const { wheelId } = useParams<{ wheelId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const wheel = state.wheels.find((w) => w.id === wheelId)

  if (!wheel) {
    return (
      <section>
        <p>Wheel not found.</p>
        <Link to="/">← Back to wheels</Link>
      </section>
    )
  }
  const w = wheel // non-null reference for closures

  function addMeasurement() {
    const set = createSet()
    navigate(`/wheel/${w.id}/set/${set.id}/edit`)
  }

  function doDelete() {
    dispatch({ type: 'wheel/delete', id: w.id })
    navigate('/')
  }

  return (
    <section>
      <div className="page-head">
        <h1>{w.name}</h1>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            aria-label="Edit wheel"
            title="Edit wheel"
            onClick={() => navigate(`/wheel/${w.id}/edit`)}
          >
            <EditIcon />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Delete wheel"
            title="Delete wheel"
            onClick={() => setConfirmDelete(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <WheelDetails wheel={w} />

      <div className="card">
        <div className="page-head">
          <h2>Measurements</h2>
          <button className="button button--primary" type="button" onClick={addMeasurement}>
            ＋ New measurement
          </button>
        </div>

        {w.sets.length === 0 ? (
          <p className="muted">No measurements yet. Add the first measurement to begin.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {w.sets.map((s) => (
              <MeasurementRow key={s.id} wheel={w} set={s} />
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={confirmDelete}
        title="Delete this wheel?"
        message={`This permanently deletes "${w.name}" and all of its measurements.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}

function MeasurementRow({ wheel, set }: { wheel: Wheel; set: MeasurementSet }) {
  const navigate = useNavigate()
  const { state } = useAppStore()
  const maxCount = Math.max(wheel.leftCount, wheel.rightCount)
  const entered = Object.keys(set.tensions).length
  const derived = derivedNewtons(set, wheel, state.tensiometers, state.settings)
  const stats = computeStats(derived)
  const avg = [stats.left.avg, stats.right.avg].filter(
    (v): v is number => v !== undefined,
  )
  let summary = ''
  if (avg.length > 0) {
    const mean = avg.reduce((a, b) => a + b, 0) / avg.length
    const unit = state.settings.displayUnit
    const val = unit === 'kgf' ? mean / 9.80665 : mean
    summary = ` · avg ${val.toFixed(1)} ${unit}`
  }

  return (
    <li
      className="card"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
      onClick={() => navigate(`/wheel/${wheel.id}/set/${set.id}`)}
    >
      <div>
        <div style={{ fontWeight: 700 }}>
          {new Date(set.date).toLocaleDateString()} · {MODE_LABELS[set.mode]}
        </div>
        <div className="muted" style={{ fontSize: '0.8rem' }}>
          {entered}/{maxCount} spokes entered{summary}
        </div>
      </div>
      <span className="muted" aria-hidden="true">›</span>
    </li>
  )
}
