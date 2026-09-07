import { useAppStore } from '../state/AppStore'

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
          <label>Display unit</label>
          <select
            className="select"
            value={s.displayUnit}
            onChange={(e) => patch({ displayUnit: e.target.value as typeof s.displayUnit })}
          >
            <option value="kgf">kgf (kilogram-force)</option>
            <option value="N">N (newtons)</option>
          </select>
        </div>

        <div className="field">
          <label>Default color-coding tolerance (%)</label>
          <input
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
          <label>Color-coding baseline</label>
          <select
            className="select"
            value={s.colorBasis}
            onChange={(e) => patch({ colorBasis: e.target.value as typeof s.colorBasis })}
          >
            <option value="target">Target tension</option>
            <option value="average">Side average</option>
          </select>
        </div>
      </div>
    </section>
  )
}
