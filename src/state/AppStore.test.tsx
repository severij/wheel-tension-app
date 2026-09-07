import { describe, it, expect } from 'vitest'
import { reducer, emptyState } from './AppStore'
import type { Wheel, MeasurementSet, Tensiometer } from '../types'

const baseWheel = (id: string, sets: MeasurementSet[] = []): Wheel => ({
  id,
  name: id,
  leftCount: 2,
  rightCount: 2,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 1,
  freeLengthMmRight: 1,
  sets,
})

const aSet = (id: string, date = 0): MeasurementSet => ({
  id,
  date,
  mode: 'frequency',
  tensions: {},
})

describe('reducer — wheels', () => {
  it('adds a wheel', () => {
    const s = reducer(emptyState(), { type: 'wheel/add', wheel: baseWheel('w1') })
    expect(s.wheels).toHaveLength(1)
  })

  it('updates a wheel', () => {
    const start = { ...emptyState(), wheels: [baseWheel('w1')] }
    const s = reducer(start, { type: 'wheel/update', id: 'w1', patch: { name: 'Renamed' } })
    expect(s.wheels[0].name).toBe('Renamed')
  })

  it('deletes a wheel', () => {
    const start = { ...emptyState(), wheels: [baseWheel('w1')] }
    const s = reducer(start, { type: 'wheel/delete', id: 'w1' })
    expect(s.wheels).toHaveLength(0)
  })
})

describe('reducer — sets', () => {
  it('sorts sets by date on add', () => {
    const start = { ...emptyState(), wheels: [baseWheel('w1', [aSet('s1', 100)])] }
    const s = reducer(start, {
      type: 'set/add',
      wheelId: 'w1',
      set: aSet('s2', 50),
    })
    expect(s.wheels[0].sets.map((x) => x.id)).toEqual(['s2', 's1'])
  })

  it('updates and deletes a set', () => {
    const start = { ...emptyState(), wheels: [baseWheel('w1', [aSet('s1')])] }
    const updated = reducer(start, {
      type: 'set/update',
      wheelId: 'w1',
      setId: 's1',
      patch: { notes: 'hi' },
    })
    expect(updated.wheels[0].sets[0].notes).toBe('hi')
    const deleted = reducer(updated, { type: 'set/delete', wheelId: 'w1', setId: 's1' })
    expect(deleted.wheels[0].sets).toHaveLength(0)
  })
})

describe('reducer — tensiometers & settings', () => {
  const t = (id: string): Tensiometer => ({ id, name: id, curves: [] })

  it('adds, updates and deletes tensiometers', () => {
    const added = reducer(emptyState(), { type: 'tensiometer/add', tensiometer: t('t1') })
    expect(added.tensiometers).toHaveLength(1)
    const updated = reducer(added, { type: 'tensiometer/update', id: 't1', patch: { name: 'TM-1' } })
    expect(updated.tensiometers[0].name).toBe('TM-1')
    const deleted = reducer(updated, { type: 'tensiometer/delete', id: 't1' })
    expect(deleted.tensiometers).toHaveLength(0)
  })

  it('updates settings', () => {
    const s = reducer(emptyState(), { type: 'settings/update', patch: { displayUnit: 'N' } })
    expect(s.settings.displayUnit).toBe('N')
  })
})
