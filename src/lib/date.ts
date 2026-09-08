/** Formats a timestamp as a YYYY-MM-DD string for `<input type="date">`. */
export function toDateInput(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Formats a timestamp as YYYY-MM-DDTHH:mm for `<input type="datetime-local">`. */
export function toDateTimeLocal(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${h}:${min}`
}
