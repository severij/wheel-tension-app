import type { CalibrationCurve, CalibrationPoint } from '../types'

/** Sorted ascending by `divisions`. */
function sortedPoints(points: CalibrationPoint[]): CalibrationPoint[] {
  return [...points].sort((a, b) => a.divisions - b.divisions)
}

/**
 * Linear interpolation over calibration points, mapping a divisions reading to kgf.
 * Points must be sorted by divisions; values outside the table's range are
 * extrapolated using the nearest edge slope.
 */
export function divisionsToKgf(
  curve: Pick<CalibrationCurve, 'points'>,
  divisions: number,
): number {
  const pts = sortedPoints(curve.points)
  if (pts.length === 0) return 0
  if (pts.length === 1) return pts[0].kgf

  // Below the lowest point: extrapolate with the first segment's slope.
  if (divisions <= pts[0].divisions) {
    return interpolate(pts[0], pts[1], divisions)
  }
  // Above the highest point: extrapolate with the last segment's slope.
  const last = pts[pts.length - 1]
  if (divisions >= last.divisions) {
    return interpolate(pts[pts.length - 2], last, divisions)
  }

  // Within range: find the bracketing segment.
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (divisions >= a.divisions && divisions <= b.divisions) {
      return interpolate(a, b, divisions)
    }
  }
  return last.kgf
}

function interpolate(
  a: CalibrationPoint,
  b: CalibrationPoint,
  divisions: number,
): number {
  const span = b.divisions - a.divisions
  if (span === 0) return a.kgf
  const t = (divisions - a.divisions) / span
  return a.kgf + t * (b.kgf - a.kgf)
}
