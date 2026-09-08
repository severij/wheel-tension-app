import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { SetConfig } from '../components/SetConfig'
import { TensionTable } from '../components/TensionTable'
import { Dialog } from '../components/Dialog'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'
import { createSet } from '../lib/wheel'
import type { MeasurementMode, MeasurementSet, SpokeTensions } from '../types'

interface SetDraft {
  mode: MeasurementMode
  curveId?: string
  targetN?: number
  tolerancePct?: number
  tensions: SpokeTensions
}

function fromSet(set: MeasurementSet): SetDraft {
  return {
    mode: set.mode,
    curveId: set.curveId,
    targetN: set.targetN,
    tolerancePct: set.tolerancePct,
    tensions: set.tensions,
  }
}

function sameSet(draft: SetDraft, set: MeasurementSet): boolean {
  return (
    draft.mode === set.mode &&
    draft.curveId === set.curveId &&
    draft.targetN === set.targetN &&
    draft.tolerancePct === set.tolerancePct &&
    JSON.stringify(draft.tensions) === JSON.stringify(set.tensions)
  )
}

export function MeasurementEditPage() {
  const { wheelId, setId } = useParams<{ wheelId: string; setId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()

  const wheel = wheelId ? state.wheels.find((w) => w.id === wheelId) : undefined
  const set = wheel && setId ? wheel.sets.find((s) => s.id === setId) : undefined
  const isNew = wheel !== undefined && setId !== undefined && set === undefined
  const baseSet: MeasurementSet | undefined =
    set ?? (wheel && setId ? createSet({ id: setId }) : undefined)

  const [draft, setDraft] = useState<SetDraft | undefined>(() =>
    baseSet ? fromSet(baseSet) : undefined,
  )

  const dirty = draft !== undefined && baseSet !== undefined && !sameSet(draft, baseSet)
  const { blocked, proceed, reset, bypass } = useUnsavedChanges(dirty)

  if (!wheel || !setId || !baseSet || !draft) {
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
  const sid = setId // non-null reference for closures
  const dr = draft // non-null reference for closures
  const draftSet: MeasurementSet = { ...baseSet, ...draft }

  function patch(p: Partial<SetDraft>) {
    setDraft((d) => (d ? { ...d, ...p } : d))
  }

  function save() {
    if (isNew) {
      dispatch({ type: 'set/add', wheelId: w.id, set: draftSet })
    } else {
      dispatch({ type: 'set/update', wheelId: w.id, setId: sid, patch: dr })
    }
    bypass()
    navigate(`/wheel/${w.id}/set/${sid}`)
  }

  function cancel() {
    bypass()
    navigate(isNew ? `/wheel/${w.id}` : `/wheel/${w.id}/set/${sid}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>
          {w.name} · {new Date(baseSet.date).toLocaleDateString()}
        </h1>
        <button className="button" type="button" onClick={cancel}>
          Cancel
        </button>
      </div>

      <div className="card">
        <h2>Measurement</h2>
        <SetConfig
          set={draftSet}
          tensiometers={state.tensiometers}
          displayUnit={state.settings.displayUnit}
          onChange={patch}
        />
      </div>

      <div className="card">
        <TensionTable
          set={draftSet}
          wheel={w}
          tensiometers={state.tensiometers}
          settings={state.settings}
          onChange={patch}
        />
      </div>

      <div className="button-row">
        <button className="button button--primary" type="button" onClick={save}>
          Save
        </button>
      </div>

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
