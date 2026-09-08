import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { EditIcon } from '../components/icons'
import { RADAR_COLORS } from '../lib/colors'

export function SettingsPage() {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const s = state.settings

  return (
    <section style={{ maxWidth: 560 }}>
      <div className="page-head">
        <h1>Settings</h1>
        <button
          className="icon-button"
          type="button"
          aria-label="Edit settings"
          title="Edit settings"
          onClick={() => navigate('/settings/edit')}
        >
          <EditIcon />
        </button>
      </div>

      <div className="card">
        <dl className="details">
          <dt>Display unit</dt>
          <dd>{s.displayUnit === 'kgf' ? 'kgf (kilogram-force)' : 'N (newtons)'}</dd>
          <dt>Default color-coding tolerance (%)</dt>
          <dd>{s.defaultTolerancePct}</dd>
          <dt>Radar left color</dt>
          <dd>
            {RADAR_COLORS[s.radarLeftColor].label}{' '}
            <Swatch colorId={s.radarLeftColor} />
          </dd>
          <dt>Radar right color</dt>
          <dd>
            {RADAR_COLORS[s.radarRightColor].label}{' '}
            <Swatch colorId={s.radarRightColor} />
          </dd>
        </dl>
      </div>
    </section>
  )
}

function Swatch({ colorId }: { colorId: keyof typeof RADAR_COLORS }) {
  const c = RADAR_COLORS[colorId]
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '0.9rem',
        height: '0.9rem',
        borderRadius: '4px',
        background: c.fill,
        border: `2px solid ${c.border}`,
        verticalAlign: 'middle',
      }}
    />
  )
}
