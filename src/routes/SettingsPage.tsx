import { useAppStore } from '../state/AppStore'
import type { RadarColorId } from '../types'
import { RADAR_COLORS, RADAR_COLOR_IDS } from '../lib/colors'

function RadarColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: RadarColorId
  onChange: (v: RadarColorId) => void
}) {
  const preset = RADAR_COLORS[value]
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="row" style={{ alignItems: 'center' }}>
        <select
          id={id}
          className="select"
          value={value}
          onChange={(e) => onChange(e.target.value as RadarColorId)}
        >
          {RADAR_COLOR_IDS.map((cid) => (
            <option key={cid} value={cid}>
              {RADAR_COLORS[cid].label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          style={{
            width: '1.1rem',
            height: '1.1rem',
            borderRadius: '4px',
            background: preset.fill,
            border: `2px solid ${preset.border}`,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { state, dispatch } = useAppStore()
  const s = state.settings

  function patch(p: Partial<typeof s>) {
    dispatch({ type: 'settings/update', patch: p })
  }

  return (
    <section style={{ maxWidth: 560 }}>
      <h1>Settings</h1>

      <div className="card stack">
        <div className="field">
          <label htmlFor="settings-display-unit">Display unit</label>
          <select
            id="settings-display-unit"
            className="select"
            value={s.displayUnit}
            onChange={(e) => patch({ displayUnit: e.target.value as typeof s.displayUnit })}
          >
            <option value="kgf">kgf (kilogram-force)</option>
            <option value="N">N (newtons)</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="settings-tolerance">Default color-coding tolerance (%)</label>
          <input
            id="settings-tolerance"
            className="input"
            type="number"
            step="any"
            value={s.defaultTolerancePct}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!Number.isNaN(v)) patch({ defaultTolerancePct: v })
            }}
          />
          <span className="muted" style={{ fontSize: '0.75rem' }}>
            Applied to new measurement sets; adjustable per set.
          </span>
        </div>

        <div className="field">
          <label htmlFor="settings-color-basis">Color-coding baseline</label>
          <select
            id="settings-color-basis"
            className="select"
            value={s.colorBasis}
            onChange={(e) => patch({ colorBasis: e.target.value as typeof s.colorBasis })}
          >
            <option value="target">Target tension</option>
            <option value="average">Side average</option>
          </select>
        </div>

        <RadarColorField
          id="settings-radar-left-color"
          label="Radar left color"
          value={s.radarLeftColor}
          onChange={(radarLeftColor) => patch({ radarLeftColor })}
        />

        <RadarColorField
          id="settings-radar-right-color"
          label="Radar right color"
          value={s.radarRightColor}
          onChange={(radarRightColor) => patch({ radarRightColor })}
        />
      </div>
    </section>
  )
}
