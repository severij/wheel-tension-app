import { describe, it, expect } from 'vitest'
import { divisionsToKgf } from './calibration'
import type { CalibrationCurve } from '../types'

function curve(points: CalibrationCurve['points']): CalibrationCurve {
  return { id: 'c', gaugeMm: 1.8, calibratedOn: 0, points }
}

describe('divisionsToKgf', () => {
  const c = curve([
    { divisions: 10, kgf: 10 },
    { divisions: 20, kgf: 30 },
    { divisions: 30, kgf: 70 },
  ])

  it('interpolates between table points', () => {
    expect(divisionsToKgf(c, 15)).toBeCloseTo(20, 5)
    expect(divisionsToKgf(c, 25)).toBeCloseTo(50, 5)
  })

  it('returns exact values at table points', () => {
    expect(divisionsToKgf(c, 10)).toBeCloseTo(10, 5)
    expect(divisionsToKgf(c, 30)).toBeCloseTo(70, 5)
  })

  it('extrapolates below the table using the first slope', () => {
    // slope = (30-10)/(20-10) = 2; at division 5: 10 + 2*(5-10) = 0
    expect(divisionsToKgf(c, 5)).toBeCloseTo(0, 5)
  })

  it('extrapolates above the table using the last slope', () => {
    // slope = (70-30)/(30-20) = 4; at division 35: 70 + 4*(35-30) = 90
    expect(divisionsToKgf(c, 35)).toBeCloseTo(90, 5)
  })

  it('handles single-point tables', () => {
    expect(divisionsToKgf(curve([{ divisions: 5, kgf: 12 }]), 100)).toBeCloseTo(12, 5)
  })

  it('handles empty tables', () => {
    expect(divisionsToKgf(curve([]), 10)).toBe(0)
  })

  it('works with unsorted input', () => {
    const unsorted = curve([
      { divisions: 30, kgf: 70 },
      { divisions: 10, kgf: 10 },
      { divisions: 20, kgf: 30 },
    ])
    expect(divisionsToKgf(unsorted, 15)).toBeCloseTo(20, 5)
  })
})
