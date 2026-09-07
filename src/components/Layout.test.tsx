import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders the primary navigation and route content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1>Home</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'Wheels' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Tensiometers' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Settings' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Home' }),
    ).toBeInTheDocument()
  })
})
