import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createTensiometer } from '../lib/tensiometer'
import { Dialog } from '../components/Dialog'
import { TrashIcon } from '../components/icons'

export function TensiometerPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function add() {
    const t = createTensiometer()
    navigate(`/tensiometers/${t.id}/edit`)
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
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Delete ${t.name}`}
                    title="Delete tensiometer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(t.id)
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={confirmDelete !== null}
        title="Delete this tensiometer?"
        message={
          confirmDelete
            ? `This permanently deletes "${state.tensiometers.find((t) => t.id === confirmDelete)?.name ?? ''}" and all of its calibration curves.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (confirmDelete) dispatch({ type: 'tensiometer/delete', id: confirmDelete })
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  )
}
