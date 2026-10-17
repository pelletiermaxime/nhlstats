import { v } from 'convex/values'
import { query, internalAction, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import schema from './schema'
import { currentSeason, seasonFromYear } from '../shared/utils/seasons'
import { syncPlayerSeason } from './playerStats'
import { syncGoalieSeason } from './goalieStats'
import { syncStandingSeason } from './standings'
import { syncSeasonSchedule } from './games'

export const getAvailableSeasons = query({
  args: {},
  returns: v.array(schema.doc('seasons')),
  handler: async (ctx) =>
    ctx.db
      .query('seasons')
      .withIndex('by_ready_and_year', (q) => q.eq('ready', true))
      .order('desc')
      .take(100),
})

export const upsertTeams = internalMutation({
  args: {
    year: v.number(),
    teams: v.array(
      v.object({
        short_name: v.string(),
        city: v.string(),
        name: v.string(),
        division: v.string(),
        conference: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    seasonFromYear(args.year)
    for (const team of args.teams) {
      let division = await ctx.db
        .query('divisions')
        .withIndex('by_name', (q) => q.eq('name', team.division))
        .first()
      if (!division) {
        const id = await ctx.db.insert('divisions', {
          name: team.division,
          conference: team.conference,
        })
        division = await ctx.db.get(id)
      }
      const existing = await ctx.db
        .query('teams')
        .withIndex('by_year_short_name', (q) =>
          q.eq('year', args.year).eq('short_name', team.short_name),
        )
        .unique()
      const record = {
        short_name: team.short_name,
        city: team.city,
        name: team.name,
        year: args.year,
        division_id: division!._id,
      }
      if (existing) await ctx.db.patch(existing._id, record)
      else await ctx.db.insert('teams', record)
    }
    return null
  },
})

export const markReady = internalMutation({
  args: { year: v.number(), lastGameDate: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const season = seasonFromYear(args.year)
    const existing = await ctx.db
      .query('seasons')
      .withIndex('by_year', (q) => q.eq('year', args.year))
      .unique()
    const record = {
      seasonId: season.id,
      year: season.year,
      label: season.label,
      lastGameDate: args.lastGameDate,
      ready: true,
      updatedAt: Date.now(),
    }
    if (existing) await ctx.db.patch(existing._id, record)
    else await ctx.db.insert('seasons', record)
    return null
  },
})

export const importSeason = internalAction({
  args: { year: v.number() },
  returns: v.object({
    year: v.number(),
    standings: v.number(),
    players: v.number(),
    goalies: v.number(),
    games: v.number(),
  }),
  handler: async (ctx, args) => {
    const standings = await syncStandingSeason(ctx, args.year)
    const players = await syncPlayerSeason(ctx, args.year)
    const goalies = await syncGoalieSeason(ctx, args.year)
    const games = await syncSeasonSchedule(ctx, args.year)
    await ctx.runMutation(internal.seasons.markReady, {
      year: args.year,
      lastGameDate: games.lastGameDate,
    })
    return {
      year: args.year,
      standings: standings.count,
      players: players.count,
      goalies: goalies.count,
      games: games.count,
    }
  },
})

export const refreshCurrentSeason = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const year = currentSeason().year
    await syncStandingSeason(ctx, year)
    await syncPlayerSeason(ctx, year)
    await syncGoalieSeason(ctx, year)
    const games = await syncSeasonSchedule(ctx, year)
    await ctx.runMutation(internal.seasons.markReady, { year, lastGameDate: games.lastGameDate })
    return null
  },
})
