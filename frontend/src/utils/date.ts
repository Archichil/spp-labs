export const MS_PER_DAY = 24 * 60 * 60 * 1000

export function formatDateISO(date: Date | number | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString()
}

export function formatDateHuman(date: Date | number | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString()
}

export function daysBetween(a: Date | number | string, b: Date | number | string): number {
  const da = a instanceof Date ? a : new Date(a)
  const db = b instanceof Date ? b : new Date(b)
  const diff = Math.abs(db.getTime() - da.getTime())
  return Math.floor(diff / MS_PER_DAY)
}

export function addDays(date: Date | number | string, days: number): Date {
  const d = date instanceof Date ? new Date(date.getTime()) : new Date(date)
  d.setDate(d.getDate() + days)
  return d
}


