import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { WheelSetup } from '../components/WheelSetup'
import { Dialog } from '../components/Dialog'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'
import { createWheel } from '../lib/wheel'
import type { Wheel } from '../types'

export function WheelEditPage() {
  const { wheelId } = useParams<{ wheelId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [dirty, setDirty] = useState(false)
  const { blocked, proceed, reset, bypass } = useUnsavedChanges(dirty)

  const wheel = wheelId ? state.wheels.find((w) => w.id === wheelId) : undefined
  const isNew = wheelId !== undefined && wheel === undefined
  const draftWheel: Wheel | undefined =
    wheel ?? (wheelId ? createWheel({ id: wheelId }) : undefined)

  if (!draftWheel) {
    return (
      <section>
        <p>Wheel not found.</p>
        <Link to="/">← Back to wheels</Link>
      </section>
    )
  }

  const dw = draftWheel // non-null reference for closures

  function handleSave(w: Wheel) {
    if (isNew) {
      dispatch({ type: 'wheel/add', wheel: w })
    } else {
      dispatch({ type: 'wheel/update', id: w.id, patch: w })
    }
  }

  function afterSave() {
    bypass()
    navigate(`/wheel/${dw.id}`)
  }

  function cancel() {
    bypass()
    navigate(isNew ? '/' : `/wheel/${dw.id}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>{draftWheel.name}</h1>
        <button className="button" type="button" onClick={cancel}>
          Cancel
        </button>
      </div>

      <WheelSetup
        key={dw.id}
        wheel={dw}
        dispatch={dispatch}
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
