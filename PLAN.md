# Bike Wheel Tension App — Final Plan

**Status:** Locked — all design decisions resolved.

## Overview

A Progressive Web App for measuring and recording bike wheel spoke tensions. The user records spoke readings from a tensiometer (analog), a tuner app (frequency), or as direct tension values, and the app computes the corresponding tension, displays a table, and plots it on an overlapping radar chart. Data is organized as dated **measurement sets** per wheel so a wheel can be re-measured over the years.

---

## Stack

- React + Vite + TypeScript
- `vite-plugin-pwa` (PWA: manifest + service worker)
- React Router (multi-page navigation)
- Chart.js via `react-chartjs-2` (radar)
- Vitest (unit tests)
- localStorage (persistence)
- Hosted on GitHub Pages (`base: "/wheel-tension-app/"`)
- English only. No dark mode.

---

## Units

- All values are handled internally in **Newtons (N)**.
- Conversion to kgf (`N / 9.80665`) happens only at display time.
- Global `Settings.displayUnit` (`"kgf" | "N"`) controls display of table readouts, chart, and stats.
- In **direct** (tension value) mode, the user types in the current global display unit; stored as N internally.
- Display precision fixed at 1 decimal.

---

## Measurement modes

| UI label           | Internal       | Raw input → N                                   |
|--------------------|----------------|-------------------------------------------------|
| Tensiometer reading | `"tensiometer"` | divisions → interpolated linked calibration curve |
| Frequency reading   | `"frequency"`   | Hz → string-vibration formula `μ(2Lf)²`, per-side L |
| Tension value       | `"direct"`      | already-final; entered in the current display unit |

Frequency mode is formula-only (no Hz↔kgf calibration curve), because tension depends on per-spoke free length.

---

## Data model (`src/types.ts`)

```ts
interface Settings {
  displayUnit: "kgf" | "N";
  defaultTolerancePct: number;   // default color-coding band for new sets
  colorBasis: "target" | "average";
}

interface CalibrationCurve {
  id: string;
  gaugeMm: number;
  points: { divisions: number; kgf: number }[];  // editable
  calibratedOn: number;          // exact timestamp (ms epoch)
}

interface Tensiometer {
  id: string;
  name: string;                  // e.g. "Park Tool TM-1"
  curves: CalibrationCurve[];    // multiple per gauge, each dated
}

interface Wheel {
  id: string;
  name: string;                  // required; primary identifier
  notes?: string;                // optional free text
  // Physical constants — shared by all sets of this wheel build:
  leftCount: number;
  rightCount: number;
  gaugeMm: number;               // preset 1.6/1.8/2.0 or custom
  densityKgM3: number;           // steel / aluminium / titanium / custom
  freeLengthMmLeft: number;      // per side
  freeLengthMmRight: number;
  sets: MeasurementSet[];
}

interface MeasurementSet {
  id: string;
  date: number;                  // timestamp (ms epoch) — drives year-to-year ordering
  notes?: string;
  mode: "tensiometer" | "frequency" | "direct";
  curveId?: string;              // exact calibration curve used (tensiometer mode)
  targetKgf?: number;
  tolerancePct?: number;
  tensions: { [spokeIndex: number]: { left?: number; right?: number } };  // RAW readings
}
```

### Model conventions

- Raw `tensions` values are stored; derived N/kgf values are always computed on the fly.
- A set references the exact `curveId` used. Values derive live against the curve's *current* `points`.
- **Curve editing:** curves remain editable in place (to fix data-entry typos). Editing a curve that is referenced by sets shows a confirmation dialog listing how many sets are affected (their derived values update). Genuine recalibration = add a new `CalibrationCurve` (new `id` + `calibratedOn`).
- Wheel physical constants are shared across all sets of a wheel; rebuilding/relacing = edit the wheel.
- No seed data — the app starts empty; the user creates tensiometers and calibration curves.

---

## Conversion (`src/lib/`)

- `calibration.ts` — linear interpolation over a `CalibrationCurve.points` (divisions → kgf).
- `frequency.ts` — μ = ρ·π·(gauge/2)²; `N = μ·(2·L·f)²` (L = matching side's free length).
- `convert.ts` — dispatch by `mode` and resolved curve → internal N.
- `display.ts` — N ↔ kgf by `Settings.displayUnit`.

---

## Color coding — target-only, no fallback

- `Settings.colorBasis` (default `"target"`).
- If basis is `target` and the set has no `targetKgf`, cells are uncolored and the chart shows a warning: **"target should be inputted"**.
- Percent tolerance band (global `defaultTolerancePct`, editable per set). Green / orange / red cell backgrounds.
- `average` basis colors each spoke vs. its side average.

---

## Missing-spoke handling

- Radar draws gaps (Chart.js skips null values).
- Stats computed over entered spokes only, with an "x of y entered" note.
- Empty table cells stay neutral gray.
- A side with fewer than 2 entered spokes shows a placeholder state.

---

## Navigation (React Router)

- `/` — **Wheel Library**: create / rename / delete / configure wheels; JSON import/export; CSV export of the selected set.
- `/wheel/:wheelId` — **Wheel detail**: set selector + set editor + tension table + radar chart + stats.
- `/tensiometers` — **Tensiometer manager**: manage devices and their dated calibration curves (with edit-confirmation guard).
- `/settings` — **Settings**: display unit, default tolerance %, color basis.

---

## Components

- `WheelList` — library screen (wheels + import/export/CSV).
- `WheelSetup` — required: spoke counts, gauge (1.6/1.8/2.0/custom), material density (steel/Al/Ti/custom), per-side free length; optional name + notes.
- `SetSelector` — combined stepper + dropdown over the wheel's timestamp-sorted sets (`‹ <date> ▾ ›`), arrows + jump-anywhere + "＋ New measurement".
- `SetEditor` — the set's mode, curve pick (device → dated curve), target + tolerance, and finish action.
- `TensionTable` — spoke rows, left/right inputs (`inputmode="decimal"`), live derived value, color coding; read-only for non-active sets.
- `TensionRadar` — two stacked Chart.js instances per side on one canvas; each with its own spoke count, transparent, same center + max scale so they overlap; equal counts → left rotated `180/countL`° for realistic interleaving; manual legend, side toggles, min/max rings; shows the selected set.
- `StatsPanel` — per-side min/max/avg, L–R spread, deviation %.
- `TensiometerManager` — devices + editable dated per-gauge curves (with confirmation guard).
- `SettingsPanel` — display unit, default tolerance %, color basis.

---

## Layout & PWA

- Desktop: two-column (table | chart + stats). Mobile: single column (setup → table → chart → stats).
- Manifest + 192/512/maskable icons, offline-first caching, install button when `beforeinstallprompt` fires.
- GitHub Pages deploy with `base: "/wheel-tension-app/"`.

---

## Implementation phases

1. Scaffold Vite + React + TS + PWA + Router + Vitest.
2. Types + conversion libs (calibration, frequency, convert, display) + unit tests.
3. Wheel setup + set editor + set selector (mode, table, live derived value, color coding).
4. Radar chart + stats (including the target-input warning).
5. Tensiometer manager + settings.
6. Persistence (sets, tensiometers, settings) + export/import (JSON) + CSV export.
7. PWA polish + responsive verification on GitHub Pages.
