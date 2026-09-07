import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, saveState } from './storage'
import { parseImport } from './export'
import type { AppState } from '../state/AppStore'
import type { Wheel } from '../types'

const aWheel: Wheel = {
  id: 'w1',
  name: 'Road',
  leftCount: 16,
  rightCount: 16,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 280,
  freeLengthMmRight: 260,
  sets: [],
}

const state: AppState = {
  wheels: [aWheel],
  tensiometers: [],
  settings: { displayUnit: 'N', defaultTolerancePct: 15, colorBasis: 'average' },
  activeWheelId: 'w1',
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips state', () => {
    saveState(state)
    const loaded = loadState()
    expect(loaded.wheels[0].name).toBe('Road')
    expect(loaded.settings.displayUnit).toBe('N')
  })

  it('returns empty state when nothing is stored', () => {
    expect(loadState().wheels).toEqual([])
  })

  it('merges settings defaults', () => {
    localStorage.setItem('wheel-tension-app:v1', JSON.stringify({ wheels: [] }))
    const loaded = loadState()
    expect(loaded.settings.displayUnit).toBe('kgf')
  })

  it('recovers from corrupt data', () => {
    localStorage.setItem('wheel-tension-app:v1', 'not json')
    const loaded = loadState()
    expect(loaded.wheels).toEqual([])
  })
})

describe('parseImport', () => {
  it('parses a library export', () => {
    const text = JSON.stringify({
      app: 'wheel-tension-app',
      version: 1,
      wheels: [aWheel],
      tensiometers: [],
      settings: { displayUnit: 'N' },
    })
    const r = parseImport(text)
    expect(r.wheels).toHaveLength(1)
    expect(r.settings?.displayUnit).toBe('N')
  })

  it('parses a single-wheel export', () => {
    const text = JSON.stringify({ app: 'wheel-tension-app', version: 1, wheel: aWheel })
    const r = parseImport(text)
    expect(r.wheels[0].id).toBe('w1')
    expect(r.tensiometers).toEqual([])
  })

  it('rejects invalid JSON', () => {
    expect(() => parseImport('nope')).toThrow('Invalid JSON')
  })

  it('rejects unrecognized formats', () => {
    expect(() => parseImport('{"foo": 1}')).toThrow('Unrecognized')
  })
})
