import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from '../state/AppStore'
import type { AppState } from '../state/AppStore'
import type { Wheel } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { createAppRouter } from '../router'

const wheel: Wheel = {
  id: 'w1',
  name: 'Road',
  leftCount: 16,
  rightCount: 16,
  gaugeMm: 1.8,
  densityKgM3: 7850,
  freeLengthMmLeft: 280,
  freeLengthMmRight: 280,
  notes: '',
  sets: [],
}

const initial: AppState = {
  wheels: [wheel],
  tensiometers: [],
  settings: DEFAULT_SETTINGS,
  activeWheelId: null,
}

function renderEdit() {
  const router = createAppRouter({ initialEntries: ['/wheel/w1/edit'] })
  return render(
    <AppStoreProvider initial={initial}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('WheelEditPage', () => {
  it('saves and returns to the display view', async () => {
    const user = userEvent.setup()
    renderEdit()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('heading', { name: 'Gravel' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument()
  })

  it('cancels and discards the changes', async () => {
    const user = userEvent.setup()
    renderEdit()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Road' })).toBeInTheDocument()
  })

  it('prompts before leaving with unsaved changes and discards on confirm', async () => {
    const user = userEvent.setup()
    renderEdit()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('link', { name: 'Road' }))
    expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect(screen.getByRole('heading', { name: 'Road' })).toBeInTheDocument()
  })

  it('keeps editing when the discard prompt is cancelled', async () => {
    const user = userEvent.setup()
    renderEdit()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('link', { name: 'Road' }))
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
  })
})

describe('WheelEditPage (new wheel)', () => {
  function renderNew() {
    const router = createAppRouter({ initialEntries: ['/wheel/new1/edit'] })
    return render(
      <AppStoreProvider initial={{ ...initial, wheels: [] }}>
        <RouterProvider router={router} />
      </AppStoreProvider>,
    )
  }

  it('does not create a wheel when the new edit is cancelled', async () => {
    const user = userEvent.setup()
    renderNew()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Wheel Library' })).toBeInTheDocument()
  })

  it('creates the wheel when the new edit is saved', async () => {
    const user = userEvent.setup()
    renderNew()
    const name = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(name)
    await user.type(name, 'Gravel')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('heading', { name: 'Gravel' })).toBeInTheDocument()
  })
})
