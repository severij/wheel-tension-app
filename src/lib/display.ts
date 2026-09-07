import type { DisplayUnit } from '../types'
import { kgfToNewtons, newtonsToKgf } from './frequency'

/**
 * Formats an internal Newtons value into the given display unit's numeric value.
 * Returns the raw number; callers format its text representation.
 */
export function newtonsToDisplay(newtons: number, unit: DisplayUnit): number {
  return unit === 'kgf' ? newtonsToKgf(newtons) : newtons
}

/**
 * Converts a display-unit value (e.g. what the user typed) into internal Newtons.
 */
export function displayToNewtons(value: number, unit: DisplayUnit): number {
  return unit === 'kgf' ? kgfToNewtons(value) : value
}

/** Formats an internal Newtons value as a display string with 1 decimal. */
export function formatNewtons(newtons: number, unit: DisplayUnit): string {
  const v = newtonsToDisplay(newtons, unit)
  return `${v.toFixed(1)} ${unit}`
}
