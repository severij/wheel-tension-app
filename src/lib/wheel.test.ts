import { describe, it, expect } from 'vitest'
import {
  computeStats,
  colorFor,
  derivedNewtons,
  findCurve,
  sideAverage,
} from './wheel'
import type { Settings, Tensiometer, Wheel, MeasurementSet } from '../types'

const tensiometers: Tensiometer[] = [
  {
    id: 't1',
    name: 'TM-1',
    curves: [
      {
        id: 'c1',
        gaugeMm: 2.0,
        calibratedOn: 0,
        points: [
          { divisions: 10, kgf: 10 },
          { divisions: 20, kgf: 30 },
        ],
      },
    ],
  },
]

const wheel: Wheel = {
  id: 'w1',
  name: 'Road front',
  leftCount: 16,
  rightCount: 16,
  gaugeMm: 2.0,
  densityKgM3: 7850,
  freeLengthMmLeft: 300,
  freeLengthMmRight: 280,
  sets: [],
}

function set(partial: Partial<MeasurementSet> = {}): MeasurementSet {
  return {
    id: 's1',
    date: 0,
    mode: 'tensiometer',
    curveId: 'c1',
    tensions: {},
    ...partial,
  }
}

const settings: Settings = {
  displayUnit: 'kgf',
  defaultTolerancePct: 10,
  radarLeftColor: 'orange',
  radarRightColor: 'green',
}

describe('findCurve', () => {
  it('finds a curve by id across tensiometers', () => {
    expect(findCurve(tensiometers, 'c1')?.id).toBe('c1')
    expect(findCurve(tensiometers, 'missing')).toBeUndefined()
    expect(findCurve(tensiometers)).toBeUndefined()
  })
})

describe('derivedNewtons', () => {
  it('converts tensiometer divisions to Newtons', () => {
    const s = set({
      tensions: { 0: { left: 15 } }, // 15 → 20 kgf → ~196 N
    })
    const d = derivedNewtons(s, wheel, tensiometers, settings)
    expect(d[0].left).toBeCloseTo(20 * 9.80665, 4)
    expect(d[0].right).toBeUndefined()
  })

  it('uses per-side free length for frequency', () => {
    const s = set({
      mode: 'frequency',
      tensions: { 0: { left: 300, right: 300 } },
    })
    const d = derivedNewtons(s, wheel, tensiometers, settings)
    expect(d[0].right).toBeLessThan(d[0].left as number)
  })
})

describe('computeStats', () => {
  const s = set({
    tensions: {
      0: { left: 10 },
      1: { left: 30 },
      2: { left: 20 },
    },
  })
  const d = derivedNewtons(s, wheel, tensiometers, settings)

  it('computes min/max/avg/stdDev per side', () => {
    // divisions 10/30/20 → kgf 10/50/30 → N 98.07/490.33/294.20
    const stats = computeStats(d)
    expect(stats.left.count).toBe(3)
    expect(stats.left.min).toBeCloseTo(98.0665, 4)
    expect(stats.left.max).toBeCloseTo(490.3325, 4)
    expect(stats.left.avg).toBeCloseTo(294.1995, 4)
    expect(stats.right.count).toBe(0)
  })
})

describe('colorFor', () => {
  it('colors against the side average within tolerance', () => {
    expect(colorFor(100, 100, set(), settings)).toBe('ok')
    expect(colorFor(130, 100, set(), settings)).toBe('bad')
  })

  it('classifies ok/warn/bad by the tolerance band', () => {
    const s = set({ tolerancePct: 10 })
    expect(colorFor(100, 100, s, settings)).toBe('ok')
    expect(colorFor(108, 100, s, settings)).toBe('ok')
    expect(colorFor(115, 100, s, settings)).toBe('warn')
    expect(colorFor(112, 100, s, settings)).toBe('warn')
    expect(colorFor(125, 100, s, settings)).toBe('bad')
  })

  it('returns null for missing values', () => {
    expect(colorFor(undefined, 100, set(), settings)).toBeNull()
  })
})

describe('sideAverage', () => {
  it('averages only the requested side over present values', () => {
    const s = set({
      tensions: { 0: { left: 10 }, 1: { left: 30 } },
    })
    const d = derivedNewtons(s, wheel, tensiometers, settings)
    // div 10 → 10 kgf, div 30 → 50 kgf; avg = 30 kgf = 294.1995 N
    expect(sideAverage(d, 'left')).toBeCloseTo(294.1995, 4)
    expect(sideAverage(d, 'right')).toBeUndefined()
  })
})
