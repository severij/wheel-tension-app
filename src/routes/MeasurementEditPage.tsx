import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { SetConfig } from '../components/SetConfig'
import { TensionTable } from '../components/TensionTable'
import { TensionDistribution } from '../components/TensionDistribution'
import { StatsPanel } from '../components/StatsPanel'
import { Dialog } from '../components/Dialog'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'
import { toDateTimeLocal } from '../lib/date'
import { createSet } from '../lib/wheel'
import type { MeasurementMode, MeasurementSet, SpokeTensions } from '../types'

interface SetDraft {
  date: string
  mode: MeasurementMode
  curveId?: string
  tolerancePct?: number
  tensions: SpokeTensions
}

function parseDate(value: string, fallback: number): number {
  return value ? new Date(value).getTime() : fallback
}

function fromSet(set: MeasurementSet): SetDraft {
  return {
    date: toDateTimeLocal(set.date),
    mode: set.mode,
    curveId: set.curveId,
    tolerancePct: set.tolerancePct,
    tensions: set.tensions,
  }
}

function sameSet(draft: SetDraft, set: MeasurementSet): boolean {
  return (
    draft.date === toDateTimeLocal(set.date) &&
    draft.mode === set.mode &&
    draft.curveId === set.curveId &&
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
  const bs = baseSet // non-null reference for closures
  const draftSet: MeasurementSet = {
    ...baseSet,
    ...draft,
    date: parseDate(draft.date, baseSet.date),
  }

  function patch(p: Partial<MeasurementSet>) {
    setDraft((d) =>
      d
        ? {
            ...d,
            ...p,
            date: p.date !== undefined ? toDateTimeLocal(p.date) : d.date,
          }
        : d,
    )
  }

  function patchDate(value: string) {
    setDraft((d) => (d ? { ...d, date: value } : d))
  }

  function save() {
    const savedDate = parseDate(dr.date, bs.date)
    if (isNew) {
      dispatch({ type: 'set/add', wheelId: w.id, set: draftSet })
    } else {
      dispatch({
        type: 'set/update',
        wheelId: w.id,
        setId: sid,
        patch: {
          date: savedDate,
          mode: dr.mode,
          curveId: dr.curveId,
          tolerancePct: dr.tolerancePct,
          tensions: dr.tensions,
        },
      })
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
        <h1>{w.name}</h1>
        <button className="button" type="button" onClick={cancel}>
          Cancel
        </button>
      </div>

      <div className="detail-layout" style={{ marginTop: '1rem' }}>
        <div>
          <div className="card">
            <h2>Measurement</h2>
            <div className="field" style={{ maxWidth: '14rem' }}>
              <label htmlFor={`set-date-${setId}`}>Date &amp; time</label>
              <input
                id={`set-date-${setId}`}
                className="input"
                type="datetime-local"
                value={draft.date}
                onChange={(e) => patchDate(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <SetConfig
                set={draftSet}
                tensiometers={state.tensiometers}
                onChange={patch}
              />
            </div>
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
        </div>

        <div>
          <div className="card">
            <TensionDistribution
              set={draftSet}
              wheel={w}
              tensiometers={state.tensiometers}
              settings={state.settings}
            />
          </div>
          <div className="card">
            <StatsPanel
              set={draftSet}
              wheel={w}
              tensiometers={state.tensiometers}
              settings={state.settings}
            />
          </div>
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
