import type {
  CalibrationCurve,
  MeasurementSet,
  Settings,
  Tensiometer,
  Wheel,
} from '../types'
import { rawToNewtons, type ConversionContext } from './convert'
import { uid } from './id'

/** Creates a new, empty wheel with default physical constants. */
export function createWheel(partial?: Partial<Wheel>): Wheel {
  return {
    id: uid(),
    name: 'Untitled wheel',
    leftCount: 16,
    rightCount: 16,
    gaugeMm: 1.8,
    densityKgM3: 7850, // steel
    freeLengthMmLeft: 280,
    freeLengthMmRight: 280,
    ...partial,
    sets: partial?.sets ?? [],
  }
}

/** Creates a new, empty measurement set. */
export function createSet(partial?: Partial<MeasurementSet>): MeasurementSet {
  return {
    id: uid(),
    date: Date.now(),
    mode: 'tensiometer',
    tolerancePct: undefined,
    tensions: {},
    ...partial,
  }
}

/** Resolves the calibration curve referenced by a set. */
export function findCurve(
  tensiometers: Tensiometer[],
  curveId?: string,
): CalibrationCurve | undefined {
  if (!curveId) return undefined
  for (const t of tensiometers) {
    const curve = t.curves.find((c) => c.id === curveId)
    if (curve) return curve
  }
  return undefined
}

/** The active (most recently created) set, or the last one. */
export function activeSet(wheel: Wheel): MeasurementSet | undefined {
  if (wheel.sets.length === 0) return undefined
  return wheel.sets[wheel.sets.length - 1]
}

interface SideValues {
  left?: number
  right?: number
}

/** Derives per-spoke Newtons values for a set. */
export function derivedNewtons(
  set: MeasurementSet,
  wheel: Wheel,
  tensiometers: Tensiometer[],
  settings: Pick<Settings, 'displayUnit'>,
): Record<number, SideValues> {
  const curve = findCurve(tensiometers, set.curveId)
  const ctx: ConversionContext = { set, wheel, curve }
  const out: Record<number, SideValues> = {}
  for (const idxStr of Object.keys(set.tensions)) {
    const idx = Number(idxStr)
    const raw = set.tensions[idx]
    out[idx] = {}
    if (raw.left !== undefined) {
      out[idx].left = rawToNewtons(raw.left, ctx, true, settings.displayUnit) ?? undefined
    }
    if (raw.right !== undefined) {
      out[idx].right = rawToNewtons(raw.right, ctx, false, settings.displayUnit) ?? undefined
    }
  }
  return out
}

export interface SideStats {
  count: number
  min?: number
  max?: number
  avg?: number
  /** standard deviation of the side's Newtons values */
  stdDev?: number
}

export interface WheelStats {
  left: SideStats
  right: SideStats
}

function sideStat(values: (number | undefined)[]): SideStats {
  const nums = values.filter((v): v is number => v !== undefined && Number.isFinite(v))
  if (nums.length === 0) return { count: 0 }
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((a, b) => a + (b - avg) ** 2, 0) / nums.length
  return { count: nums.length, min, max, avg, stdDev: Math.sqrt(variance) }
}

/** Computes per-side stats over a set's derived Newtons values. */
export function computeStats(derived: Record<number, SideValues>): WheelStats {
  const left: (number | undefined)[] = []
  const right: (number | undefined)[] = []
  for (const idx of Object.keys(derived).map(Number)) {
    left.push(derived[idx].left)
    right.push(derived[idx].right)
  }
  return { left: sideStat(left), right: sideStat(right) }
}

export type SpokeColor = 'ok' | 'warn' | 'bad' | null

/**
 * Returns the color-code status for a spoke's Newtons value on a given side,
 * based on settings.colorBasis and the set's target/tolerance.
 */
export function colorFor(
  newtons: number | undefined,
  sideAvg: number | undefined,
  set: Pick<MeasurementSet, 'targetN' | 'tolerancePct'>,
  settings: Pick<Settings, 'colorBasis' | 'defaultTolerancePct'>,
): SpokeColor {
  if (newtons === undefined || !Number.isFinite(newtons)) return null

  const basis =
    settings.colorBasis === 'target' ? set.targetN : undefined

  // target basis but no target set → no color (warning shown elsewhere)
  if (settings.colorBasis === 'target' && set.targetN === undefined) return null

  const reference = basis ?? sideAvg
  if (reference === undefined || !Number.isFinite(reference)) return null

  const tolPct = set.tolerancePct ?? settings.defaultTolerancePct
  const tol = (reference * tolPct) / 100
  const dev = Math.abs(newtons - reference)
  if (dev <= tol) return 'ok'
  if (dev <= 2 * tol) return 'warn'
  return 'bad'
}

export function sideAverage(
  derived: Record<number, SideValues>,
  side: 'left' | 'right',
): number | undefined {
  const values = Object.values(derived)
    .map((v) => v[side])
    .filter((v): v is number => v !== undefined && Number.isFinite(v))
  if (values.length === 0) return undefined
  return values.reduce((a, b) => a + b, 0) / values.length
}
