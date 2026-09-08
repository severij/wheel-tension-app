import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { AppStoreProvider } from './state/AppStore'
import { createAppRouter } from './router'

function renderAt(path: string) {
  const router = createAppRouter({ initialEntries: [path] })
  return render(
    <AppStoreProvider>
      <RouterProvider router={router} />
    </AppStoreProvider>,
  )
}

describe('App routing', () => {
  it('renders the wheel library at the root path', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Wheel Library' })).toBeInTheDocument()
  })

  it('renders the tensiometers page', () => {
    renderAt('/tensiometers')
    expect(screen.getByRole('heading', { name: 'Tensiometers' })).toBeInTheDocument()
  })
})
