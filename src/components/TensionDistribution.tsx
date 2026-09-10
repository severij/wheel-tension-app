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
  type LegendItem,
  type TooltipItem,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { derivedNewtons } from '../lib/wheel'
import { newtonsToDisplay } from '../lib/display'
import { CHART_TEXT_COLOR, RADAR_COLORS } from '../lib/colors'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface TensionDistributionProps {
  set: MeasurementSet
  wheel: Wheel
  tensiometers: Tensiometer[]
  settings: Settings
}

export function TensionDistribution({ set, wheel, tensiometers, settings }: TensionDistributionProps) {
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [flipped, setFlipped] = useState(settings.radarFlip)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 400, h: 400 })

  const derived = useMemo(
    () => derivedNewtons(set, wheel, tensiometers, settings),
    [set, wheel, tensiometers, settings],
  )

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

  const maxPts = Math.max(wheel.leftCount, wheel.rightCount)
  const positions = 2 * maxPts

  // The mirror reflects the chart across the vertical axis: the spoke at slot i
  // moves to slot (positions - i) % positions (i.e. angle negation, wrapped).
  const mirrorIndex = (i: number): number => (positions - i) % positions

  // Spoke number shown at a given position; left on odd, right on even slots.
  const spokeForPosition = (i: number): number => {
    const j = flipped ? mirrorIndex(i) : i
    return Math.floor(j / 2) + 1
  }

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

  const leftColor = RADAR_COLORS[settings.radarLeftColor]
  const rightColor = RADAR_COLORS[settings.radarRightColor]

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: scaleMin,
        max: scaleMax,
        ticks: { stepSize: goodStep, backdropColor: 'transparent', color: CHART_TEXT_COLOR },
        grid: { color: 'rgba(0,0,0,0.18)' },
        angleLines: { color: 'rgba(0,0,0,0.18)' },
        pointLabels: { display: false },
      },
    },
    animation: {
      duration: 400,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: CHART_TEXT_COLOR,
          generateLabels: (chart) => {
            const items: LegendItem[] = []
            chart.data.datasets.forEach((ds, datasetIndex) => {
              if (ds.label === 'Left') {
                items.push({
                  text: 'Left (non-drive side)',
                  datasetIndex,
                  index: datasetIndex,
                  fontColor: CHART_TEXT_COLOR,
                  fillStyle: leftColor.fill,
                  strokeStyle: leftColor.border,
                  lineWidth: 2,
                  hidden: !!ds.hidden,
                })
              } else if (ds.label === 'Right') {
                items.push({
                  text: 'Right (drive side)',
                  datasetIndex,
                  index: datasetIndex,
                  fontColor: CHART_TEXT_COLOR,
                  fillStyle: rightColor.fill,
                  strokeStyle: rightColor.border,
                  lineWidth: 2,
                  hidden: !!ds.hidden,
                })
              }
            })
            return items
          },
        },
        onClick: (_event, item, legend) => {
          const ds = legend.chart.data.datasets[item.datasetIndex ?? -1]
          if (ds?.label === 'Left') setShowLeft((v) => !v)
          else if (ds?.label === 'Right') setShowRight((v) => !v)
        },
      },
      tooltip: {
        callbacks: {
          // Read the spoke number from the live labels (rebuilt each render),
          // since Chart.js caches the resolved tooltip callbacks.
          title: (items: TooltipItem<'radar'>[]) =>
            items.map((it) => `Spoke ${it.chart.data.labels?.[it.dataIndex] ?? ''}`),
          label: (ctx: TooltipItem<'radar'>) =>
            `${ctx.dataset.label}: ${ctx.formattedValue} ${settings.displayUnit}`,
        },
      },
    },
  }

  // Left spokes sit at odd positions, right spokes at even positions, so the
  // two sides alternate around the wheel as they do in a real build.
  function sideData(side: 'left' | 'right', count: number): (number | null)[] {
    const offset = side === 'left' ? 1 : 0
    return Array.from({ length: positions }, (_, i) => {
      if (i % 2 !== offset) return null
      const spoke = Math.floor(i / 2) + 1
      if (spoke > count) return null
      const n = derived[spoke]?.[side]
      if (n === undefined) return null
      return newtonsToDisplay(n, settings.displayUnit)
    })
  }

  const applyMirror = <T,>(arr: T[]): T[] =>
    arr.map((_, i) => arr[mirrorIndex(i)])

  const datasets = []
  if (wheel.leftCount > 0) {
    datasets.push({
      label: 'Left',
      hidden: !showLeft,
      data: flipped ? applyMirror(sideData('left', wheel.leftCount)) : sideData('left', wheel.leftCount),
      backgroundColor: leftColor.fill,
      borderColor: leftColor.border,
      borderWidth: 2,
      pointRadius: 2,
      spanGaps: true,
    })
  }
  if (wheel.rightCount > 0) {
    datasets.push({
      label: 'Right',
      hidden: !showRight,
      data: flipped ? applyMirror(sideData('right', wheel.rightCount)) : sideData('right', wheel.rightCount),
      backgroundColor: rightColor.fill,
      borderColor: rightColor.border,
      borderWidth: 2,
      pointRadius: 2,
      spanGaps: true,
    })
  }

  return (
    <div>
      <h2>Tension distribution</h2>

      <div className="button-row" style={{ marginBottom: '0.5rem' }}>
        <label className="row" style={{ gap: '0.25rem', alignItems: 'center' }}>
          <input type="checkbox" checked={flipped} onChange={(e) => setFlipped(e.target.checked)} />
          Flip
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
            labels: Array.from({ length: positions }, (_, i) => String(spokeForPosition(i))),
            datasets,
          }}
          options={options}
        />

        {(wheel.leftCount === 0 || wheel.rightCount === 0) && (
          <p className="muted">Set spoke counts to display the distribution.</p>
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
