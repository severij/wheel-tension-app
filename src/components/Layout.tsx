import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

export function Layout() {
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
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
