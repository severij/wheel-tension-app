import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { MeasurementSet, Settings, Tensiometer, Wheel } from '../types'
import { DEFAULT_SETTINGS } from '../types'

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

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(reducer, initial ?? emptyState())
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
