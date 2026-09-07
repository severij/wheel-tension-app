import { useParams, Link } from 'react-router-dom'

export function WheelDetailPage() {
  const { wheelId } = useParams<{ wheelId: string }>()
  return (
    <section>
      <Link to="/">← Back to wheels</Link>
      <h1>Wheel</h1>
      <p>
        Wheel <code>{wheelId}</code>. Measuring sets, table, chart, and stats will
        appear here.
      </p>
    </section>
  )
}
