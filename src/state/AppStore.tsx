import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { loadState, saveState } from '../lib/storage'

export interface AppState {
  wheels: Wheel[]
  tensiometers: Tensiometer[]
  settings: Settings
  /** Currently selected wheel id in the detail route context. */
  activeWheelId: string | null
}

export type AppAction =
  | { type: 'wheel/add'; wheel: Wheel }
  | { type: 'wheel/update'; id: string; patch: Partial<Wheel> }
  | { type: 'wheel/delete'; id: string }
  | { type: 'set/add'; wheelId: string; set: MeasurementSet }
  | { type: 'set/update'; wheelId: string; setId: string; patch: Partial<MeasurementSet> }
  | { type: 'set/delete'; wheelId: string; setId: string }
  | { type: 'tensiometer/add'; tensiometer: Tensiometer }
  | { type: 'tensiometer/update'; id: string; patch: Partial<Tensiometer> }
  | { type: 'tensiometer/delete'; id: string }
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'activeWheel/set'; id: string | null }
  | {
      type: 'state/import'
      wheels: Wheel[]
      tensiometers?: Tensiometer[]
      settings?: Partial<Settings>
    }

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'state/import':
      return {
        ...state,
        wheels: mergeWheels(state.wheels, action.wheels),
        tensiometers: mergeTensiometers(
          state.tensiometers,
          action.tensiometers ?? [],
        ),
        settings: action.settings
          ? { ...state.settings, ...action.settings }
          : state.settings,
      }
    case 'wheel/add':
      return { ...state, wheels: [...state.wheels, action.wheel] }
    case 'wheel/update':
      return {
        ...state,
        wheels: state.wheels.map((w) =>
          w.id === action.id ? { ...w, ...action.patch } : w,
        ),
      }
    case 'wheel/delete':
      return {
        ...state,
        wheels: state.wheels.filter((w) => w.id !== action.id),
        activeWheelId:
          state.activeWheelId === action.id ? null : state.activeWheelId,
      }
    case 'set/add':
      return {
        ...state,
        wheels: state.wheels.map((w) =>
          w.id === action.wheelId
            ? { ...w, sets: [...w.sets, action.set].sort((a, b) => a.date - b.date) }
            : w,
        ),
      }
    case 'set/update':
      return {
        ...state,
        wheels: state.wheels.map((w) =>
          w.id === action.wheelId
            ? {
                ...w,
                sets: w.sets.map((s) =>
                  s.id === action.setId ? { ...s, ...action.patch } : s,
                ),
              }
            : w,
        ),
      }
    case 'set/delete':
      return {
        ...state,
        wheels: state.wheels.map((w) =>
          w.id === action.wheelId
            ? { ...w, sets: w.sets.filter((s) => s.id !== action.setId) }
            : w,
        ),
      }
    case 'tensiometer/add':
      return { ...state, tensiometers: [...state.tensiometers, action.tensiometer] }
    case 'tensiometer/update':
      return {
        ...state,
        tensiometers: state.tensiometers.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        ),
      }
    case 'tensiometer/delete':
      return {
        ...state,
        tensiometers: state.tensiometers.filter((t) => t.id !== action.id),
      }
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'activeWheel/set':
      return { ...state, activeWheelId: action.id }
    default:
      return state
  }
}

interface AppStoreValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: AppState
}) {
  // Lazily load persisted state on first render (localStorage-safe).
  const [state, dispatch] = useReducer(reducer, undefined, () => initial ?? loadState())

  // Auto-save with a small debounce whenever state changes (skip first render).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const id = window.setTimeout(() => saveState(state), 250)
    return () => window.clearTimeout(id)
  }, [state])

  return (
    <AppStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore(): AppStoreValue {
  const value = useContext(AppStoreContext)
  if (!value) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }
  return value
}

export function emptyState(): AppState {
  return {
    wheels: [],
    tensiometers: [],
    settings: DEFAULT_SETTINGS,
    activeWheelId: null,
  }
}

/** Merges imported wheels with existing ones, replacing on id match. */
function mergeWheels(existing: Wheel[], incoming: Wheel[]): Wheel[] {
  const map = new Map(existing.map((w) => [w.id, w]))
  for (const w of incoming) map.set(w.id, w)
  return [...map.values()]
}

/** Merges imported tensiometers with existing ones, replacing on id match. */
function mergeTensiometers(
  existing: Tensiometer[],
  incoming: Tensiometer[],
): Tensiometer[] {
  const map = new Map(existing.map((t) => [t.id, t]))
  for (const t of incoming) map.set(t.id, t)
  return [...map.values()]
}
