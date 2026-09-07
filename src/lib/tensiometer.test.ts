import { describe, it, expect } from 'vitest'
import { createCurve, createTensiometer } from './tensiometer'

describe('createTensiometer', () => {
  it('creates a tensiometer with a stable id and empty curves', () => {
    const t = createTensiometer()
    expect(t.id).toBeTruthy()
    expect(t.name).toBe('New tensiometer')
    expect(t.curves).toEqual([])
  })

  it('merges provided partials', () => {
    const t = createTensiometer({ name: 'TM-1' })
    expect(t.name).toBe('TM-1')
  })
})

describe('createCurve', () => {
  it('creates a curve with defaults', () => {
    const c = createCurve()
    expect(c.id).toBeTruthy()
    expect(c.gaugeMm).toBe(1.8)
    expect(c.points).toEqual([])
    expect(c.calibratedOn).toBeTruthy()
  })
})
