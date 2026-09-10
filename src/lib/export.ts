import type { Settings, Tensiometer, Wheel } from '../types'
import type { AppState } from '../state/AppStore'

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Exports the whole library (wheels, tensiometers, settings) as JSON. */
export function exportLibrary(state: AppState): void {
  const payload = {
    app: 'wheel-tension-app',
    version: 1,
    wheels: state.wheels,
    tensiometers: state.tensiometers,
    settings: state.settings,
  }
  download(
    'wheel-tension-library.json',
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export interface ImportResult {
  wheels: Wheel[]
  tensiometers: Tensiometer[]
  settings?: Settings
  error?: string
}

/**
 * Parses a library JSON export and returns wheels/tensiometers. Throws on
 * malformed input.
 */
export function parseImport(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON')
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid import file')
  }
  const obj = parsed as Record<string, unknown>

  if (Array.isArray(obj.wheels) && Array.isArray(obj.tensiometers)) {
    return {
      wheels: obj.wheels as Wheel[],
      tensiometers: obj.tensiometers as Tensiometer[],
      settings: obj.settings as Settings | undefined,
    }
  }
  throw new Error('Unrecognized import format')
}
