import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppStoreProvider } from '../state/AppStore'
import { TensiometerPage } from './TensiometerPage'

async function setupWithPoint() {
  const user = userEvent.setup()
  render(
    <AppStoreProvider>
      <TensiometerPage />
    </AppStoreProvider>,
  )
  await user.click(screen.getByRole('button', { name: '＋ Add tensiometer' }))
  await user.click(screen.getByRole('button', { name: '＋ Add curve' }))
  await user.click(screen.getByRole('button', { name: '＋ Point' }))
  return user
}

describe('TensiometerPage', () => {
  it('marks required calibration point fields as required', async () => {
    await setupWithPoint()
    expect(screen.getByRole('spinbutton', { name: 'Divisions' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: 'kgf' })).toBeRequired()
    expect(screen.getByRole('spinbutton', { name: /Gauge/ })).toBeRequired()
  })

  it('lets the user empty and retype a calibration point value', async () => {
    const user = await setupWithPoint()
    const divisions = screen.getByRole('spinbutton', { name: 'Divisions' })
    expect(divisions).toHaveValue(0)

    await user.clear(divisions)
    expect(divisions).toHaveValue(null)

    await user.type(divisions, '1')
    expect(divisions).toHaveValue(1)
  })

  it('keeps point values as entered when applying points', async () => {
    const user = await setupWithPoint()
    const divisions = screen.getByRole('spinbutton', { name: 'Divisions' })
    await user.clear(divisions)
    await user.type(divisions, '12')
    await user.click(screen.getByRole('button', { name: 'Apply points' }))
    expect(divisions).toHaveValue(12)
  })
})
