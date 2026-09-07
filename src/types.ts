export type DisplayUnit = 'kgf' | 'N'
export type MeasurementMode = 'tensiometer' | 'frequency' | 'direct'
export type ColorBasis = 'target' | 'average'

export interface Settings {
  displayUnit: DisplayUnit
  defaultTolerancePct: number
  colorBasis: ColorBasis
}

export interface CalibrationPoint {
  divisions: number
  kgf: number
}

export interface CalibrationCurve {
  id: string
  gaugeMm: number
  points: CalibrationPoint[]
  /** Exact time (ms epoch) this curve was calibrated / last verified. */
  calibratedOn: number
}

export interface Tensiometer {
  id: string
  name: string
  curves: CalibrationCurve[]
}

export type SpokeTensions = Record<number, { left?: number; right?: number }>

export interface MeasurementSet {
  id: string
  /** Exact time (ms epoch) the measurement was taken. Drives ordering. */
  date: number
  notes?: string
  mode: MeasurementMode
  /** Exact calibration curve used (tensiometer mode). */
  curveId?: string
  /** Target tension in Newtons (used for color coding when colorBasis is "target"). */
  targetN?: number
  /** Color-coding tolerance percent (defaults to Settings.defaultTolerancePct). */
  tolerancePct?: number
  /** Raw readings per spoke index. */
  tensions: SpokeTensions
}

export interface Wheel {
  id: string
  name: string
  notes?: string
  // Physical constants — shared by all sets of this wheel build:
  leftCount: number
  rightCount: number
  gaugeMm: number
  densityKgM3: number
  freeLengthMmLeft: number
  freeLengthMmRight: number
  sets: MeasurementSet[]
}

export const KG_TO_N = 9.80665

export const DEFAULT_SETTINGS: Settings = {
  displayUnit: 'kgf',
  defaultTolerancePct: 10,
  colorBasis: 'target',
}
