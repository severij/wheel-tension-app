import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App routing', () => {
  it('renders the wheel library at the root path', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Wheel Library' }),
    ).toBeInTheDocument()
  })

  it('renders the tensiometers page', () => {
    window.history.pushState({}, '', '/tensiometers')
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Tensiometers' }),
    ).toBeInTheDocument()
  })
})
