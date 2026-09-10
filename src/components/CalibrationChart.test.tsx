import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CalibrationChart } from './CalibrationChart'

vi.mock('react-chartjs-2', () => ({
  Scatter: () => <div data-testid="scatter-stub" />,
}))

describe('CalibrationChart', () => {
  it('renders the calibration curve heading', () => {
    render(<CalibrationChart points={[{ divisions: 0, kgf: 0 }]} displayUnit="kgf" />)
    expect(screen.getByRole('heading', { name: 'Calibration curve' })).toBeInTheDocument()
    expect(screen.getByTestId('scatter-stub')).toBeInTheDocument()
  })

  it('shows an empty state without points', () => {
    render(<CalibrationChart points={[]} displayUnit="N" />)
    expect(screen.getByText('No calibration points yet.')).toBeInTheDocument()
  })

  it('renders bare without its own card and heading', () => {
    render(<CalibrationChart points={[{ divisions: 0, kgf: 0 }]} displayUnit="kgf" bare />)
    expect(screen.queryByRole('heading', { name: 'Calibration curve' })).not.toBeInTheDocument()
    expect(screen.getByTestId('scatter-stub')).toBeInTheDocument()
  })
})
