import type { RadarColorId } from '../types'

export interface RadarColor {
  label: string
  /** Semi-transparent fill for the radar area. */
  fill: string
  /** Solid color for the radar line and points. */
  border: string
}

/** Predefined colors available for the tension radar sides. */
export const RADAR_COLORS: Record<RadarColorId, RadarColor> = {
  green: {
    label: 'Green',
    fill: 'rgba(31, 138, 112, 0.5)',
    border: '#176b56',
  },
  orange: {
    label: 'Orange',
    fill: 'rgba(245, 158, 11, 0.5)',
    border: '#d97706',
  },
  purple: {
    label: 'Purple',
    fill: 'rgba(167, 139, 250, 0.45)',
    border: '#7c3aed',
  },
  blue: {
    label: 'Blue',
    fill: 'rgba(96, 165, 250, 0.5)',
    border: '#2563eb',
  },
  red: {
    label: 'Red',
    fill: 'rgba(248, 113, 113, 0.5)',
    border: '#dc2626',
  },
  cyan: {
    label: 'Cyan',
    fill: 'rgba(34, 211, 238, 0.5)',
    border: '#0891b2',
  },
  pink: {
    label: 'Pink',
    fill: 'rgba(244, 114, 182, 0.5)',
    border: '#db2777',
  },
  yellow: {
    label: 'Yellow',
    fill: 'rgba(250, 204, 21, 0.5)',
    border: '#ca8a04',
  },
}

/** The ordered ids used to render the color pickers. */
export const RADAR_COLOR_IDS = Object.keys(RADAR_COLORS) as RadarColorId[]

/** Chart text color, matching the app's body text (--color-text). */
export const CHART_TEXT_COLOR = '#1a1a1a'
