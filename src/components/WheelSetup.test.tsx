import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Wheel } from '../types'
import { WheelSetup } from './WheelSetup'

const wheel: Wheel = {
  id: 'w1',
  name: 'Road',
  leftCount: 32,
  rightCount: 32,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 280,
  freeLengthMmRight: 280,
  notes: '',
  sets: [],
}

function renderSetup(w = wheel, onSaved?: () => void) {
  const dispatch = vi.fn()
  render(<WheelSetup wheel={w} dispatch={dispatch} onSaved={onSaved} />)
  return { dispatch }
}

describe('WheelSetup', () => {
  it('marks the mandatory fields as required', () => {
    renderSetup()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Left spokes' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Right spokes' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Free length left (mm)' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'Free length right (mm)' })).toBeRequired()
  })

  it('lets the user empty and retype a numeric field', async () => {
    const user = userEvent.setup()
    renderSetup()
    const left = screen.getByRole('spinbutton', { name: 'Left spokes' })
    await user.clear(left)
    expect(left).toHaveValue(null)
    await user.type(left, '36')
    expect(left).toHaveValue(36)
  })

  it('shows a required custom gauge field when Custom is selected', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Spoke gauge (mm)' }), 'custom')
    expect(screen.getByRole('spinbutton', { name: 'Custom gauge' })).toBeRequired()
  })

  it('disables Save until something changes', () => {
    renderSetup()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('saves changes on submit', async () => {
    const user = userEvent.setup()
    const { dispatch } = renderSetup()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'wheel/update',
      id: 'w1',
      patch: expect.objectContaining({ name: 'Gravel', leftCount: 32 }),
    })
  })

  it('calls onSaved after a successful save', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    renderSetup(wheel, onSaved)
    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSaved).toHaveBeenCalledTimes(1)
  })
})
