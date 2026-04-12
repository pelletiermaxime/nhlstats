import { query, internalAction, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { v } from "convex/values";

interface NHLPlayerStats {
  playerId: number;
  skaterFullName: string;
  lastName: string;
  teamAbbrevs: string;
  positionCode: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  pointsPerGame: number;
  gameWinningGoals: number;
  overtimeGoals: number;
  otGoals: number;
  shots: number;
  shootingPct: number;
  timeOnIcePerGame: number;
  faceoffWinPct: number | null;
  evGoals: number;
  evPoints: number;
  ppGoals: number;
  ppPoints: number;
  shGoals: number;
  shPoints: number;
  shootsCatches: string;
}

export const getPlayerStatsWithTeamsByTeamSorted = query({
  args: {
    year: v.number(),
    teamId: v.id("teams"),
    sortBy: v.union(
      v.literal("gamesPlayed"),
      v.literal("goals"),
      v.literal("assists"),
      v.literal("points"),
      v.literal("plusMinus"),
      v.literal("penaltyMinutes"),
      v.literal("shots"),
      v.literal("shootingPct")
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const playerStats = await ctx.db
      .query("playerStats")
      .withIndex("year_team_id", (q) =>
        q.eq("year", args.year).eq("team_id", args.teamId)
      )
      .collect();

    const order = args.sortOrder ?? "desc";
    const sortKey = args.sortBy;

    const sortedStats = playerStats.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      return order === "asc" ? aValue - bValue : bValue - aValue;
    });

    const limitedStats = args.limit ? sortedStats.slice(0, args.limit) : sortedStats;

    const team = await ctx.db.get(args.teamId);

    return limitedStats.map((stat) => ({
      ...stat,
      team,
    }));
  },
});

export const searchPlayers = query({
  args: {
    query: v.string(),
    teamId: v.optional(v.id("teams")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.trim().toLowerCase();
    if (!searchQuery) {
      return [];
    }

    // Build search filter based on whether teamId is provided
    let playerStats;
    if (args.teamId) {
      playerStats = await ctx.db
        .query("playerStats")
        .withSearchIndex("search_players", (q) =>
          q.search("searchName", searchQuery).eq("team_id", args.teamId as Id<"teams">)
        )
        .take(args.limit ?? 20);
    } else {
      playerStats = await ctx.db
        .query("playerStats")
        .withSearchIndex("search_players", (q) =>
          q.search("searchName", searchQuery)
        )
        .take(args.limit ?? 20);
    }

    // Fetch teams for the results
    const teams = await ctx.db.query("teams").collect();
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

    return playerStats.map((stat) => {
      const team = teamMap.get(stat.team_id.toString());
      return {
        ...stat,
        team,
      };
    });
  },
});

export const getPlayerStatsWithTeamsSorted = query({
  args: {
    year: v.number(),
    sortBy: v.union(
      v.literal("gamesPlayed"),
      v.literal("goals"),
      v.literal("assists"),
      v.literal("points"),
      v.literal("plusMinus"),
      v.literal("penaltyMinutes"),
      v.literal("shots"),
      v.literal("shootingPct")
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const order = args.sortOrder ?? "desc";
    const limit = args.limit ?? 100;

    const query = ctx.db
      .query("playerStats")
      .withIndex(`year_${args.sortBy}`, (q) => q.eq("year", args.year))
      .order(order);

    const playerStats = await query.take(limit);

    const teams = await ctx.db.query("teams").collect();
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

    return playerStats.map((stat) => {
      const team = teamMap.get(stat.team_id.toString());
      return {
        ...stat,
        team,
      };
    });
  },
});

export const getPlayerById = query({
  args: {
    playerId: v.number(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const playerYear = args.year ?? 2026;

    const playerStat = await ctx.db
      .query("playerStats")
      .withIndex("year_playerId", (q) =>
        q.eq("year", playerYear).eq("playerId", args.playerId)
      )
      .first();

    if (!playerStat) {
      return null;
    }

    const team = await ctx.db.get(playerStat.team_id);

    return {
      ...playerStat,
      team,
    };
  },
});

export const syncPlayerStatsAction = internalAction({
  args: { year: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    const seasonId = "20252026";
    const gameTypeId = 2;
    const url = `https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&start=0&limit=${args.limit}&cayenneExp=gameTypeId=${gameTypeId}%20and%20seasonId=${seasonId}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch player stats: ${response.statusText}`);
    }

    const data = await response.json();
    const apiPlayerStats: NHLPlayerStats[] = data.data || [];

    const playerStats = apiPlayerStats.map((s) => {
      const lastName = s.lastName;
      const firstName = s.skaterFullName.replace(lastName, '').trim();

      return {
        playerId: s.playerId,
        firstName,
        lastName,
        teamAbbrevs: s.teamAbbrevs,
        positionCode: s.positionCode,
        gamesPlayed: s.gamesPlayed,
        goals: s.goals,
        assists: s.assists,
        points: s.points,
        plusMinus: s.plusMinus,
        penaltyMinutes: s.penaltyMinutes,
        pointsPerGame: s.pointsPerGame,
        gameWinningGoals: s.gameWinningGoals,
        overtimeGoals: s.otGoals,
        shots: s.shots,
        shootingPct: s.shootingPct ?? 0,
        timeOnIcePerGame: s.timeOnIcePerGame,
        faceoffWinPct: s.faceoffWinPct ?? 0,
        powerPlayGoals: s.ppGoals,
        powerPlayAssists: s.ppPoints - s.ppGoals,
        powerPlayPoints: s.ppPoints,
        shorthandedGoals: s.shGoals,
        shorthandedAssists: s.shPoints - s.shGoals,
        shorthandedPoints: s.shPoints,
      };
    });

    await ctx.runMutation(internal.playerStats.syncPlayerStats, {
      year: args.year,
      playerStats,
    });

    return { count: playerStats.length };
  },
});

export const syncPlayerStats = internalMutation({
  args: {
    year: v.number(),
    playerStats: v.array(
      v.object({
        playerId: v.number(),
        firstName: v.string(),
        lastName: v.string(),
        teamAbbrevs: v.string(),
        positionCode: v.string(),
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
    ),
  },
  handler: async (ctx, args) => {
    const allTeams = await ctx.db.query("teams").collect();
    const teamMap = new Map(allTeams.map((t) => [t.short_name, t._id]));

    const existingPlayerStats = await ctx.db
      .query("playerStats")
      .withIndex("year", (q) => q.eq("year", args.year))
      .collect();
    const existingMap = new Map(
      existingPlayerStats.map((s) => [s.playerId, s._id])
    );

    let inserted = 0;
    let updated = 0;

    for (const playerStat of args.playerStats) {
      // Handle players who played for multiple teams - take the last team
      const teamAbbrevRaw = playerStat.teamAbbrevs.includes(',')
        ? playerStat.teamAbbrevs.split(',').pop()
        : playerStat.teamAbbrevs;
      const teamAbbrev = teamAbbrevRaw?.trim();
      if (!teamAbbrev) {
        console.log(`Team abbreviation not found for player: ${playerStat.firstName} ${playerStat.lastName}`);
        continue;
      }
      const teamId = teamMap.get(teamAbbrev);

      if (!teamId) {
        console.log(`Team not found: ${playerStat.teamAbbrevs}`);
        continue;
      }

      const playerStatsData = {
        playerId: playerStat.playerId,
        firstName: playerStat.firstName,
        lastName: playerStat.lastName,
        searchName: `${playerStat.firstName} ${playerStat.lastName}`.toLowerCase(),
        team_id: teamId,
        positionCode: playerStat.positionCode,
        year: args.year,
        gamesPlayed: playerStat.gamesPlayed,
        goals: playerStat.goals,
        assists: playerStat.assists,
        points: playerStat.points,
        plusMinus: playerStat.plusMinus,
        penaltyMinutes: playerStat.penaltyMinutes,
        pointsPerGame: playerStat.pointsPerGame,
        gameWinningGoals: playerStat.gameWinningGoals,
        overtimeGoals: playerStat.overtimeGoals,
        shots: playerStat.shots,
        shootingPct: playerStat.shootingPct,
        timeOnIcePerGame: playerStat.timeOnIcePerGame,
        faceoffWinPct: playerStat.faceoffWinPct,
        powerPlayGoals: playerStat.powerPlayGoals,
        powerPlayAssists: playerStat.powerPlayAssists,
        powerPlayPoints: playerStat.powerPlayPoints,
        shorthandedGoals: playerStat.shorthandedGoals,
        shorthandedAssists: playerStat.shorthandedAssists,
        shorthandedPoints: playerStat.shorthandedPoints,
      };

      const existingId = existingMap.get(playerStat.playerId);
      if (existingId) {
        await ctx.db.patch(existingId, playerStatsData);
        updated++;
      } else {
        await ctx.db.insert("playerStats", playerStatsData);
        inserted++;
      }
    }

    return { inserted, updated };
  },
});
