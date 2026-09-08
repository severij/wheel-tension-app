import type { RadarColorId } from '../types'
import { RADAR_COLORS, RADAR_COLOR_IDS } from '../lib/colors'

export function RadarColorField({
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
