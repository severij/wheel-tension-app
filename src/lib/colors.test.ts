import { describe, it, expect } from 'vitest'
import { RADAR_COLORS, RADAR_COLOR_IDS } from './colors'

describe('RADAR_COLORS', () => {
  it('defines a fill, border and label for every color id', () => {
    expect(RADAR_COLOR_IDS.length).toBeGreaterThan(0)
    for (const id of RADAR_COLOR_IDS) {
      const c = RADAR_COLORS[id]
      expect(c.label).toBeTruthy()
      expect(c.fill).toMatch(/^rgba?\(/)
      expect(c.border).toMatch(/^#/)
    }
  })
})
