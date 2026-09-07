# Bike Wheel Tension App

A Progressive Web App for measuring and recording bike wheel spoke tensions. Record
readings from a tensiometer (analog), a tuner app (frequency), or as direct tension
values; the app derives the corresponding tension, shows a spoke-by-spoke table, and
plots an overlapping radar chart. Data is organized as dated measurement sets per wheel.

## Stack

- React + Vite + TypeScript
- `vite-plugin-pwa` (manifest + service worker)
- React Router (multi-page)
- Chart.js via `react-chartjs-2` (radar chart)
- Vitest + Testing Library (unit tests)
- localStorage (persistence)
- Deploy target: GitHub Pages (`base: /wheel-tension-app/`)

See `PLAN.md` for the full design.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # typecheck + production build (outputs dist/)
npm test             # run Vitest once
npm run test:watch   # run Vitest in watch mode
npm run preview      # preview the production build
npm run lint         # run oxlint
npm run gen:icons    # regenerate the wheel-style PWA icons
```

## GitHub Pages build

Set `VITE_GITHUB_PAGES=true` when building so the app uses the `/wheel-tension-app/`
base path:

```bash
VITE_GITHUB_PAGES=true npm run build
```
