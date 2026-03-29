import { describe, it, expect } from 'vitest'
import { compareStandings } from '~/utils/standings'
import type { Standing } from '~/types/teams'

const createStanding = (overrides: Partial<Standing>): Standing => ({
  gp: 0,
  w: 0,
  l: 0,
  otl: 0,
  pts: 0,
  row: 0,
  gf: 0,
  ga: 0,
  diff: '0',
  home: '0-0-0',
  away: '0-0-0',
  l10: '0-0-0',
  streak: '0',
  conference: undefined,
  short_name: undefined,
  city: undefined,
  name: undefined,
  division: undefined,
  year: 2025,
  ...overrides
})

describe('compareStandings', () => {
  it('sorts by points descending', () => {
    const a = createStanding({ pts: 50 })
    const b = createStanding({ pts: 60 })
    expect(compareStandings(a, b)).toBeGreaterThan(0)
    expect(compareStandings(b, a)).toBeLessThan(0)
  })

  it('sorts by games played ascending when points are tied', () => {
    const a = createStanding({ pts: 60, gp: 50 })
    const b = createStanding({ pts: 60, gp: 48 })
    expect(compareStandings(a, b)).toBeGreaterThan(0)
    expect(compareStandings(b, a)).toBeLessThan(0)
  })

  it('sorts by row descending when points and gp are tied', () => {
    const a = createStanding({ pts: 60, gp: 50, row: 25 })
    const b = createStanding({ pts: 60, gp: 50, row: 30 })
    expect(compareStandings(a, b)).toBeGreaterThan(0)
    expect(compareStandings(b, a)).toBeLessThan(0)
  })

  it('sorts by wins descending when all else is tied', () => {
    const a = createStanding({ pts: 60, gp: 50, row: 25, w: 30 })
    const b = createStanding({ pts: 60, gp: 50, row: 25, w: 35 })
    expect(compareStandings(a, b)).toBeGreaterThan(0)
    expect(compareStandings(b, a)).toBeLessThan(0)
  })

  it('returns 0 for identical standings', () => {
    const a = createStanding({ pts: 60, gp: 50, row: 25, w: 30 })
    const b = createStanding({ pts: 60, gp: 50, row: 25, w: 30 })
    expect(compareStandings(a, b)).toBe(0)
  })

  it('correctly sorts a list of standings', () => {
    const standings = [
      createStanding({ pts: 60, gp: 50, row: 25, w: 30 }),
      createStanding({ pts: 65, gp: 50, row: 30, w: 35 }),
      createStanding({ pts: 60, gp: 48, row: 25, w: 28 }),
      createStanding({ pts: 60, gp: 50, row: 26, w: 30 }),
      createStanding({ pts: 55, gp: 50, row: 22, w: 25 })
    ]

    const sorted = [...standings].sort(compareStandings)

    expect(sorted[0]!.pts).toBe(65)
    expect(sorted[1]!.gp).toBe(48)
    expect(sorted[2]!.row).toBe(26)
    expect(sorted[3]!.w).toBe(30)
    expect(sorted[4]!.pts).toBe(55)
  })
})
