import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import { KG_TO_N } from '../types'
import type { DisplayUnit } from '../types'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip)

interface CalibrationChartProps {
  points: { divisions: number; kgf: number }[]
  displayUnit: DisplayUnit
  /** Render without the surrounding card and heading (e.g. inside a titled card). */
  bare?: boolean
}

/**
 * Plots the calibration points (divisions → force) with straight segments,
 * matching the linear interpolation used for conversions. The y-axis is shown
 * in the current display unit.
 */
export function CalibrationChart({ points, displayUnit, bare }: CalibrationChartProps) {
  const sorted = [...points].sort((a, b) => a.divisions - b.divisions)
  const data = sorted.map((p) => ({
    x: p.divisions,
    y: displayUnit === 'N' ? p.kgf * KG_TO_N : p.kgf,
  }))

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Divisions' },
        ticks: { precision: 0 },
      },
      y: {
        type: 'linear',
        title: { display: true, text: displayUnit },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'scatter'>) => {
            const pt = sorted[ctx.dataIndex]
            return `${pt.divisions} divisions → ${pt.kgf} kgf`
          },
        },
      },
    },
  }

  const chart = data.length === 0 ? (
    <p className="muted">No calibration points yet.</p>
  ) : (
    <div style={{ height: 280 }}>
      <Scatter
        data={{
          datasets: [
            {
              data,
              showLine: true,
              borderColor: '#1f8a70',
              backgroundColor: '#1f8a70',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        }}
        options={options}
      />
    </div>
  )

  if (bare) return chart

  return (
    <div className="card">
      <div className="page-head">
        <h2>Calibration curve</h2>
      </div>
      {chart}
    </div>
  )
}
