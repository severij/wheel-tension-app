import { Outlet, NavLink } from 'react-router-dom'
import { usePwaInstall } from '../lib/pwa'
import './Layout.css'

export function Layout() {
  const { canInstall, promptInstall } = usePwaInstall()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Wheel Tension</span>
        <nav className="app-nav" aria-label="Primary">
          <NavLink to="/" end>
            Wheels
          </NavLink>
          <NavLink to="/tensiometers">Tensiometers</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        {canInstall && (
          <button className="install-btn" type="button" onClick={promptInstall}>
            Install
          </button>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
