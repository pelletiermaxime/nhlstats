import { query } from './_generated/server'
import { v } from 'convex/values'
import schema from './schema'
import { teamDoc } from './lib/validators'
import { resolveSeasonYear, seasonTeams } from './lib/seasonData'

export const getTeams = query({
  args: { year: v.optional(v.number()) },
  returns: v.array(teamDoc),
  handler: async (ctx, args) => seasonTeams(ctx, await resolveSeasonYear(ctx, args.year)),
})

export const getTeamsByDivision = query({
  args: { year: v.optional(v.number()) },
  returns: v.record(v.string(), v.array(teamDoc)),
  handler: async (ctx, args) => {
    const teams = await seasonTeams(ctx, await resolveSeasonYear(ctx, args.year))
    const groups: Record<string, typeof teams> = {}
    for (const team of teams) {
      if (team.division_id) (groups[team.division_id] ??= []).push(team)
    }
    return groups
  },
})

export const getDivisions = query({
  args: { year: v.optional(v.number()) },
  returns: v.array(schema.doc('divisions')),
  handler: async (ctx, args) => {
    const teams = await seasonTeams(ctx, await resolveSeasonYear(ctx, args.year))
    const ids = [...new Set(teams.flatMap((team) => (team.division_id ? [team.division_id] : [])))]
    const divisions = await Promise.all(ids.map((id) => ctx.db.get(id)))
    return divisions.filter((division) => division !== null)
  },
})

export const getTeamByShortName = query({
  args: { shortName: v.string(), year: v.optional(v.number()) },
  returns: v.union(teamDoc, v.null()),
  handler: async (ctx, args) => {
    const year = await resolveSeasonYear(ctx, args.year)
    return ctx.db
      .query('teams')
      .withIndex('by_year_short_name', (q) =>
        q.eq('year', year).eq('short_name', args.shortName.toUpperCase()),
      )
      .unique()
  },
})

export const getTeamsByConference = query({
  args: { conference: v.optional(v.string()), year: v.optional(v.number()) },
  returns: v.array(teamDoc),
  handler: async (ctx, args) => {
    const year = await resolveSeasonYear(ctx, args.year)
    if (!args.conference) return seasonTeams(ctx, year)
    const divisions = await ctx.db
      .query('divisions')
      .withIndex('by_conference', (q) => q.eq('conference', args.conference!))
      .take(8)
    const groups = await Promise.all(
      divisions.map((division) =>
        ctx.db
          .query('teams')
          .withIndex('by_year_and_division_id', (q) =>
            q.eq('year', year).eq('division_id', division._id),
          )
          .take(32),
      ),
    )
    return groups.flat()
  },
})

export const getTeamsByDivisionName = query({
  args: { division: v.string(), year: v.optional(v.number()) },
  returns: v.array(teamDoc),
  handler: async (ctx, args) => {
    const year = await resolveSeasonYear(ctx, args.year)
    const division = await ctx.db
      .query('divisions')
      .withIndex('by_name', (q) => q.eq('name', args.division))
      .first()
    if (!division) return []
    return ctx.db
      .query('teams')
      .withIndex('by_year_and_division_id', (q) =>
        q.eq('year', year).eq('division_id', division._id),
      )
      .take(32)
  },
})
