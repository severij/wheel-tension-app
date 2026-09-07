import type { AppState } from '../state/AppStore'
import { emptyState } from '../state/AppStore'
import { DEFAULT_SETTINGS } from '../types'

const STORAGE_KEY = 'wheel-tension-app:v1'

/**
 * Persists app state (wheels, tensiometers, settings) to localStorage.
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save state', err)
  }
}

/**
 * Loads app state from localStorage, falling back to an empty state on
 * parse errors or missing data.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      wheels: parsed.wheels ?? [],
      tensiometers: parsed.tensiometers ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      activeWheelId: parsed.activeWheelId ?? null,
    }
  } catch (err) {
    console.error('Failed to load state', err)
    return emptyState()
  }
}

export { STORAGE_KEY }
