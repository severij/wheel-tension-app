import type { CalibrationCurve, DisplayUnit, MeasurementSet, Wheel } from '../types'
import { divisionsToKgf } from './calibration'
import { frequencyToNewtons, linearDensityKgPerM, kgfToNewtons } from './frequency'

export interface ConversionContext {
  set: MeasurementSet
  wheel: Pick<
    Wheel,
    | 'leftCount'
    | 'rightCount'
    | 'gaugeMm'
    | 'densityKgM3'
    | 'freeLengthMmLeft'
    | 'freeLengthMmRight'
  >
  curve?: CalibrationCurve
}

/**
 * Converts a raw reading for a given spoke side to Newtons.
 *
 * @param raw the raw reading (divisions, Hz, or direct tension value)
 * @param displayUnit display unit used when the mode is "direct"
 * @returns Newtons, or `null` when the reading is missing
 */
export function rawToNewtons(
  raw: number | undefined,
  ctx: ConversionContext,
  isLeft: boolean,
  displayUnit: DisplayUnit,
): number | null {
  if (raw === undefined || raw === null || Number.isNaN(raw)) return null

  switch (ctx.set.mode) {
    case 'tensiometer': {
      if (!ctx.curve) return null
      return kgfToNewtons(divisionsToKgf(ctx.curve, raw))
    }
    case 'frequency': {
      const L = isLeft ? ctx.wheel.freeLengthMmLeft : ctx.wheel.freeLengthMmRight
      const mu = linearDensityKgPerM(ctx.wheel.gaugeMm, ctx.wheel.densityKgM3)
      return frequencyToNewtons(raw, L, mu)
    }
    case 'direct': {
      // Direct values are entered in the current display unit.
      return displayUnit === 'kgf' ? kgfToNewtons(raw) : raw
    }
    default:
      return null
  }
}
