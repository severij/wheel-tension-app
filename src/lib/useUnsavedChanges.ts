import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Guards in-app navigation (and browser reload/close) while `dirty` is true.
 *
 * Returns `blocked`/`proceed`/`reset` for rendering a discard prompt, and
 * `bypass()` to allow the next navigation without prompting (used by explicit
 * Save/Cancel actions).
 */
export function useUnsavedChanges(dirty: boolean) {
  const bypassRef = useRef(false)

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef.current) return false
    if (currentLocation.pathname === nextLocation.pathname) return false
    return dirty
  })

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  return {
    blocked: blocker.state === 'blocked',
    proceed: () => {
      bypassRef.current = true
      blocker.proceed?.()
    },
    reset: () => blocker.reset?.(),
    bypass: () => {
      bypassRef.current = true
    },
  }
}
