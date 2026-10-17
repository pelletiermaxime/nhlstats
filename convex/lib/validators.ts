import { v } from 'convex/values'
import schema from '../schema'

export const teamDoc = schema.doc('teams')
export const playerWithTeam = v.object({
  ...schema.doc('playerStats').fields,
  team: v.union(teamDoc, v.null()),
})
export const goalieWithTeam = v.object({
  ...schema.doc('goalieStats').fields,
  team: v.union(teamDoc, v.null()),
})
export const standingWithTeam = v.object({
  ...schema.doc('standings').fields,
  conference: v.optional(v.string()),
  short_name: v.optional(v.string()),
  city: v.optional(v.string()),
  name: v.optional(v.string()),
  division: v.optional(v.string()),
})
export const upsertResult = v.object({ inserted: v.number(), updated: v.number() })
export const countResult = v.object({ count: v.number() })
export const gameState = v.union(v.literal('SCHEDULED'), v.literal('LIVE'), v.literal('FINAL'))
export const goal = v.object({
  period: v.number(),
  timeInPeriod: v.string(),
  playerId: v.number(),
  lastName: v.string(),
  teamAbbrev: v.string(),
  isEmptyNet: v.optional(v.boolean()),
})
export const gameWithTeams = v.object({
  ...schema.doc('games').fields,
  gameState,
  homeTeam: v.union(teamDoc, v.null()),
  awayTeam: v.union(teamDoc, v.null()),
  goals: v.array(goal),
})
