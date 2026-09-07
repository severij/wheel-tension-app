import type {
  MeasurementSet,
  Settings,
  Tensiometer,
  Wheel,
} from '../types'
import type { AppState } from '../state/AppStore'
import { derivedNewtons } from './wheel'
import { newtonsToDisplay } from './display'

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

export function exportWheel(wheel: Wheel): void {
  const payload = { app: 'wheel-tension-app', version: 1, wheel }
  download(
    `${safeName(wheel.name)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export function exportSetCSV(
  set: MeasurementSet,
  wheel: Wheel,
  tensiometers: Tensiometer[],
  settings: Settings,
): void {
  const derived = derivedNewtons(set, wheel, tensiometers, settings)
  const maxCount = Math.max(wheel.leftCount, wheel.rightCount)
  const unit = settings.displayUnit
  const num = (n?: number) =>
    n === undefined ? '' : newtonsToDisplay(n, unit).toFixed(1)

  const rows: string[] = ['spoke,left,leftRaw,right,rightRaw']
  for (let i = 1; i <= maxCount; i++) {
    rows.push(
      [
        i,
        num(derived[i]?.left),
        set.tensions[i]?.left ?? '',
        num(derived[i]?.right),
        set.tensions[i]?.right ?? '',
      ].join(','),
    )
  }
  download(`${safeName(wheel.name)}.csv`, rows.join('\n'), 'text/csv')
}

export interface ImportResult {
  wheels: Wheel[]
  tensiometers: Tensiometer[]
  settings?: Settings
  error?: string
}

/**
 * Parses an exported JSON payload and returns wheels/tensiometers. Throws on
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

  // Whole library export
  if (Array.isArray(obj.wheels) && Array.isArray(obj.tensiometers)) {
    return {
      wheels: obj.wheels as Wheel[],
      tensiometers: obj.tensiometers as Tensiometer[],
      settings: obj.settings as Settings | undefined,
    }
  }
  // Single-wheel export
  if (obj.wheel && typeof obj.wheel === 'object') {
    return { wheels: [obj.wheel as Wheel], tensiometers: [] }
  }
  throw new Error('Unrecognized import format')
}

function safeName(name: string): string {
  return (name || 'wheel').replace(/[^a-z0-9-_ ]/gi, '_').trim().replace(/\s+/g, '_') || 'wheel'
}
