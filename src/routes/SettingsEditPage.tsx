import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { Dialog } from '../components/Dialog'
import { RadarColorField } from '../components/RadarColorField'
import { useUnsavedChanges } from '../lib/useUnsavedChanges'
import type { DisplayUnit, RadarColorId, Settings } from '../types'

function fromSettings(s: Settings): Settings {
  return { ...s }
}

function sameSettings(a: Settings, b: Settings): boolean {
  return (
    a.displayUnit === b.displayUnit &&
    a.defaultTolerancePct === b.defaultTolerancePct &&
    a.radarLeftColor === b.radarLeftColor &&
    a.radarRightColor === b.radarRightColor
  )
}

export function SettingsEditPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Settings>(() => fromSettings(state.settings))

  const dirty = !sameSettings(draft, state.settings)
  const { blocked, proceed, reset, bypass } = useUnsavedChanges(dirty)

  function patch(p: Partial<Settings>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function save() {
    dispatch({ type: 'settings/update', patch: draft })
    bypass()
    navigate('/settings')
  }

  return (
    <section style={{ maxWidth: 560 }}>
      <div className="page-head">
        <h1>Settings</h1>
        <button className="button" type="button" onClick={() => { bypass(); navigate('/settings') }}>
          Cancel
        </button>
      </div>

      <div className="card stack">
        <div className="field">
          <label htmlFor="settings-edit-display-unit">Display unit</label>
          <select
            id="settings-edit-display-unit"
            className="select"
            value={draft.displayUnit}
            onChange={(e) => patch({ displayUnit: e.target.value as DisplayUnit })}
          >
            <option value="kgf">kgf (kilogram-force)</option>
            <option value="N">N (newtons)</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="settings-edit-tolerance">Default color-coding tolerance (%)</label>
          <input
            id="settings-edit-tolerance"
            className="input"
            type="number"
            step="any"
            value={draft.defaultTolerancePct}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!Number.isNaN(v)) patch({ defaultTolerancePct: v })
            }}
          />
        </div>

        <RadarColorField
          id="settings-edit-radar-left"
          label="Radar left color"
          value={draft.radarLeftColor}
          onChange={(radarLeftColor: RadarColorId) => patch({ radarLeftColor })}
        />

        <RadarColorField
          id="settings-edit-radar-right"
          label="Radar right color"
          value={draft.radarRightColor}
          onChange={(radarRightColor: RadarColorId) => patch({ radarRightColor })}
        />

        <div className="button-row">
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
