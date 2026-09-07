import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver; provide a no-op so components that
// observe their container do not crash in tests.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverMock as unknown as typeof ResizeObserver)
