import { useState } from 'react'
import { useAppStore } from '../state/AppStore'

interface CurveEditorProps {
  tensiometerId: string
  curveId: string
  usedBy: number
}

interface DraftPoint {
  divisions?: number
  kgf?: number
}

export function CurveEditor({ tensiometerId, curveId, usedBy }: CurveEditorProps) {
  const { state, dispatch } = useAppStore()
  const t = state.tensiometers.find((x) => x.id === tensiometerId)!
  const curve = t.curves.find((c) => c.id === curveId)!

  const [gauge, setGauge] = useState(String(curve.gaugeMm))
  const [date, setDate] = useState(toDateInput(curve.calibratedOn))
  const [draft, setDraft] = useState<DraftPoint[]>(
    curve.points.map((p) => ({ ...p })),
  )
  const [confirmEdit, setConfirmEdit] = useState(false)

  const editingReferenced = usedBy > 0

  function commit(points = draft) {
    dispatch({
      type: 'tensiometer/update',
      id: tensiometerId,
      patch: {
        curves: t.curves.map((c) =>
          c.id === curveId
            ? {
                ...c,
                gaugeMm: Number(gauge) || c.gaugeMm,
                calibratedOn: date ? new Date(date).getTime() : c.calibratedOn,
                points: points.map((p) => ({
                  divisions: p.divisions ?? 0,
                  kgf: p.kgf ?? 0,
                })),
              }
            : c,
        ),
      },
    })
    setConfirmEdit(false)
  }

  function requestApply() {
    if (editingReferenced && !confirmEdit) {
      setConfirmEdit(true)
      return
    }
    commit()
  }

  return (
    <form
      style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}
      onSubmit={(e) => {
        e.preventDefault()
        requestApply()
      }}
    >
      <div className="row">
        <div className="field">
          <label htmlFor={`gauge-${curveId}`}>Gauge (mm)</label>
          <input
            id={`gauge-${curveId}`}
            className="input"
            type="number"
            step="any"
            required
            style={{ width: '6rem' }}
            value={gauge}
            onChange={(e) => setGauge(e.target.value)}
            aria-describedby={`gauge-hint-${curveId}`}
          />
          <span id={`gauge-hint-${curveId}`} className="field-hint">
            Required
          </span>
        </div>
        <div className="field">
          <label htmlFor={`date-${curveId}`}>Calibrated on</label>
          <input id={`date-${curveId}`} className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button
            className="button"
            type="button"
            onClick={() =>
              dispatch({
                type: 'tensiometer/update',
                id: tensiometerId,
                patch: { curves: t.curves.filter((c) => c.id !== curveId) },
              })
            }
          >
            Remove curve
          </button>
        </div>
      </div>

      {editingReferenced && confirmEdit && (
        <div className="warning" role="alert" style={{ marginTop: '0.5rem' }}>
          This curve is used by {usedBy} set{usedBy === 1 ? '' : 's'}. Applying edits
          will update their derived tension values.
          <div className="button-row" style={{ marginTop: '0.5rem' }}>
            <button className="button button--primary" type="button" onClick={() => commit()}>
              OK, update {usedBy} set{usedBy === 1 ? '' : 's'}
            </button>
            <button className="button" type="button" onClick={() => setConfirmEdit(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.5rem' }}>
        <div className="muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          Calibration points (divisions → kgf)
        </div>
        <div className="stack" style={{ gap: '0.25rem' }}>
          {draft.map((p, i) => (
            <div key={i} className="row" style={{ gap: '0.25rem' }}>
              <div className="field" style={{ width: '5rem' }}>
                <label htmlFor={`pt-div-${curveId}-${i}`}>Divisions</label>
                <input
                  id={`pt-div-${curveId}-${i}`}
                  className="input"
                  type="number"
                  step="any"
                  required
                  aria-describedby={`pt-div-hint-${curveId}-${i}`}
                  value={p.divisions ?? ''}
                  onChange={(e) =>
                    setDraft((d) =>
                      d.map((x, idx) =>
                        idx === i
                          ? { ...x, divisions: e.target.value === '' ? undefined : Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                />
                <span id={`pt-div-hint-${curveId}-${i}`} className="field-hint">
                  Required
                </span>
              </div>
              <span className="muted">→</span>
              <div className="field" style={{ width: '4.5rem' }}>
                <label htmlFor={`pt-kgf-${curveId}-${i}`}>kgf</label>
                <input
                  id={`pt-kgf-${curveId}-${i}`}
                  className="input"
                  type="number"
                  step="any"
                  required
                  aria-describedby={`pt-kgf-hint-${curveId}-${i}`}
                  value={p.kgf ?? ''}
                  onChange={(e) =>
                    setDraft((d) =>
                      d.map((x, idx) =>
                        idx === i
                          ? { ...x, kgf: e.target.value === '' ? undefined : Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                />
                <span id={`pt-kgf-hint-${curveId}-${i}`} className="field-hint">
                  Required
                </span>
              </div>
              <button className="button button--ghost" type="button" aria-label={`Remove point ${i + 1}`} onClick={() => setDraft((d) => d.filter((_, idx) => idx !== i))}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="button-row" style={{ marginTop: '0.5rem' }}>
          <button className="button" type="button" onClick={() => setDraft((d) => [...d, { divisions: 0, kgf: 0 }])}>
            ＋ Point
          </button>
          <button className="button button--primary" type="submit">
            Apply points
          </button>
        </div>
      </div>
    </form>
  )
}

function toDateInput(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
