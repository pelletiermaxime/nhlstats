import { query, internalAction, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import type { ActionCtx } from './_generated/server'
import { goalieWithTeam, countResult, upsertResult } from './lib/validators'
import { fetchNhl, seasonTeams } from './lib/seasonData'
import { prepareSeason } from './lib/seasonImport'
import { currentSeason, seasonFromYear } from '../shared/utils/seasons'

interface NHLGoalieStats {
  playerId: number
  goalieFullName: string
  lastName: string
  teamAbbrevs: string
  gamesPlayed: number
  gamesStarted: number
  wins: number
  losses: number
  otLosses: number
  shotsAgainst: number
  goalsAgainst: number
  saves: number
  savePct: number
  goalsAgainstAverage: number
  shutouts: number
  timeOnIce: number // in minutes
  goals: number | null
  assists: number | null
  penaltyMinutes: number | null
}

export const getGoalieStatsWithTeamsByTeamSorted = query({
  args: {
    year: v.number(),
    teamId: v.id('teams'),
    sortBy: v.union(
      v.literal('gamesPlayed'),
      v.literal('wins'),
      v.literal('losses'),
      v.literal('otLosses'),
      v.literal('savePct'),
      v.literal('goalsAgainstAverage'),
      v.literal('shutouts'),
    ),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  returns: v.array(goalieWithTeam),
  handler: async (ctx, args) => {
    const goalieStats = await ctx.db
      .query('goalieStats')
      .withIndex('year_team_id', (q) => q.eq('year', args.year).eq('team_id', args.teamId))
      .take(2000)

    const order = args.sortOrder ?? 'desc'
    const sortKey = args.sortBy

    const sortedStats = goalieStats.sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      return order === 'asc' ? aValue - bValue : bValue - aValue
    })

    const team = await ctx.db.get(args.teamId)

    return sortedStats.map((stat) => ({
      ...stat,
      team,
    }))
  },
})

export const searchGoalies = query({
  args: {
    query: v.string(),
    year: v.number(),
    teamId: v.optional(v.id('teams')),
    limit: v.optional(v.number()),
  },
  returns: v.array(goalieWithTeam),
  handler: async (ctx, args) => {
    const searchQuery = args.query.trim().toLowerCase()
    if (!searchQuery) {
      return []
    }

    let goalieStats
    const teamId = args.teamId
    if (teamId) {
      goalieStats = await ctx.db
        .query('goalieStats')
        .withSearchIndex('search_goalies', (q) =>
          q.search('searchName', searchQuery).eq('year', args.year).eq('team_id', teamId),
        )
        .take(Math.max(1, Math.min(Math.trunc(args.limit ?? 20), 100)))
    } else {
      goalieStats = await ctx.db
        .query('goalieStats')
        .withSearchIndex('search_goalies', (q) =>
          q.search('searchName', searchQuery).eq('year', args.year),
        )
        .take(Math.max(1, Math.min(Math.trunc(args.limit ?? 20), 100)))
    }

    const teams = await seasonTeams(ctx, args.year)
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]))

    return goalieStats.map((stat) => {
      const team = teamMap.get(stat.team_id.toString())
      return {
        ...stat,
        team: team ?? null,
      }
    })
  },
})

export const getGoalieStatsWithTeamsSorted = query({
  args: {
    year: v.number(),
    sortBy: v.union(
      v.literal('gamesPlayed'),
      v.literal('wins'),
      v.literal('losses'),
      v.literal('otLosses'),
      v.literal('savePct'),
      v.literal('goalsAgainstAverage'),
      v.literal('shutouts'),
    ),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    limit: v.optional(v.number()),
  },
  returns: v.array(goalieWithTeam),
  handler: async (ctx, args) => {
    const order = args.sortOrder ?? 'desc'
    const limit = Math.max(1, Math.min(Math.trunc(args.limit ?? 100), 100))

    const query = ctx.db
      .query('goalieStats')
      .withIndex(`year_${args.sortBy}`, (q) => q.eq('year', args.year))
      .order(order)

    const goalieStats = await query.take(limit)

    const teams = await seasonTeams(ctx, args.year)
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]))

    return goalieStats.map((stat) => {
      const team = teamMap.get(stat.team_id.toString())
      return {
        ...stat,
        team: team ?? null,
      }
    })
  },
})

export async function syncGoalieSeason(
  ctx: ActionCtx,
  year: number,
  limit = -1,
): Promise<{ count: number }> {
  const seasonId = seasonFromYear(year).id
  await prepareSeason(ctx, year)
  const gameTypeId = 2
  const url = `https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&start=0&limit=${limit}&cayenneExp=gameTypeId=${gameTypeId}%20and%20seasonId=${seasonId}`

  const apiGoalieStats: NHLGoalieStats[] = []
  for (let start = 0; start < 10000; start += 100) {
    const page = await fetchNhl<{ data: NHLGoalieStats[]; total: number }>(
      url.replace(`start=0&limit=${limit}`, `start=${start}&limit=100`),
    )
    apiGoalieStats.push(...page.data)
    if (
      apiGoalieStats.length >= page.total ||
      page.data.length < 100 ||
      (limit > 0 && apiGoalieStats.length >= limit)
    )
      break
  }
  if (limit > 0) apiGoalieStats.splice(limit)

  const goalieStats = apiGoalieStats.map((s) => {
    const lastName = s.lastName
    const firstName = s.goalieFullName.replace(lastName, '').trim()

    return {
      playerId: s.playerId,
      firstName,
      lastName,
      teamAbbrevs: s.teamAbbrevs,
      gamesPlayed: s.gamesPlayed,
      gamesStarted: s.gamesStarted,
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      shotsAgainst: s.shotsAgainst,
      goalsAgainst: s.goalsAgainst,
      saves: s.saves,
      savePct: s.savePct ?? 0,
      goalsAgainstAverage: s.goalsAgainstAverage ?? 0,
      shutouts: s.shutouts,
      timeOnIce: s.timeOnIce ?? 0,
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
      penaltyMinutes: s.penaltyMinutes ?? 0,
    }
  })

  for (let offset = 0; offset < goalieStats.length; offset += 100) {
    await ctx.runMutation(internal.goalieStats.syncGoalieStats, {
      year,
      goalieStats: goalieStats.slice(offset, offset + 100),
    })
  }

  return { count: goalieStats.length }
}

export const syncGoalieStatsAction = internalAction({
  args: { year: v.optional(v.number()), limit: v.optional(v.number()) },
  returns: countResult,
  handler: async (ctx, args) =>
    syncGoalieSeason(ctx, args.year ?? currentSeason().year, args.limit ?? -1),
})

export const syncGoalieStats = internalMutation({
  args: {
    year: v.number(),
    goalieStats: v.array(
      v.object({
        playerId: v.number(),
        firstName: v.string(),
        lastName: v.string(),
        teamAbbrevs: v.string(),
        gamesPlayed: v.number(),
        gamesStarted: v.number(),
        wins: v.number(),
        losses: v.number(),
        otLosses: v.number(),
        shotsAgainst: v.number(),
        goalsAgainst: v.number(),
        saves: v.number(),
        savePct: v.number(),
        goalsAgainstAverage: v.number(),
        shutouts: v.number(),
        timeOnIce: v.number(),
        goals: v.optional(v.number()),
        assists: v.optional(v.number()),
        penaltyMinutes: v.optional(v.number()),
      }),
    ),
  },
  returns: upsertResult,
  handler: async (ctx, args) => {
    const allTeams = await seasonTeams(ctx, args.year)
    const teamMap = new Map(allTeams.map((t) => [t.short_name, t._id]))

    const existingGoalieStats = await ctx.db
      .query('goalieStats')
      .withIndex('year', (q) => q.eq('year', args.year))
      .take(2000)
    const existingMap = new Map(existingGoalieStats.map((s) => [s.playerId, s._id]))

    let inserted = 0
    let updated = 0

    for (const goalieStat of args.goalieStats) {
      // Handle goalies who played for multiple teams - take the last team
      const teamAbbrevRaw = goalieStat.teamAbbrevs.includes(',')
        ? goalieStat.teamAbbrevs.split(',').pop()
        : goalieStat.teamAbbrevs
      const teamAbbrev = teamAbbrevRaw?.trim()
      if (!teamAbbrev) {
        console.log(
          `Team abbreviation not found for goalie: ${goalieStat.firstName} ${goalieStat.lastName}`,
        )
        continue
      }
      const teamId = teamMap.get(teamAbbrev)

      if (!teamId) {
        throw new Error(`Team not found for season ${args.year}: ${goalieStat.teamAbbrevs}`)
      }

      const goalieStatsData = {
        playerId: goalieStat.playerId,
        firstName: goalieStat.firstName,
        lastName: goalieStat.lastName,
        searchName: `${goalieStat.firstName} ${goalieStat.lastName}`.toLowerCase(),
        team_id: teamId,
        year: args.year,
        gamesPlayed: goalieStat.gamesPlayed,
        gamesStarted: goalieStat.gamesStarted,
        wins: goalieStat.wins,
        losses: goalieStat.losses,
        otLosses: goalieStat.otLosses,
        shotsAgainst: goalieStat.shotsAgainst,
        goalsAgainst: goalieStat.goalsAgainst,
        saves: goalieStat.saves,
        savePct: goalieStat.savePct,
        goalsAgainstAverage: goalieStat.goalsAgainstAverage,
        shutouts: goalieStat.shutouts,
        timeOnIce: goalieStat.timeOnIce,
        goals: goalieStat.goals,
        assists: goalieStat.assists,
        penaltyMinutes: goalieStat.penaltyMinutes,
      }

      const existingId = existingMap.get(goalieStat.playerId)
      if (existingId) {
        await ctx.db.patch(existingId, goalieStatsData)
        updated++
      } else {
        const id = await ctx.db.insert('goalieStats', goalieStatsData)
        existingMap.set(goalieStat.playerId, id)
        inserted++
      }
    }

    return { inserted, updated }
  },
})
