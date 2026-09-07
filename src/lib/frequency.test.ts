import { describe, it, expect } from 'vitest'
import {
  linearDensityKgPerM,
  frequencyToNewtons,
  frequencyToNewtonsFromWheel,
  newtonsToKgf,
  kgfToNewtons,
} from './frequency'
import { KG_TO_N } from '../types'

describe('linearDensityKgPerM', () => {
  it('computes μ for a 2.0 mm steel spoke', () => {
    // area = π*(0.001)² m²; * 7850
    const mu = linearDensityKgPerM(2.0, 7850)
    expect(mu).toBeCloseTo(0.02466, 4)
  })

  it('scales with the square of the diameter', () => {
    const d18 = linearDensityKgPerM(1.8, 7850)
    const d20 = linearDensityKgPerM(2.0, 7850)
    expect(d18 / d20).toBeCloseTo((1.8 * 1.8) / (2.0 * 2.0), 5)
  })
})

describe('frequencyToNewtons', () => {
  it('matches the expected frequency for a typical spoke', () => {
    // 2.0mm steel, L=0.3m, ~100kgf (~981N) → ~330 Hz.
    const mu = linearDensityKgPerM(2.0, 7850)
    const T = frequencyToNewtons(332.4, 300, mu)
    expect(T).toBeCloseTo(981, -1)
  })

  it('tension scales with the square of frequency', () => {
    const mu = linearDensityKgPerM(2.0, 7850)
    const f1 = frequencyToNewtons(200, 300, mu)
    const f2 = frequencyToNewtons(400, 300, mu)
    expect(f2 / f1).toBeCloseTo(4, 4)
  })
})

describe('frequencyToNewtonsFromWheel', () => {
  it('equals the explicit mu computation', () => {
    const mu = linearDensityKgPerM(1.8, 2700) // aluminium
    const viaWheel = frequencyToNewtonsFromWheel(300, 280, 1.8, 2700)
    const viaMu = frequencyToNewtons(300, 280, mu)
    expect(viaWheel).toBeCloseTo(viaMu, 5)
  })
})

describe('unit conversions', () => {
  it('converts kgf to N and back', () => {
    expect(kgfToNewtons(100)).toBeCloseTo(100 * KG_TO_N, 5)
    expect(newtonsToKgf(100 * KG_TO_N)).toBeCloseTo(100, 5)
  })
})
