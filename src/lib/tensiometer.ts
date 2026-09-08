import type { CalibrationCurve, Tensiometer, Wheel } from '../types'
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

/** Number of measurement sets referencing each curve id. */
export function usedCurveCounts(wheels: Wheel[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const wheel of wheels) {
    for (const set of wheel.sets) {
      if (set.curveId) counts[set.curveId] = (counts[set.curveId] ?? 0) + 1
    }
  }
  return counts
}
