import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

const initial: AppState = {
  wheels: [
    {
      id: 'w1',
      name: 'Road',
      leftCount: 16,
      rightCount: 16,
      gaugeMm: 1.8,
      densityKgM3: 7850,
      freeLengthMmLeft: 280,
      freeLengthMmRight: 280,
      notes: '',
      sets: [
        { id: 's1', date: new Date('2026-09-08').getTime(), mode: 'frequency', tensions: {} },
      ],
    },
  ],
  tensiometers: [
    {
      id: 't1',
      name: 'TM-1',
      curves: [{ id: 'c1', gaugeMm: 1.8, calibratedOn: 0, points: [] }],
    },
  ],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderAt(path: string) {
  const router = createAppRouter({ initialEntries: [path] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('Breadcrumbs', () => {
  it('shows a wheel measurement trail', () => {
    renderAt('/wheel/w1/set/s1')
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByText('Wheels').closest('a')).toHaveAttribute('href', '/')
    expect(within(nav).getByText('Road').closest('a')).toHaveAttribute('href', '/wheel/w1')
    expect(within(nav).getByText('Road')).toBeInTheDocument()
  })

  it('shows a tensiometer curve edit trail', () => {
    renderAt('/tensiometers/t1/c1/edit')
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByText('Tensiometers')).toBeInTheDocument()
    expect(within(nav).getByText('TM-1')).toBeInTheDocument()
    expect(within(nav).getByText('1.8 mm')).toBeInTheDocument()
    expect(within(nav).getByText('Edit')).toBeInTheDocument()
  })

  it('marks the current page', () => {
    renderAt('/settings')
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByText('Settings')).toHaveAttribute('aria-current', 'page')
  })
})
