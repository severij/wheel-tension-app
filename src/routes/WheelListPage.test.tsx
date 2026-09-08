import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider, emptyState } from '../state/AppStore'
import { createAppRouter } from '../router'

function renderList() {
  const router = createAppRouter({ initialEntries: ['/'] })
  return render(
    <AppStoreProvider initial={emptyState()}>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('WheelListPage', () => {
  it('navigates straight into the edit view when adding a wheel', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: '＋ Add wheel' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Untitled wheel')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })
})
