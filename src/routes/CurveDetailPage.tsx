import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import { usedCurveCounts } from '../lib/tensiometer'
import { CurveEditor } from '../components/CurveEditor'

export function CurveDetailPage() {
  const { tensiometerId, curveId } = useParams<{
    tensiometerId: string
    curveId: string
  }>()
  const { state } = useAppStore()

  const t = state.tensiometers.find((x) => x.id === tensiometerId)
  const curve = t?.curves.find((c) => c.id === curveId)

  if (!t || !curve) {
    return (
      <section>
        <p>Calibration curve not found.</p>
        <Link to={t ? `/tensiometers/${t.id}` : '/tensiometers'}>
          ← Back to {t ? t.name : 'tensiometers'}
        </Link>
      </section>
    )
  }

  const usedBy = usedCurveCounts(state.wheels)[curve.id] ?? 0

  return (
    <section>
      <div className="page-head">
        <Link to={`/tensiometers/${t.id}`}>← Back to {t.name}</Link>
        <h1>
          {t.name} · {curve.gaugeMm} mm
        </h1>
      </div>
      <CurveEditor tensiometerId={t.id} curveId={curve.id} usedBy={usedBy} />
    </section>
  )
}
