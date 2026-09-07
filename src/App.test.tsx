import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { AppStoreProvider } from './state/AppStore'

function renderApp() {
  return render(
    <AppStoreProvider>
      <App />
    </AppStoreProvider>,
  )
}

describe('App routing', () => {
  it('renders the wheel library at the root path', () => {
    window.history.pushState({}, '', '/')
    renderApp()
    expect(
      screen.getByRole('heading', { name: 'Wheel Library' }),
    ).toBeInTheDocument()
  })

  it('renders the tensiometers page', () => {
    window.history.pushState({}, '', '/tensiometers')
    renderApp()
    expect(
      screen.getByRole('heading', { name: 'Tensiometers' }),
    ).toBeInTheDocument()
  })
})
