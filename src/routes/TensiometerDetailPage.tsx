import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createCurve, usedCurveCounts } from '../lib/tensiometer'
import { Dialog } from '../components/Dialog'
import { EditIcon, TrashIcon } from '../components/icons'
import { formatDateTime } from '../lib/date'

export function TensiometerDetailPage() {
  const { tensiometerId } = useParams<{ tensiometerId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const t = state.tensiometers.find((x) => x.id === tensiometerId)

  if (!t) {
    return (
      <section>
        <p>Tensiometer not found.</p>
        <Link to="/tensiometers">← Back to tensiometers</Link>
      </section>
    )
  }
  const tens = t // non-null reference for closures

  const used = usedCurveCounts(state.wheels)

  function addCurve() {
    const curve = createCurve()
    navigate(`/tensiometers/${tens.id}/${curve.id}/edit`)
  }

  function doDelete() {
    dispatch({ type: 'tensiometer/delete', id: tens.id })
    navigate('/tensiometers')
  }

  return (
    <section>
      <div className="page-head">
        <h1>{t.name}</h1>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            aria-label="Edit tensiometer"
            title="Edit tensiometer"
            onClick={() => navigate(`/tensiometers/${t.id}/edit`)}
          >
            <EditIcon />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Delete tensiometer"
            title="Delete tensiometer"
            onClick={() => setConfirmDelete(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="page-head">
          <h2>Tensiometer</h2>
        </div>

        <dl className="details">
          <dt>Name</dt>
          <dd>{t.name}</dd>
        </dl>

        <div className="row" style={{ margin: '0.75rem 0' }}>
          <button className="button button--primary" type="button" onClick={addCurve}>
            ＋ Add curve
          </button>
        </div>

        {t.curves.length === 0 ? (
          <p className="muted">No calibration curves yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {t.curves.map((c) => {
              const pointCount = c.points.length
              const usedBy = used[c.id] ?? 0
              return (
                <li
                  key={c.id}
                  className="card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => navigate(`/tensiometers/${t.id}/${c.id}`)}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.gaugeMm} mm</div>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      Calibrated {formatDateTime(c.calibratedOn)} · {pointCount} point{pointCount === 1 ? '' : 's'}
                      {usedBy > 0 ? ` · used by ${usedBy} set${usedBy === 1 ? '' : 's'}` : ''}
                    </div>
                  </div>
                  <span className="muted" aria-hidden="true">›</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={confirmDelete}
        title="Delete this tensiometer?"
        message={`This permanently deletes "${t.name}" and all of its calibration curves.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}
