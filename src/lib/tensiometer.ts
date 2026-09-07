import type { CalibrationCurve, Tensiometer } from '../types'
import { uid } from './id'

/** Creates a new, empty tensiometer device. */
export function createTensiometer(partial?: Partial<Tensiometer>): Tensiometer {
  return { id: uid(), name: 'New tensiometer', curves: [], ...partial }
}

/** Creates a new calibration curve. */
export function createCurve(partial?: Partial<CalibrationCurve>): CalibrationCurve {
  return {
    id: uid(),
    gaugeMm: 1.8,
    calibratedOn: Date.now(),
    points: [],
    ...partial,
  }
}
