import { KG_TO_N } from '../types'

/**
 * Linear density μ of a spoke from its diameter and material density:
 * μ = ρ · π · (d/2)², length per unit length kg/m.
 *
 * @param gaugeMm spoke diameter in millimetres
 * @param densityKgM3 material density in kg/m³
 */
export function linearDensityKgPerM(gaugeMm: number, densityKgM3: number): number {
  const rM = (gaugeMm / 2) / 1000
  const areaM2 = Math.PI * rM * rM
  return densityKgM3 * areaM2
}

/**
 * Tension (Newtons) of a vibrating string: T = μ · (2 · L · f)².
 *
 * @param frequencyHz spoke frequency in hertz
 * @param freeLengthMm free (unsupported) spoke length in millimetres
 * @param linearDensityKgPerM linear density in kg/m
 */
export function frequencyToNewtons(
  frequencyHz: number,
  freeLengthMm: number,
  linearDensityKgPerM: number,
): number {
  const L = freeLengthMm / 1000
  return linearDensityKgPerM * Math.pow(2 * L * frequencyHz, 2)
}

/**
 * Converts a frequency reading directly to Newtons given gauge + material density
 * + free length (the formula path used by frequency mode).
 */
export function frequencyToNewtonsFromWheel(
  frequencyHz: number,
  freeLengthMm: number,
  gaugeMm: number,
  densityKgM3: number,
): number {
  const mu = linearDensityKgPerM(gaugeMm, densityKgM3)
  return frequencyToNewtons(frequencyHz, freeLengthMm, mu)
}

export function newtonsToKgf(newtons: number): number {
  return newtons / KG_TO_N
}

export function kgfToNewtons(kgf: number): number {
  return kgf * KG_TO_N
}
