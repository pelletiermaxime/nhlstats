import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import schema from '../../convex/schema'
import { api, internal } from '../../convex/_generated/api'
import { mapGameState } from '../../convex/games'

const modules = import.meta.glob('../../convex/**/*.ts')
const toronto = {
  short_name: 'TOR',
  city: 'Toronto',
  name: 'Maple Leafs',
  division: 'Atlantic',
  conference: 'EAST',
}

afterEach(() => vi.unstubAllGlobals())

function skater(points: number) {
  return {
    playerId: 1,
    firstName: 'Test',
    lastName: 'Skater',
    teamAbbrevs: 'TOR',
    positionCode: 'C',
    gamesPlayed: 10,
    goals: points,
    assists: 0,
    points,
    plusMinus: 0,
    penaltyMinutes: 0,
    pointsPerGame: points / 10,
    gameWinningGoals: 0,
    overtimeGoals: 0,
    shots: 20,
    shootingPct: 0.1,
    timeOnIcePerGame: 1000,
    faceoffWinPct: 0.5,
    powerPlayGoals: 0,
    powerPlayAssists: 0,
    powerPlayPoints: 0,
    shorthandedGoals: 0,
    shorthandedAssists: 0,
    shorthandedPoints: 0,
  }
}

describe('season data boundaries', () => {
  it('fetches every upstream stats page for the requested season', async () => {
    const t = convexTest(schema, modules)
    const starts: number[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = new URL(input)
        let data: unknown
        if (url.pathname.endsWith('/standings-season')) {
          data = {
            seasons: [{ id: 20252026, standingsStart: '2025-10-07', standingsEnd: '2026-04-17' }],
          }
        } else if (url.pathname.includes('/standings/')) {
          data = {
            standings: [
              {
                seasonId: 20252026,
                teamAbbrev: { default: 'TOR' },
                placeName: { default: 'Toronto' },
                teamCommonName: { default: 'Maple Leafs' },
                divisionName: 'Atlantic',
                conferenceAbbrev: 'E',
              },
            ],
          }
        } else {
          expect(url.searchParams.get('cayenneExp')).toContain('seasonId=20252026')
          expect(url.searchParams.get('limit')).toBe('100')
          const start = Number(url.searchParams.get('start'))
          starts.push(start)
          data = {
            total: 102,
            data: Array.from({ length: Math.min(100, 102 - start) }, (_, i) => ({
              ...skater(5),
              playerId: start + i,
              skaterFullName: 'Test Skater',
              otGoals: 0,
              ppGoals: 0,
              ppPoints: 0,
              shGoals: 0,
              shPoints: 0,
            })),
          }
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )
    expect(await t.action(internal.playerStats.syncPlayerStatsAction, { year: 2026 })).toEqual({
      count: 102,
    })
    expect(starts).toEqual([0, 100])
    expect(
      await t.run((ctx) =>
        ctx.db
          .query('playerStats')
          .withIndex('year', (q) => q.eq('year', 2026))
          .take(200),
      ),
    ).toHaveLength(102)
    expect(
      await t.run((ctx) =>
        ctx.db
          .query('playerStats')
          .withIndex('year', (q) => q.eq('year', 2027))
          .take(200),
      ),
    ).toEqual([])
  })

  it('upserts season-specific teams without replacing IDs or other seasons', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(internal.seasons.upsertTeams, { year: 2026, teams: [toronto] })
    const original = await t.query(api.teams.getTeamByShortName, { year: 2026, shortName: 'TOR' })
    await t.mutation(internal.seasons.upsertTeams, { year: 2027, teams: [toronto] })
    await t.mutation(internal.seasons.upsertTeams, {
      year: 2026,
      teams: [{ ...toronto, city: 'Updated Toronto' }],
    })
    const previous = await t.query(api.teams.getTeamByShortName, { year: 2026, shortName: 'TOR' })
    const current = await t.query(api.teams.getTeamByShortName, { year: 2027, shortName: 'TOR' })
    expect(previous?._id).toBe(original?._id)
    expect(current?._id).not.toBe(previous?._id)
    expect(current?.city).toBe('Toronto')
    expect(await t.query(api.teams.getTeams, { year: 2026 })).toHaveLength(1)
  })

  it('offers only completed imports and resolves defaults from ready seasons', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(internal.seasons.upsertTeams, { year: 2026, teams: [toronto] })
    await t.mutation(internal.seasons.upsertTeams, { year: 2027, teams: [toronto] })
    expect(await t.query(api.seasons.getAvailableSeasons, {})).toEqual([])
    await t.mutation(internal.seasons.markReady, { year: 2026, lastGameDate: '2026-06-20' })
    expect((await t.query(api.teams.getTeams, {}))[0]?.year).toBe(2026)
    await t.mutation(internal.seasons.markReady, { year: 2027, lastGameDate: '2026-10-17' })
    expect((await t.query(api.seasons.getAvailableSeasons, {})).map((item) => item.year)).toEqual([
      2027, 2026,
    ])
    expect((await t.query(api.teams.getTeams, {}))[0]?.year).toBe(2027)
  })

  it('keeps same-name players separate in leaderboards and searches', async () => {
    const t = convexTest(schema, modules)
    for (const year of [2026, 2027]) {
      await t.mutation(internal.seasons.upsertTeams, { year, teams: [toronto] })
      await t.mutation(internal.playerStats.syncPlayerStats, {
        year,
        playerStats: [skater(year === 2026 ? 50 : 5)],
      })
    }
    const previous = await t.query(api.playerStats.searchPlayers, { year: 2026, query: 'Skater' })
    const current = await t.query(api.playerStats.searchPlayers, { year: 2027, query: 'Skater' })
    expect(previous.map((player) => player.points)).toEqual([50])
    expect(current.map((player) => player.points)).toEqual([5])
    expect(previous[0]?.team?.year).toBe(2026)
    const wrongSeasonTeam = current[0]!.team!._id
    expect(
      await t.query(api.playerStats.getPlayerStatsWithTeamsByTeamSorted, {
        year: 2026,
        teamId: wrongSeasonTeam,
        sortBy: 'points',
      }),
    ).toEqual([])
    expect(
      await t.query(api.playerStats.searchPlayers, {
        year: 2026,
        query: 'Skater',
        teamId: wrongSeasonTeam,
      }),
    ).toEqual([])
    const board = await t.query(api.playerStats.getPlayerStatsWithTeamsSorted, {
      year: 2027,
      sortBy: 'points',
    })
    expect(board.map((player) => player.points)).toEqual([5])
    const before = current[0]!._id
    await t.mutation(internal.playerStats.syncPlayerStats, {
      year: 2027,
      playerStats: [skater(6), skater(7)],
    })
    const after = await t.query(api.playerStats.searchPlayers, { year: 2027, query: 'Skater' })
    expect(after).toHaveLength(1)
    expect(after[0]?._id).toBe(before)
    expect(after[0]?.points).toBe(7)
  })

  it('keeps goalie searches and team queries within the requested season', async () => {
    const t = convexTest(schema, modules)
    for (const year of [2026, 2027]) {
      await t.mutation(internal.seasons.upsertTeams, { year, teams: [toronto] })
      await t.mutation(internal.goalieStats.syncGoalieStats, {
        year,
        goalieStats: [
          {
            playerId: 2,
            firstName: 'Test',
            lastName: 'Goalie',
            teamAbbrevs: 'TOR',
            gamesPlayed: 10,
            gamesStarted: 10,
            wins: year === 2026 ? 8 : 2,
            losses: 2,
            otLosses: 0,
            shotsAgainst: 300,
            goalsAgainst: 20,
            saves: 280,
            savePct: 0.933,
            goalsAgainstAverage: 2,
            shutouts: 1,
            timeOnIce: 600,
          },
        ],
      })
    }
    const previous = await t.query(api.goalieStats.searchGoalies, { year: 2026, query: 'Goalie' })
    const current = await t.query(api.goalieStats.searchGoalies, { year: 2027, query: 'Goalie' })
    expect(previous.map((goalie) => goalie.wins)).toEqual([8])
    expect(current.map((goalie) => goalie.wins)).toEqual([2])
    expect(previous[0]?.team?.year).toBe(2026)
    const wrongSeasonTeam = current[0]!.team!._id
    expect(
      await t.query(api.goalieStats.getGoalieStatsWithTeamsByTeamSorted, {
        year: 2026,
        teamId: wrongSeasonTeam,
        sortBy: 'wins',
      }),
    ).toEqual([])
    expect(
      await t.query(api.goalieStats.searchGoalies, {
        year: 2026,
        query: 'Goalie',
        teamId: wrongSeasonTeam,
      }),
    ).toEqual([])
  })

  it('does not erase stored goal scorers when refreshing a season schedule', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(internal.seasons.upsertTeams, {
      year: 2026,
      teams: [toronto, { ...toronto, short_name: 'MTL', city: 'Montreal', name: 'Canadiens' }],
    })
    const game = {
      gameId: 1,
      gameDate: '2026-04-01',
      season: 20252026,
      homeTeamAbbrev: 'TOR',
      awayTeamAbbrev: 'MTL',
      homeScore: 1,
      awayScore: 0,
      gameState: 'FINAL' as const,
      startTimeUTC: '2026-04-01T23:00:00Z',
    }
    await t.mutation(internal.games.syncGames, {
      games: [
        {
          ...game,
          goals: [
            {
              period: 1,
              timeInPeriod: '01:00',
              playerId: 1,
              lastName: 'Skater',
              teamAbbrev: 'TOR',
            },
          ],
        },
      ],
    })
    await t.mutation(internal.games.syncGames, { games: [game] })
    const games = await t.query(api.games.getGamesByDate, { date: '2026-04-01', season: 20252026 })
    expect(games).toHaveLength(1)
    expect(games[0]?.goals).toHaveLength(1)
    expect(games[0]?.homeTeam?.year).toBe(2026)
    expect(
      await t.query(api.games.getGamesByDate, { date: '2026-04-01', season: 20262027 }),
    ).toEqual([])
  })

  it('keeps pregame and unknown states scheduled, and critical games live', () => {
    expect(mapGameState('PRE')).toBe('SCHEDULED')
    expect(mapGameState('PPD')).toBe('SCHEDULED')
    expect(mapGameState('CRIT')).toBe('LIVE')
    expect(mapGameState('OFF')).toBe('FINAL')
  })
})
