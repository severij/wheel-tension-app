import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { createSet } from '../lib/wheel'
import { SetSelector } from '../components/SetSelector'
import { SetConfig } from '../components/SetConfig'
import { TensionTable } from '../components/TensionTable'
import { StatsPanel } from '../components/StatsPanel'
import { TensionRadar } from '../components/TensionRadar'

export function WheelDetailPage() {
  const { wheelId } = useParams<{ wheelId: string }>()
  const { state, dispatch } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)

  const wheel = state.wheels.find((w) => w.id === wheelId)

  if (!wheel) {
    return (
      <section>
        <p>Wheel not found.</p>
        <Link to="/">← Back to wheels</Link>
      </section>
    )
  }
  const w = wheel // non-null reference for closures

  // Keep the active index within bounds of the set list.
  const safeActive = Math.min(activeIndex, Math.max(0, w.sets.length - 1))
  const set = w.sets[safeActive]
  const isActive = safeActive === w.sets.length - 1

  function addSet() {
    const s = createSet()
    dispatch({ type: 'set/add', wheelId: w.id, set: s })
    setActiveIndex(w.sets.length) // select the newly added set
  }

  return (
    <section>
      <div className="page-head">
        <Link to="/">← Back to wheels</Link>
        <h1>{wheel.name}</h1>
      </div>

      <SetSelector
        sets={w.sets}
        activeIndex={safeActive}
        onChange={setActiveIndex}
        onNew={addSet}
      />

      {!set ? (
        <p className="muted" style={{ marginTop: '1rem' }}>
          No measurement sets yet. Click “＋ New measurement” to begin.
        </p>
      ) : (
        <div className="detail-layout" style={{ marginTop: '1rem' }}>
          <div>
            <div className="card">
              <h2>{isActive ? 'Measurement' : 'Measurement (read-only)'}</h2>
              <SetConfig
                set={set}
                wheel={w}
                tensiometers={state.tensiometers}
                displayUnit={state.settings.displayUnit}
                dispatch={dispatch}
              />
            </div>

            <div className="card">
              <TensionTable
                set={set}
                wheel={w}
                tensiometers={state.tensiometers}
                settings={state.settings}
                dispatch={dispatch}
                readOnly={!isActive}
              />
            </div>
          </div>

          <div>
            <div className="card">
              <TensionRadar
                set={set}
                wheel={w}
                tensiometers={state.tensiometers}
                settings={state.settings}
              />
            </div>
            <div className="card">
              <StatsPanel
                set={set}
                wheel={w}
                tensiometers={state.tensiometers}
                settings={state.settings}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
