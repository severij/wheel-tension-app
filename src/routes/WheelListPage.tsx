import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createWheel, computeStats, derivedNewtons } from '../lib/wheel'
import { Dialog } from '../components/Dialog'
import { TrashIcon } from '../components/icons'
import type { Wheel } from '../types'

export function WheelListPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function addWheel() {
    const wheel = createWheel()
    navigate(`/wheel/${wheel.id}/edit`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>Wheel Library</h1>
        <button className="button button--primary" type="button" onClick={addWheel}>
          ＋ Add wheel
        </button>
      </div>

      {state.wheels.length === 0 ? (
        <p className="muted">
          No wheels yet. Add your first wheel to begin measuring spoke tension.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {state.wheels.map((w) => (
            <WheelRow
              key={w.id}
              wheel={w}
              setCount={state.settings.displayUnit}
              onClick={() => navigate(`/wheel/${w.id}`)}
              onDelete={() => setConfirmDelete(w.id)}
            />
          ))}
        </ul>
      )}

      <Dialog
        open={confirmDelete !== null}
        title="Delete this wheel?"
        message={
          confirmDelete
            ? `This permanently deletes "${state.wheels.find((w) => w.id === confirmDelete)?.name ?? ''}" and all of its measurements.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  )

  function doDelete(id: string) {
    dispatch({ type: 'wheel/delete', id })
    setConfirmDelete(null)
  }
}

function WheelRow({
  wheel,
  setCount,
  onClick,
  onDelete,
}: {
  wheel: Wheel
  setCount: string
  onClick: () => void
  onDelete: () => void
}) {
  const { state } = useAppStore()
  const sets = wheel.sets.length
  const lastSet = wheel.sets.length > 0 ? wheel.sets[wheel.sets.length - 1] : undefined
  let summary = ''
  if (lastSet) {
    const derived = derivedNewtons(lastSet, wheel, state.tensiometers, state.settings)
    const stats = computeStats(derived)
    const avg = [stats.left.avg, stats.right.avg].filter((v): v is number => v !== undefined)
    if (avg.length > 0) {
      const mean = avg.reduce((a, b) => a + b, 0) / avg.length
      summary = `avg ${(mean / (setCount === 'kgf' ? 9.80665 : 1)).toFixed(1)} ${setCount}`
    }
  }

  return (
    <li className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onClick}>
      <div>
        <div style={{ fontWeight: 700 }}>{wheel.name}</div>
        <div className="muted" style={{ fontSize: '0.8rem' }}>
          {wheel.leftCount}/{wheel.rightCount} spokes · {wheel.gaugeMm}mm · {sets} set{sets === 1 ? '' : 's'}
          {summary ? ` · ${summary}` : ''}
        </div>
      </div>
      <button
        className="icon-button"
        type="button"
        aria-label={`Delete ${wheel.name}`}
        title="Delete wheel"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
      >
        <TrashIcon />
      </button>
    </li>
  )
}
