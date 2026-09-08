import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../state/AppStore'
import type { AppState } from '../state/AppStore'

interface Crumb {
  label: string
  to?: string
}

function buildTrail(pathname: string, state: AppState): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'Wheels' }]

  if (parts[0] === 'settings') {
    if (parts[1] === 'edit') {
      return [{ label: 'Settings', to: '/settings' }, { label: 'Edit' }]
    }
    return [{ label: 'Settings' }]
  }

  if (parts[0] === 'wheel') {
    const id = parts[1]
    const wheel = state.wheels.find((w) => w.id === id)
    const wheelLabel = wheel?.name ?? id
    const wheelTo = `/wheel/${id}`
    if (parts[2] === 'set') {
      const setId = parts[3]
      const set = wheel?.sets.find((s) => s.id === setId)
      const setLabel = set ? new Date(set.date).toLocaleDateString() : setId
      const setTo = `${wheelTo}/set/${setId}`
      if (parts[4] === 'edit') {
        return [
          { label: 'Wheels', to: '/' },
          { label: wheelLabel, to: wheelTo },
          { label: setLabel, to: setTo },
          { label: 'Edit' },
        ]
      }
      return [
        { label: 'Wheels', to: '/' },
        { label: wheelLabel, to: wheelTo },
        { label: setLabel },
      ]
    }
    if (parts[2] === 'edit') {
      return [
        { label: 'Wheels', to: '/' },
        { label: wheelLabel, to: wheelTo },
        { label: 'Edit' },
      ]
    }
    return [
      { label: 'Wheels', to: '/' },
      { label: wheelLabel },
    ]
  }

  if (parts[0] === 'tensiometers') {
    const id = parts[1]
    const tens = state.tensiometers.find((t) => t.id === id)
    const tensLabel = tens?.name ?? id
    const tensTo = `/tensiometers/${id}`
    if (parts[2] === 'edit') {
      return [
        { label: 'Tensiometers', to: '/tensiometers' },
        { label: tensLabel, to: tensTo },
        { label: 'Edit' },
      ]
    }
    if (parts[2]) {
      const curve = tens?.curves.find((c) => c.id === parts[2])
      const curveLabel = curve ? `${curve.gaugeMm} mm` : parts[2]
      const curveTo = `${tensTo}/${parts[2]}`
      if (parts[3] === 'edit') {
        return [
          { label: 'Tensiometers', to: '/tensiometers' },
          { label: tensLabel, to: tensTo },
          { label: curveLabel, to: curveTo },
          { label: 'Edit' },
        ]
      }
      return [
        { label: 'Tensiometers', to: '/tensiometers' },
        { label: tensLabel, to: tensTo },
        { label: curveLabel },
      ]
    }
    return [
      { label: 'Tensiometers', to: '/tensiometers' },
      { label: tensLabel },
    ]
  }

  return [{ label: 'Wheels' }]
}

export function Breadcrumbs() {
  const location = useLocation()
  const { state } = useAppStore()
  const trail = buildTrail(location.pathname, state)

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {trail.map((c, i) => {
          const isLast = i === trail.length - 1
          if (!isLast && c.to) {
            return (
              <li key={i}>
                <Link to={c.to}>{c.label}</Link>
              </li>
            )
          }
          return (
            <li key={i}>
              <span aria-current={isLast ? 'page' : undefined}>{c.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
