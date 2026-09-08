import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { SetConfig } from '../components/SetConfig'
import { TensionTable } from '../components/TensionTable'
import { TensionRadar } from '../components/TensionRadar'
import { StatsPanel } from '../components/StatsPanel'
import { Dialog } from '../components/Dialog'
import { EditIcon, TrashIcon } from '../components/icons'
import { formatDateTime, toDateTimeLocal } from '../lib/date'

export function MeasurementDetailPage() {
  const { wheelId, setId } = useParams<{ wheelId: string; setId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const wheel = wheelId ? state.wheels.find((w) => w.id === wheelId) : undefined
  const set = wheel && setId ? wheel.sets.find((s) => s.id === setId) : undefined

  if (!wheel || !set) {
    return (
      <section>
        <p>Measurement not found.</p>
        <Link to={wheel ? `/wheel/${wheel.id}` : '/'}>
          ← Back to {wheel ? wheel.name : 'wheels'}
        </Link>
      </section>
    )
  }
  const w = wheel // non-null reference for closures
  const cur = set // non-null reference for closures

  function doDelete() {
    dispatch({ type: 'set/delete', wheelId: w.id, setId: cur.id })
    navigate(`/wheel/${w.id}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>{w.name}</h1>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            aria-label="Edit measurement"
            title="Edit measurement"
            onClick={() => navigate(`/wheel/${w.id}/set/${set.id}/edit`)}
          >
            <EditIcon />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Delete measurement"
            title="Delete measurement"
            onClick={() => setConfirmDelete(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="detail-layout" style={{ marginTop: '1rem' }}>
        <div>
          <div className="card">
            <h2>Measurement</h2>
            <div className="field" style={{ maxWidth: '14rem' }}>
              <label htmlFor={`set-date-${set.id}`}>Date &amp; time</label>
              <input
                id={`set-date-${set.id}`}
                className="input"
                type="datetime-local"
                disabled
                value={toDateTimeLocal(set.date)}
              />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <SetConfig
                set={set}
                tensiometers={state.tensiometers}
                readOnly
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="card">
            <TensionTable
              set={set}
              wheel={w}
              tensiometers={state.tensiometers}
              settings={state.settings}
              readOnly
              onChange={() => {}}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <TensionRadar
              set={set}
              wheel={w}
              tensiometers={state.tensiometers}
              settings={state.settings}
            />
          </div>
          <div className="card">
            <StatsPanel
              set={set}
              wheel={w}
              tensiometers={state.tensiometers}
              settings={state.settings}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        title="Delete this measurement?"
        message={`This permanently deletes the measurement from ${formatDateTime(set.date)}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}
