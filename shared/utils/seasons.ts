export interface NhlSeason {
  id: number
  year: number
  startYear: number
  label: string
}

export function seasonFromYear(year: number): NhlSeason {
  if (!Number.isInteger(year) || year < 1918 || year > 9999) {
    throw new Error('Invalid NHL season year')
  }
  return {
    id: (year - 1) * 10000 + year,
    year,
    startYear: year - 1,
    label: `${year - 1}–${String(year).slice(-2)}`,
  }
}

export function parseSeasonId(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (!/^\d{8}$/.test(String(value))) return null
  const id = Number(value)
  const year = id % 10000
  return year >= 1918 && Math.floor(id / 10000) === year - 1 ? id : null
}

export function seasonForDate(date: string): NhlSeason {
  const parsed = new Date(`${date}T12:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error('Invalid date')
  }
  return seasonFromYear(parsed.getUTCFullYear() + (parsed.getUTCMonth() >= 6 ? 1 : 0))
}

export function easternDate(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export function currentSeason(now = new Date()): NhlSeason {
  return seasonForDate(easternDate(now))
}

export function shiftDate(date: string, days: number): string {
  seasonForDate(date)
  const parsed = new Date(`${date}T12:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

export function scoresDateForSeason(seasonId: number, lastGameDate: string, today: string): string {
  return seasonForDate(today).id === seasonId ? today : lastGameDate
}
