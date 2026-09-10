import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type Chart,
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
  const chartRef = useRef<Chart<'radar'> | null>(null)
  const animRef = useRef(0)
  const dataRef = useRef<{ left: (number | null)[]; right: (number | null)[] }>({
    left: [],
    right: [],
  })
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
                  hidden: ds.data.every((v) => v === null || v === undefined),
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
                  hidden: ds.data.every((v) => v === null || v === undefined),
                })
              }
            })
            return items
          },
        },
        onClick: (_event, item, legend) => {
          const chart = legend.chart
          const ds = chart.data.datasets[item.datasetIndex ?? -1]
          if (!ds) return
          const side = ds.label === 'Left' ? 'left' : ds.label === 'Right' ? 'right' : null
          if (!side) return
          const hidden = ds.data.every((v) => v === null || v === undefined)
          animateSide(item.datasetIndex ?? -1, side, hidden)
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

  const emptyData = Array.from({ length: positions }, () => null)
  const realLeft =
    wheel.leftCount > 0
      ? flipped
        ? applyMirror(sideData('left', wheel.leftCount))
        : sideData('left', wheel.leftCount)
      : []
  const realRight =
    wheel.rightCount > 0
      ? flipped
        ? applyMirror(sideData('right', wheel.rightCount))
        : sideData('right', wheel.rightCount)
      : []

  // Keep the latest real data reachable from the (cached) legend onClick.
  useEffect(() => {
    dataRef.current = { left: realLeft, right: realRight }
  })

  // Smoothly fades a side's data to/from nulls, then commits the React state.
  function animateSide(datasetIndex: number, side: 'left' | 'right', show: boolean) {
    const chart = chartRef.current
    if (!chart) return
    const ds = chart.data.datasets[datasetIndex]
    if (!ds) return
    cancelAnimationFrame(animRef.current)
    const from = (ds.data as (number | null)[]).slice()
    const len = ds.data.length
    const target = show
      ? dataRef.current[side]
      : Array.from({ length: len }, () => null)
    const duration = 300
    const start = performance.now()
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      ds.data = from.map((v, i) => {
        const to = target[i]
        if (v == null && to == null) return null
        if (v == null) return (to ?? 0) * eased
        if (to == null) return (v ?? 0) * (1 - eased)
        return v + (to - v) * eased
      })
      chart.update('none')
      if (t < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        ds.data = target
        chart.update('none')
        if (side === 'left') setShowLeft(show)
        else setShowRight(show)
      }
    }
    animRef.current = requestAnimationFrame(step)
  }

  const datasets = []
  if (wheel.leftCount > 0) {
    datasets.push({
      label: 'Left',
      data: showLeft ? realLeft : emptyData,
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
      data: showRight ? realRight : emptyData,
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
          ref={chartRef}
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
