import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { derivedNewtons, findCurve } from '../lib/wheel'
import { newtonsToDisplay } from '../lib/display'
import { RADAR_COLORS } from '../lib/colors'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface TensionRadarProps {
  set: MeasurementSet
  wheel: Wheel
  tensiometers: Tensiometer[]
  settings: Settings
}

export function TensionRadar({ set, wheel, tensiometers, settings }: TensionRadarProps) {
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 400, h: 400 })

  const derived = useMemo(
    () => derivedNewtons(set, wheel, tensiometers, settings),
    [set, wheel, tensiometers, settings],
  )

  // Curve present for tensiometer mode (drives the target warning)
  const curveMissing = set.mode === 'tensiometer' && !findCurve(tensiometers, set.curveId)
  const targetMissing = settings.colorBasis === 'target' && set.targetN === undefined

  // Determine the max value across both sides for the shared ring scale.
  const { leftVals, rightVals } = useMemo(() => {
    const leftVals: number[] = []
    const rightVals: number[] = []
    for (const idx of Object.keys(derived).map(Number)) {
      if (derived[idx].left !== undefined) leftVals.push(derived[idx].left as number)
      if (derived[idx].right !== undefined) rightVals.push(derived[idx].right as number)
    }
    return { leftVals, rightVals }
  }, [derived])

  const maxN = Math.max(1, ...leftVals, ...rightVals)
  const maxDisplay = newtonsToDisplay(maxN, settings.displayUnit)
  const goodStep = niceCeil(maxDisplay / 4)
  const scaleMax = Math.ceil(maxDisplay / goodStep) * goodStep
  const scaleMin = 0

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: scaleMin,
        max: scaleMax,
        ticks: { stepSize: goodStep, backdropColor: 'transparent' },
        grid: { color: 'rgba(0,0,0,0.08)' },
        angleLines: { color: 'rgba(0,0,0,0.08)' },
        pointLabels: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'radar'>) => {
            const spoke = Math.floor(ctx.dataIndex / 2) + 1
            return `${ctx.dataset.label} spoke ${spoke}: ${ctx.formattedValue} ${settings.displayUnit}`
          },
        },
      },
    },
  }

  const maxPts = Math.max(wheel.leftCount, wheel.rightCount)
  const positions = 2 * maxPts

  const leftColor = RADAR_COLORS[settings.radarLeftColor]
  const rightColor = RADAR_COLORS[settings.radarRightColor]

  // Left spokes sit at even positions, right spokes at odd positions, so the
  // two sides alternate around the wheel as they do in a real build.
  function sideData(side: 'left' | 'right', count: number): (number | null)[] {
    const offset = side === 'left' ? 0 : 1
    return Array.from({ length: positions }, (_, i) => {
      if (i % 2 !== offset) return null
      const spoke = Math.floor(i / 2) + 1
      if (spoke > count) return null
      const n = derived[spoke]?.[side]
      if (n === undefined) return null
      return newtonsToDisplay(n, settings.displayUnit)
    })
  }

  const datasets = []
  if (showLeft && wheel.leftCount > 0) {
    datasets.push({
      label: 'Left',
      data: sideData('left', wheel.leftCount),
      backgroundColor: leftColor.fill,
      borderColor: leftColor.border,
      borderWidth: 2,
      pointRadius: 2,
      spanGaps: true,
    })
  }
  if (showRight && wheel.rightCount > 0) {
    datasets.push({
      label: 'Right',
      data: sideData('right', wheel.rightCount),
      backgroundColor: rightColor.fill,
      borderColor: rightColor.border,
      borderWidth: 2,
      pointRadius: 2,
      spanGaps: true,
    })
  }

  return (
    <div>
      <h2>Tension radar</h2>
      {(curveMissing || targetMissing) && (
        <div className="warning">
          {curveMissing ? (
            <>Select a calibration curve to display tensiometer values.</>
          ) : (
            <>Set a target tension to color the map{settings.colorBasis === 'target' ? ' — target should be inputted.' : ''}</>
          )}
        </div>
      )}

      <div className="button-row" style={{ marginBottom: '0.5rem' }}>
        <label className="row" style={{ gap: '0.25rem', alignItems: 'center' }}>
          <input type="checkbox" checked={showLeft} onChange={(e) => setShowLeft(e.target.checked)} />
          Left
        </label>
        <label className="row" style={{ gap: '0.25rem', alignItems: 'center' }}>
          <input type="checkbox" checked={showRight} onChange={(e) => setShowRight(e.target.checked)} />
          Right
        </label>
      </div>

      <div
        ref={wrapperRef}
        style={{
          position: 'relative',
          height: Math.max(320, Math.min(480, size.w)),
          width: '100%',
        }}
      >
        <Radar
          data={{
            labels: Array.from({ length: positions }, (_, i) => String(i)),
            datasets,
          }}
          options={options}
        />

        {(wheel.leftCount === 0 || wheel.rightCount === 0) && (
          <p className="muted">Set spoke counts to display the radar.</p>
        )}
      </div>

      <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
        Axis maximum: {goodStep} {settings.displayUnit} per ring
      </div>
    </div>
  )
}

function niceCeil(v: number): number {
  if (v <= 0) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return niceNorm * mag
}
