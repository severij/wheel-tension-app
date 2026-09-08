import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { usePwaInstall } from '../lib/pwa'
import { Breadcrumbs } from './Breadcrumbs'
import './Layout.css'

export function Layout() {
  const { canInstall, promptInstall } = usePwaInstall()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus()
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <div className="app-shell">
      <header className="app-header" ref={headerRef}>
        <button
          ref={menuButtonRef}
          className="hamburger"
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="app-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
        <span className="app-title">Wheel Tension</span>

        {menuOpen && (
          <nav id="app-menu" className="app-menu" aria-label="Primary" ref={menuRef}>
            <NavLink to="/" end onClick={closeMenu}>
              Wheels
            </NavLink>
            <NavLink to="/tensiometers" onClick={closeMenu}>
              Tensiometers
            </NavLink>
            <NavLink to="/settings" onClick={closeMenu}>
              Settings
            </NavLink>
            {canInstall && (
              <button
                className="app-menu-install"
                type="button"
                onClick={() => {
                  promptInstall()
                  closeMenu()
                }}
              >
                Install
              </button>
            )}
          </nav>
        )}
      </header>

      <Breadcrumbs />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
