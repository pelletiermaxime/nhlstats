import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.string(),
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"]),

  teams: defineTable({
    short_name: v.string(),
    city: v.string(),
    name: v.string(),
    year: v.number(),
    division_id: v.optional(v.id("divisions")),
  }).index("by_division_id", ["division_id"]),

  divisions: defineTable({
    name: v.string(),
    conference: v.string(),
  }),

  standings: defineTable({
    team_id: v.id("teams"),
    year: v.number(),
    gp: v.number(),
    w: v.number(),
    l: v.number(),
    otl: v.number(),
    pts: v.number(),
    row: v.number(),
    gf: v.number(),
    ga: v.number(),
    ppp: v.optional(v.number()),
    pkp: v.optional(v.number()),
    home: v.string(),
    away: v.string(),
    l10: v.string(),
    diff: v.string(),
    streak: v.string(),
    ppg: v.optional(v.number()),
    ppo: v.optional(v.number()),
    ppga: v.optional(v.number()),
    ppoa: v.optional(v.number()),
    positionOverall: v.optional(v.number()),
    positionConference: v.optional(v.number()),
  })
    .index("team_id", ["team_id"])
    .index("year", ["year"])
    .index("year_team", ["year", "team_id"]),

  playerStats: defineTable({
    playerId: v.number(),
    firstName: v.string(),
    lastName: v.string(),
    searchName: v.string(), // Combined first + last name for search
    team_id: v.id("teams"),
    positionCode: v.string(),
    year: v.number(),
    gamesPlayed: v.number(),
    goals: v.number(),
    assists: v.number(),
    points: v.number(),
    plusMinus: v.number(),
    penaltyMinutes: v.number(),
    pointsPerGame: v.number(),
    gameWinningGoals: v.number(),
    overtimeGoals: v.number(),
    shots: v.number(),
    shootingPct: v.number(),
    timeOnIcePerGame: v.number(),
    faceoffWinPct: v.number(),
    powerPlayGoals: v.number(),
    powerPlayAssists: v.number(),
    powerPlayPoints: v.number(),
    shorthandedGoals: v.number(),
    shorthandedAssists: v.number(),
    shorthandedPoints: v.number(),
  })
    .index("playerId", ["playerId"])
    .index("year", ["year"])
    .index("year_playerId", ["year", "playerId"])
    .index("year_team_id", ["year", "team_id"])
    .index("year_points", ["year", "points"])
    .index("year_gamesPlayed", ["year", "gamesPlayed"])
    .index("year_goals", ["year", "goals"])
    .index("year_assists", ["year", "assists"])
    .index("year_plusMinus", ["year", "plusMinus"])
    .index("year_penaltyMinutes", ["year", "penaltyMinutes"])
    .index("year_shots", ["year", "shots"])
    .index("year_shootingPct", ["year", "shootingPct"])
    .searchIndex("search_players", {
      searchField: "searchName",
      filterFields: ["team_id"],
    }),

  goalieStats: defineTable({
    playerId: v.number(),
    firstName: v.string(),
    lastName: v.string(),
    searchName: v.string(), // Combined first + last name for search
    team_id: v.id("teams"),
    year: v.number(),
    // Games
    gamesPlayed: v.number(),
    gamesStarted: v.number(),
    // Record
    wins: v.number(),
    losses: v.number(),
    otLosses: v.number(),
    // Stats
    shotsAgainst: v.number(),
    goalsAgainst: v.number(),
    saves: v.number(),
    savePct: v.number(),
    goalsAgainstAverage: v.number(),
    shutouts: v.number(),
    // Time
    timeOnIce: v.number(), // in minutes
    // Additional
    goals: v.optional(v.number()),
    assists: v.optional(v.number()),
    penaltyMinutes: v.optional(v.number()),
  })
    .index("playerId", ["playerId"])
    .index("year", ["year"])
    .index("year_playerId", ["year", "playerId"])
    .index("year_team_id", ["year", "team_id"])
    .index("year_gamesPlayed", ["year", "gamesPlayed"])
    .index("year_wins", ["year", "wins"])
    .index("year_losses", ["year", "losses"])
    .index("year_otLosses", ["year", "otLosses"])
    .index("year_savePct", ["year", "savePct"])
    .index("year_goalsAgainstAverage", ["year", "goalsAgainstAverage"])
    .index("year_shutouts", ["year", "shutouts"])
    .searchIndex("search_goalies", {
      searchField: "searchName",
      filterFields: ["team_id"],
    }),
});
