import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createCurve, usedCurveCounts } from '../lib/tensiometer'
import { CurveEditor } from '../components/CurveEditor'
import { Dialog } from '../components/Dialog'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'
import type { CalibrationCurve } from '../types'

export function CurveEditPage() {
  const { tensiometerId, curveId } = useParams<{
    tensiometerId: string
    curveId: string
  }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [dirty, setDirty] = useState(false)
  const { blocked, proceed, reset, bypass } = useUnsavedChanges(dirty)

  const t = tensiometerId
    ? state.tensiometers.find((x) => x.id === tensiometerId)
    : undefined
  const curve = t && curveId ? t.curves.find((c) => c.id === curveId) : undefined
  const isNew = t !== undefined && curveId !== undefined && curve === undefined
  const draftCurve: CalibrationCurve | undefined =
    curve ?? (t && curveId ? createCurve({ id: curveId }) : undefined)

  if (!t || !curveId || !draftCurve) {
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
  const usedBy = isNew ? 0 : curve ? (usedCurveCounts(state.wheels)[curve.id] ?? 0) : 0

  function handleSave(saved: CalibrationCurve) {
    if (isNew) {
      dispatch({
        type: 'tensiometer/update',
        id: tens.id,
        patch: { curves: [...tens.curves, saved] },
      })
    } else {
      dispatch({
        type: 'tensiometer/update',
        id: tens.id,
        patch: { curves: tens.curves.map((c) => (c.id === saved.id ? saved : c)) },
      })
    }
  }

  function afterSave() {
    bypass()
    navigate(`/tensiometers/${tens.id}/${curveId}`)
  }

  function cancel() {
    bypass()
    navigate(isNew ? `/tensiometers/${tens.id}` : `/tensiometers/${tens.id}/${curveId}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>
          {tens.name} · {draftCurve.gaugeMm} mm
        </h1>
        <button className="button" type="button" onClick={cancel}>
          Cancel
        </button>
      </div>

      <CurveEditor
        tensiometerId={tens.id}
        curveId={draftCurve.id}
        curve={draftCurve}
        usedBy={usedBy}
        onDirtyChange={setDirty}
        onSave={handleSave}
        onSaved={afterSave}
      />

      <Dialog
        open={blocked}
        title="Discard unsaved changes?"
        message="You have unsaved changes. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={proceed}
        onCancel={reset}
      />
    </section>
  )
}
