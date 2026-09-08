import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createCurve, usedCurveCounts } from '../lib/tensiometer'

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
    dispatch({
      type: 'tensiometer/update',
      id: tens.id,
      patch: { curves: [...tens.curves, curve] },
    })
    navigate(`/tensiometers/${tens.id}/${curve.id}`)
  }

  function doDelete() {
    dispatch({ type: 'tensiometer/delete', id: tens.id })
    navigate('/tensiometers')
  }

  return (
    <section>
      <div className="page-head">
        <Link to="/tensiometers">← Back to tensiometers</Link>
        <h1>{t.name}</h1>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor={`tens-name-${t.id}`}>Name</label>
            <input
              id={`tens-name-${t.id}`}
              className="input"
              style={{ fontWeight: 700 }}
              value={t.name}
              onChange={(e) =>
                dispatch({ type: 'tensiometer/update', id: t.id, patch: { name: e.target.value } })
              }
            />
          </div>
          {confirmDelete ? (
            <div className="button-row">
              <span className="muted">Delete tensiometer?</span>
              <button className="button" type="button" onClick={doDelete}>
                Yes
              </button>
              <button className="button" type="button" onClick={() => setConfirmDelete(false)}>
                No
              </button>
            </div>
          ) : (
            <button className="button" type="button" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
        </div>

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
                      Calibrated {new Date(c.calibratedOn).toLocaleDateString()} · {pointCount} point{pointCount === 1 ? '' : 's'}
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
    </section>
  )
}
