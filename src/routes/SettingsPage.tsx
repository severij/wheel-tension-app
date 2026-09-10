import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { EditIcon } from '../components/icons'
import { RADAR_COLORS } from '../lib/colors'
import { exportLibrary, parseImport } from '../lib/export'

export function SettingsPage() {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [importError, setImportError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const s = state.settings

  function onImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = parseImport(String(reader.result))
        dispatch({
          type: 'state/import',
          wheels: result.wheels,
          tensiometers: result.tensiometers,
          settings: result.settings,
        })
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Import failed')
      }
    }
    reader.readAsText(file)
  }

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
          <dt>Flip tension distribution</dt>
          <dd>{s.radarFlip ? 'Yes' : 'No'}</dd>
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

      <div className="card">
        <h2>Data</h2>
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          Export the whole library (wheels, tensiometers, settings) as a single
          JSON file, or import a previously exported library.
        </p>
        <div className="button-row">
          <button className="button" type="button" onClick={() => exportLibrary(state)}>
            Export
          </button>
          <button className="button" type="button" onClick={() => fileInput.current?.click()}>
            Import
          </button>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImportFile(f)
            e.target.value = ''
          }}
        />

        {importError && (
          <div className="warning warning--strong" role="alert" style={{ marginTop: '0.5rem' }}>
            Import failed: {importError}
          </div>
        )}
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
