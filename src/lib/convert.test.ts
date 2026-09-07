import { describe, it, expect } from 'vitest'
import { rawToNewtons, type ConversionContext } from './convert'
import { displayToNewtons, newtonsToDisplay, formatNewtons } from './display'
import type { CalibrationCurve, MeasurementSet } from '../types'
import { KG_TO_N } from '../types'

const wheel = {
  leftCount: 16,
  rightCount: 16,
  gaugeMm: 2.0,
  densityKgM3: 7850,
  freeLengthMmLeft: 300,
  freeLengthMmRight: 280,
}

function ctx(
  set: Partial<MeasurementSet> & Pick<MeasurementSet, 'mode'>,
  curve?: CalibrationCurve,
): ConversionContext {
  return {
    set: { id: 's', date: 0, tensions: {}, ...set } as MeasurementSet,
    wheel,
    curve,
  }
}

describe('rawToNewtons — tensiometer mode', () => {
  const curve: CalibrationCurve = {
    id: 'c',
    gaugeMm: 2.0,
    calibratedOn: 0,
    points: [
      { divisions: 10, kgf: 10 },
      { divisions: 20, kgf: 30 },
    ],
  }

  it('converts divisions to N via the curve', () => {
    const c = ctx({ mode: 'tensiometer', curveId: 'c' }, curve)
    // interpolation at 15 → 20 kgf → 20 * 9.80665 N
    expect(rawToNewtons(15, c, true, 'kgf')).toBeCloseTo(20 * KG_TO_N, 4)
  })

  it('returns null when no curve is available', () => {
    const c = ctx({ mode: 'tensiometer', curveId: 'c' })
    expect(rawToNewtons(15, c, true, 'kgf')).toBeNull()
  })

  it('returns null for missing readings', () => {
    const c = ctx({ mode: 'tensiometer', curveId: 'c' }, curve)
    expect(rawToNewtons(undefined, c, true, 'kgf')).toBeNull()
  })
})

describe('rawToNewtons — frequency mode', () => {
  it('uses the left free length for left spokes', () => {
    const c = ctx({ mode: 'frequency' })
    const left = rawToNewtons(300, c, true, 'kgf')
    const right = rawToNewtons(300, c, false, 'kgf')
    // shorter right side (280 vs 300mm) → lower tension at same frequency
    expect(right).toBeLessThan(left as number)
  })

  it('returns null for missing values', () => {
    const c = ctx({ mode: 'frequency' })
    expect(rawToNewtons(undefined, c, true, 'kgf')).toBeNull()
  })
})

describe('rawToNewtons — direct mode', () => {
  it('treats a kgf-entered value as Newtons when unit is N', () => {
    const c = ctx({ mode: 'direct' })
    expect(rawToNewtons(100, c, true, 'N')).toBeCloseTo(100, 5)
  })

  it('converts kgf-entered value to N when unit is kgf', () => {
    const c = ctx({ mode: 'direct' })
    expect(rawToNewtons(100, c, true, 'kgf')).toBeCloseTo(100 * KG_TO_N, 4)
  })
})

describe('display helpers', () => {
  it('converts internal N to display and back', () => {
    expect(displayToNewtons(newtonsToDisplay(981, 'kgf'), 'kgf')).toBeCloseTo(981, 4)
    expect(newtonsToDisplay(981, 'N')).toBeCloseTo(981, 5)
  })

  it('formats with 1 decimal', () => {
    expect(formatNewtons(981, 'kgf')).toBe('100.0 kgf')
    expect(formatNewtons(981, 'N')).toBe('981.0 N')
  })
})
