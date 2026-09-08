import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { usedCurveCounts } from '../lib/tensiometer'
import { Dialog } from '../components/Dialog'
import { EditIcon, TrashIcon } from '../components/icons'
import { formatDateTime } from '../lib/date'

export function CurveDetailPage() {
  const { tensiometerId, curveId } = useParams<{
    tensiometerId: string
    curveId: string
  }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const t = state.tensiometers.find((x) => x.id === tensiometerId)
  const curve = t?.curves.find((c) => c.id === curveId)

  if (!t || !curve) {
    return (
      <section>
        <p>Calibration curve not found.</p>
        <Link to={t ? `/tensiometers/${t.id}` : '/tensiometers'}>
          ← Back to {t ? t.name : 'tensiometers'}
        </Link>
      </section>
    )
  }
  const tens = t // non-null reference for closures
  const cur = curve // non-null reference for closures

  const usedBy = usedCurveCounts(state.wheels)[curve.id] ?? 0

  function doDelete() {
    dispatch({
      type: 'tensiometer/update',
      id: tens.id,
      patch: { curves: tens.curves.filter((c) => c.id !== cur.id) },
    })
    navigate(`/tensiometers/${tens.id}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>
          {t.name} · {curve.gaugeMm} mm
        </h1>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            aria-label="Edit curve"
            title="Edit curve"
            onClick={() => navigate(`/tensiometers/${t.id}/${curve.id}/edit`)}
          >
            <EditIcon />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Delete curve"
            title="Delete curve"
            onClick={() => setConfirmDelete(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="page-head">
          <h2>Curve</h2>
        </div>

        <dl className="details">
          <dt>Gauge (mm)</dt>
          <dd>{curve.gaugeMm}</dd>
          <dt>Calibrated on</dt>
          <dd>{formatDateTime(curve.calibratedOn)}</dd>
          <dt>Used by</dt>
          <dd>
            {usedBy} set{usedBy === 1 ? '' : 's'}
          </dd>
        </dl>

        {curve.points.length === 0 ? (
          <p className="muted">No calibration points yet.</p>
        ) : (
          <table className="table" style={{ maxWidth: '24rem' }}>
            <thead>
              <tr>
                <th>Divisions</th>
                <th>kgf</th>
              </tr>
            </thead>
            <tbody>
              {curve.points.map((p, i) => (
                <tr key={i}>
                  <td>{p.divisions}</td>
                  <td>{p.kgf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={confirmDelete}
        title="Remove this curve?"
        message="This permanently deletes the calibration curve and its points."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}
