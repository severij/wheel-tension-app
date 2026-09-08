import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createTensiometer } from '../lib/tensiometer'

export function TensiometerPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function add() {
    const t = createTensiometer()
    dispatch({ type: 'tensiometer/add', tensiometer: t })
  }

  return (
    <section>
      <div className="page-head">
        <h1>Tensiometers</h1>
        <button className="button button--primary" type="button" onClick={add}>
          ＋ Add tensiometer
        </button>
      </div>

      {state.tensiometers.length === 0 ? (
        <p className="muted">
          No tensiometers yet. Add a tensiometer and its calibration curves to
          measure tensiometer readings.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {state.tensiometers.map((t) => {
            const curveCount = t.curves.length
            return (
              <li
                key={t.id}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/tensiometers/${t.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <div className="muted" style={{ fontSize: '0.8rem' }}>
                    {curveCount} calibration curve{curveCount === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="button-row">
                  {confirmDelete === t.id ? (
                    <>
                      <span className="muted">Delete?</span>
                      <button
                        className="button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch({ type: 'tensiometer/delete', id: t.id })
                          setConfirmDelete(null)
                        }}
                      >
                        Yes
                      </button>
                      <button
                        className="button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(null)
                        }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      className="button"
                      type="button"
                      title="Delete tensiometer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete(t.id)
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
