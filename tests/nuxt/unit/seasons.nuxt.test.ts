import { describe, expect, it } from 'vitest'
import {
  currentSeason,
  parseSeasonId,
  scoresDateForSeason,
  seasonForDate,
  seasonFromYear,
  shiftDate,
} from '~/shared/utils/seasons'

describe('NHL seasons', () => {
  it('maps the ending year to a season ID and label', () => {
    expect(seasonFromYear(2026)).toEqual({
      id: 20252026,
      year: 2026,
      startYear: 2025,
      label: '2025–26',
    })
  })

  it.each(['bad', '20252027', '2026', '', ['20252026'], null])(
    'rejects invalid season IDs: %s',
    (value) => {
      expect(parseSeasonId(value)).toBeNull()
    },
  )

  it('accepts canonical string and numeric IDs', () => {
    expect(parseSeasonId('20252026')).toBe(20252026)
    expect(parseSeasonId(20262027)).toBe(20262027)
  })

  it('resolves rollover in Eastern time and keeps the previous season through June', () => {
    expect(currentSeason(new Date('2026-07-01T03:59:59Z')).id).toBe(20252026)
    expect(currentSeason(new Date('2026-07-01T04:00:00Z')).id).toBe(20262027)
    expect(seasonForDate('2026-04-17').year).toBe(2026)
  })

  it('rejects impossible calendar dates', () => {
    expect(() => seasonForDate('2026-02-30')).toThrow('Invalid date')
  })

  it('moves calendar dates without converting midnight between timezones', () => {
    expect(shiftDate('2026-04-26', -1)).toBe('2026-04-25')
    expect(shiftDate('2026-03-08', -1)).toBe('2026-03-07')
    expect(shiftDate('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('uses today for the current season and the last available game for a past season', () => {
    expect(scoresDateForSeason(20262027, '2026-10-16', '2026-10-17')).toBe('2026-10-17')
    expect(scoresDateForSeason(20252026, '2026-06-20', '2026-10-17')).toBe('2026-06-20')
  })
})
