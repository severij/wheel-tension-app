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
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { derivedNewtons, findCurve } from '../lib/wheel'
import { newtonsToDisplay } from '../lib/display'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const LEFT_COLOR = 'rgba(31, 138, 112, 0.5)'
const LEFT_BORDER = '#176b56'
const RIGHT_COLOR = 'rgba(167, 139, 250, 0.45)'
const RIGHT_BORDER = '#7c3aed'

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

  // Each chart fills the wrapper; only the top chart draws gridlines/ticks.
  const baseOptions = (asDataBottom: boolean): ChartOptions<'radar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: scaleMin,
        max: scaleMax,
        ticks: { display: !asDataBottom, stepSize: goodStep, backdropColor: 'transparent' },
        grid: {
          color: asDataBottom ? 'transparent' : 'rgba(0,0,0,0.08)',
        },
        angleLines: { display: !asDataBottom, color: 'rgba(0,0,0,0.08)' },
        pointLabels: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: asDataBottom ? { enabled: false } : undefined,
    },
  })

  const maxPts = Math.max(wheel.leftCount, wheel.rightCount)
  const points = Array.from({ length: maxPts }, (_, i) => i + 1)

  function dataFor(side: 'left' | 'right') {
    return points.map((i) => {
      const n = derived[i]?.[side]
      if (n === undefined) return null
      return newtonsToDisplay(n, settings.displayUnit)
    })
  }

  // Rotation so left/right interleave (equal counts only).
  const leftRotation = wheel.leftCount === wheel.rightCount ? 180 / wheel.leftCount : 0

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
        {/* Bottom layer: primary axes */}
        {showLeft && wheel.leftCount > 0 && (
          <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
            <Radar
              data={{
                labels: points.map(String),
                datasets: [
                  {
                    label: 'Left',
                    data: dataFor('left'),
                    backgroundColor: LEFT_COLOR,
                    borderColor: LEFT_BORDER,
                    borderWidth: 2,
                    pointRadius: 2,
                    rotation: leftRotation,
                  },
                ],
              }}
              options={baseOptions(true)}
            />
          </div>
        )}

        {/* Top layer: axes + right */}
        {showRight && wheel.rightCount > 0 && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Radar
              data={{
                labels: points.map(String),
                datasets: [
                  {
                    label: 'Right',
                    data: dataFor('right'),
                    backgroundColor: RIGHT_COLOR,
                    borderColor: RIGHT_BORDER,
                    borderWidth: 2,
                    pointRadius: 2,
                  },
                ],
              }}
              options={baseOptions(showLeft && wheel.leftCount > 0)}
            />
          </div>
        )}

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
