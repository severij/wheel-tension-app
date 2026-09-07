import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createWheel, computeStats, derivedNewtons } from '../lib/wheel'
import { exportLibrary, exportWheel, exportSetCSV, parseImport } from '../lib/export'
import type { Wheel } from '../types'

export function WheelListPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function addWheel() {
    const wheel = createWheel()
    dispatch({ type: 'wheel/add', wheel })
    dispatch({ type: 'activeWheel/set', id: wheel.id })
    navigate(`/wheel/${wheel.id}`)
  }

  function onImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = parseImport(String(reader.result))
        dispatch({
          type: 'state/import',
          wheels: result.wheels,
          tensiometers: result.tensiometers,
          settings: result.settings,
        })
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed')
      }
    }
    reader.readAsText(file)
  }

  return (
    <section>
      <div className="page-head">
        <h1>Wheel Library</h1>
        <div className="button-row">
          <button className="button" type="button" onClick={() => exportLibrary(state)}>
            Export library
          </button>
          <button className="button" type="button" onClick={() => fileInput.current?.click()}>
            Import
          </button>
          <button className="button button--primary" type="button" onClick={addWheel}>
            ＋ Add wheel
          </button>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImportFile(f)
          e.target.value = ''
        }}
      />

      {importError && (
        <div className="warning warning--strong" role="alert">
          Import failed: {importError}
        </div>
      )}

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
              onDelete={() =>
                confirmDelete === w.id ? doDelete(w.id) : setConfirmDelete(w.id)
              }
              confirming={confirmDelete === w.id}
              onCancelConfirm={() => setConfirmDelete(null)}
              onExport={() => exportWheel(w)}
              onCSV={() => {
                const s = w.sets[w.sets.length - 1]
                if (s) exportSetCSV(s, w, state.tensiometers, state.settings)
              }}
            />
          ))}
        </ul>
      )}
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
  confirming,
  onCancelConfirm,
  onExport,
  onCSV,
}: {
  wheel: Wheel
  setCount: string
  onClick: () => void
  onDelete: () => void
  confirming: boolean
  onCancelConfirm: () => void
  onExport: () => void
  onCSV: () => void
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
      <div className="button-row">
        <button className="button" type="button" onClick={(e) => { e.stopPropagation(); onExport() }} title="Export JSON">
          Export
        </button>
        <button className="button" type="button" onClick={(e) => { e.stopPropagation(); onCSV() }} title="Export latest set as CSV" disabled={sets === 0}>
          CSV
        </button>
        {confirming ? (
          <>
            <span className="muted">Delete?</span>
            <button className="button" type="button" onClick={(e) => { e.stopPropagation(); onDelete() }}>
              Yes
            </button>
            <button className="button" type="button" onClick={(e) => { e.stopPropagation(); onCancelConfirm() }}>
              No
            </button>
          </>
        ) : (
          <button className="button" type="button" onClick={(e) => { e.stopPropagation(); onDelete() }}>
            Delete
          </button>
        )}
      </div>
    </li>
  )
}
