import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createTensiometer } from '../lib/tensiometer'
import { Dialog } from '../components/Dialog'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'

export function TensiometerEditPage() {
  const { tensiometerId } = useParams<{ tensiometerId: string }>()
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()

  const t = tensiometerId
    ? state.tensiometers.find((x) => x.id === tensiometerId)
    : undefined
  const isNew = tensiometerId !== undefined && t === undefined
  const [nameDraft, setNameDraft] = useState(t?.name ?? 'New tensiometer')

  const dirty = nameDraft !== (t?.name ?? 'New tensiometer')
  const { blocked, proceed, reset, bypass } = useUnsavedChanges(dirty)

  if (!tensiometerId) {
    return (
      <section>
        <p>Tensiometer not found.</p>
        <Link to="/tensiometers">← Back to tensiometers</Link>
      </section>
    )
  }
  const tens = t // may be undefined for a new tensiometer

  function save() {
    if (isNew) {
      dispatch({
        type: 'tensiometer/add',
        tensiometer: createTensiometer({ id: tensiometerId, name: nameDraft }),
      })
    } else if (tens) {
      dispatch({ type: 'tensiometer/update', id: tens.id, patch: { name: nameDraft } })
    }
    bypass()
    navigate(`/tensiometers/${tensiometerId}`)
  }

  function cancel() {
    bypass()
    navigate(isNew ? '/tensiometers' : `/tensiometers/${tensiometerId}`)
  }

  return (
    <section>
      <div className="page-head">
        <h1>{nameDraft}</h1>
        <button className="button" type="button" onClick={cancel}>
          Cancel
        </button>
      </div>

      <div className="card">
        <div className="field" style={{ maxWidth: '24rem' }}>
          <label htmlFor={`tens-name-${tensiometerId}`}>Name</label>
          <input
            id={`tens-name-${tensiometerId}`}
            className="input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
          />
        </div>
        <div className="button-row" style={{ marginTop: '0.75rem' }}>
          <button className="button button--primary" type="button" onClick={save}>
            Save
          </button>
        </div>
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
