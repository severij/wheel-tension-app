import type { MeasurementSet, Tensiometer } from '../types'
import { findCurve } from '../lib/wheel'

interface TensionWarningsProps {
  set: MeasurementSet
  tensiometers: Tensiometer[]
}

/** Warnings that explain why tension-based coloring may be incomplete. */
export function TensionWarnings({ set, tensiometers }: TensionWarningsProps) {
  const curveMissing = set.mode === 'tensiometer' && !findCurve(tensiometers, set.curveId)

  if (!curveMissing) return null

  return (
    <div className="warning" style={{ marginBottom: '0.75rem' }}>
      Select a calibration curve to display tensiometer values.
    </div>
  )
}
