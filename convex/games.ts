import { query, internalAction, internalMutation } from './_generated/server'
import type { ActionCtx } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import { gameState, gameWithTeams, goal, countResult, upsertResult } from './lib/validators'
import { fetchNhl, seasonTeams } from './lib/seasonData'
import { prepareSeason } from './lib/seasonImport'
import { easternDate, seasonForDate, shiftDate } from '../shared/utils/seasons'

interface NHLGame {
  id: number
  season: number
  gameDate: string
  gameType?: number
  startTimeUTC: string
  gameState: string
  periodDescriptor?: { number: number }
  homeTeam: { abbrev: string; score?: number }
  awayTeam: { abbrev: string; score?: number }
  venue?: { default: string }
  goals?: Array<{
    period?: number
    periodDescriptor?: { number: number }
    timeInPeriod: string
    playerId: number
    lastName?: { default?: string }
    teamAbbrev?: string
    goalModifier?: string
  }>
}

export function mapGameState(state: string): 'SCHEDULED' | 'LIVE' | 'FINAL' {
  if (['LIVE', 'CRIT', 'CRITICAL'].includes(state)) return 'LIVE'
  if (['OFF', 'FINAL'].includes(state)) return 'FINAL'
  return 'SCHEDULED'
}

function mapGame(game: NHLGame) {
  return {
    gameId: game.id,
    gameDate: game.gameDate,
    season: game.season,
    homeTeamAbbrev: game.homeTeam.abbrev,
    awayTeamAbbrev: game.awayTeam.abbrev,
    homeScore: game.homeTeam.score,
    awayScore: game.awayTeam.score,
    gameState: mapGameState(game.gameState),
    period: game.periodDescriptor?.number,
    venue: game.venue?.default,
    startTimeUTC: game.startTimeUTC,
    goals: game.goals?.map((g) => ({
      period: g.periodDescriptor?.number ?? g.period ?? 1,
      timeInPeriod: g.timeInPeriod,
      playerId: g.playerId,
      lastName: g.lastName?.default ?? String(g.playerId),
      teamAbbrev: g.teamAbbrev ?? '',
      isEmptyNet: g.goalModifier === 'empty-net',
    })),
  }
}

export const getGamesByDate = query({
  args: { date: v.string(), season: v.number() },
  returns: v.array(gameWithTeams),
  handler: async (ctx, args) => {
    if (seasonForDate(args.date).id !== args.season) return []
    const games = await ctx.db
      .query('games')
      .withIndex('season_date', (q) => q.eq('season', args.season).eq('gameDate', args.date))
      .take(32)
    return Promise.all(
      games.map(async (game) => ({
        ...game,
        gameState: mapGameState(game.gameState),
        homeTeam: await ctx.db.get(game.homeTeam_id),
        awayTeam: await ctx.db.get(game.awayTeam_id),
        goals: game.goals ?? [],
      })),
    )
  },
})

export const syncGamesAction = internalAction({
  args: { date: v.optional(v.string()), yesterday: v.optional(v.boolean()) },
  returns: countResult,
  handler: async (ctx, args) => {
    const today = easternDate()
    const date = args.date ?? (args.yesterday ? shiftDate(today, -1) : today)
    seasonForDate(date)
    const data = await fetchNhl<{ games: NHLGame[] }>(`score/${date}`)
    await ctx.runMutation(internal.games.syncGames, { games: data.games.map(mapGame) })
    return { count: data.games.length }
  },
})

export async function syncSeasonSchedule(
  ctx: ActionCtx,
  year: number,
): Promise<{ count: number; lastGameDate: string }> {
  const source = await prepareSeason(ctx, year)
  const seasonId = (year - 1) * 10000 + year
  const teams = source.standings.map((standing) => standing.teamAbbrev.default)
  const games = new Map<number, NHLGame>()
  for (let offset = 0; offset < teams.length; offset += 4) {
    const schedules = await Promise.all(
      teams
        .slice(offset, offset + 4)
        .map((team) => fetchNhl<{ games: NHLGame[] }>(`club-schedule-season/${team}/${seasonId}`)),
    )
    for (const schedule of schedules) {
      for (const game of schedule.games) {
        if (game.season === seasonId && (game.gameType === 2 || game.gameType === 3))
          games.set(game.id, game)
      }
    }
  }
  const records = [...games.values()]
  for (let offset = 0; offset < records.length; offset += 100) {
    await ctx.runMutation(internal.games.syncGames, {
      games: records.slice(offset, offset + 100).map(mapGame),
    })
  }
  const today = easternDate()
  const lastGameDate =
    records
      .filter((game) => game.gameDate <= today)
      .map((game) => game.gameDate)
      .sort()
      .at(-1) ?? source.startDate
  return { count: records.length, lastGameDate }
}

export const syncGames = internalMutation({
  args: {
    games: v.array(
      v.object({
        gameId: v.number(),
        gameDate: v.string(),
        season: v.number(),
        homeTeamAbbrev: v.string(),
        awayTeamAbbrev: v.string(),
        homeScore: v.optional(v.number()),
        awayScore: v.optional(v.number()),
        gameState,
        period: v.optional(v.number()),
        venue: v.optional(v.string()),
        startTimeUTC: v.string(),
        goals: v.optional(v.array(goal)),
      }),
    ),
  },
  returns: upsertResult,
  handler: async (ctx, args) => {
    let inserted = 0
    let updated = 0
    const teamsByYear = new Map<number, Awaited<ReturnType<typeof seasonTeams>>>()
    for (const game of args.games) {
      const year = game.season % 10000
      let teams = teamsByYear.get(year)
      if (!teams) {
        teams = await seasonTeams(ctx, year)
        teamsByYear.set(year, teams)
      }
      const homeTeam = teams.find((team) => team.short_name === game.homeTeamAbbrev)
      const awayTeam = teams.find((team) => team.short_name === game.awayTeamAbbrev)
      if (!homeTeam || !awayTeam)
        throw new Error(`Missing team for game ${game.gameId} in season ${game.season}`)
      const existing = await ctx.db
        .query('games')
        .withIndex('gameId', (q) => q.eq('gameId', game.gameId))
        .unique()
      const record = {
        gameId: game.gameId,
        gameDate: game.gameDate,
        season: game.season,
        homeTeam_id: homeTeam._id,
        awayTeam_id: awayTeam._id,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        gameState: game.gameState,
        period: game.period,
        venue: game.venue,
        startTimeUTC: game.startTimeUTC,
        ...(game.goals !== undefined ? { goals: game.goals } : {}),
      }
      if (existing) {
        await ctx.db.patch(existing._id, record)
        updated++
      } else {
        await ctx.db.insert('games', record)
        inserted++
      }
    }
    return { inserted, updated }
  },
})
