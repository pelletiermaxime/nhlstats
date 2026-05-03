import { query, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

interface NHLGame {
  id: number;
  season: number;
  gameDate: string;
  startTimeUTC: string;
  gameState: string;
  periodDescriptor?: {
    number: number;
  };
  homeTeam: {
    id: number;
    abbrev: string;
    score?: number;
  };
  awayTeam: {
    id: number;
    abbrev: string;
    score?: number;
  };
  venue?: {
    default: string;
  };
  goals?: Array<{
    period: number;
    periodDescriptor?: {
      number: number;
      periodType?: string;
      maxRegulationPeriods?: number;
    };
    timeInPeriod: string;
    playerId: number;
    lastName?: {
      default?: string;
    };
    teamAbbrev?: string;
    goalModifier?: string;
  }>;
}

function mapGameState(state: string): "SCHEDULED" | "LIVE" | "FINAL" {
  if (["SCHEDULED", "PRE_GAME", "FUT"].includes(state)) return "SCHEDULED";
  if (["LIVE", "CRITICAL"].includes(state)) return "LIVE";
  return "FINAL";
}

export const getGamesByDate = query({
  args: {
    date: v.string(),
    season: v.number(),
  },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("season_date", (q) =>
        q.eq("season", args.season).eq("gameDate", args.date)
      )
      .collect();

    const teams = await ctx.db.query("teams").collect();
    const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

    return games.map((game) => ({
      ...game,
      gameState: game.gameState as "SCHEDULED" | "LIVE" | "FINAL",
      homeTeam: teamMap.get(game.homeTeam_id.toString()) ?? null,
      awayTeam: teamMap.get(game.awayTeam_id.toString()) ?? null,
      goals: game.goals || [],
    }));
  },
});

export const syncGamesAction = internalAction({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fetchDate = args.date ?? new Date()
      .toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    const url = `https://api-web.nhle.com/v1/score/${fetchDate}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let data: { games?: NHLGame[] };
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
      }
      data = await response.json();
    } finally {
      clearTimeout(timeout);
    }
    const games: NHLGame[] = Array.isArray(data?.games) ? data.games : [];

    await ctx.runMutation(internal.games.syncGames, {
      games: games.map((g) => ({
        gameId: g.id,
        gameDate: g.gameDate,
        season: g.season,
        homeTeamAbbrev: g.homeTeam.abbrev,
        awayTeamAbbrev: g.awayTeam.abbrev,
        homeScore: g.homeTeam.score,
        awayScore: g.awayTeam.score,
        gameState: mapGameState(g.gameState),
        period: g.periodDescriptor?.number,
        venue: g.venue?.default,
        startTimeUTC: g.startTimeUTC,
        goals: (g.goals || []).map((goal) => ({
          period: goal.periodDescriptor?.number ?? goal.period ?? 1,
          timeInPeriod: goal.timeInPeriod,
          playerId: goal.playerId,
          lastName: goal.lastName?.default ?? String(goal.playerId),
          teamAbbrev: goal.teamAbbrev ?? "",
          isEmptyNet: goal.goalModifier === "empty-net",
        })),
      })),
    });

    return { count: games.length };
  },
});

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
        gameState: v.string(),
        period: v.optional(v.number()),
        venue: v.optional(v.string()),
        startTimeUTC: v.string(),
        goals: v.array(
          v.object({
            period: v.number(),
            timeInPeriod: v.string(),
            playerId: v.number(),
            lastName: v.string(),
            teamAbbrev: v.string(),
            isEmptyNet: v.optional(v.boolean()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const seasonYear = args.games[0]?.season;
    if (!seasonYear) return { inserted: 0, updated: 0 };

    const allTeams = await ctx.db.query("teams").collect();
    const teamMap = new Map(allTeams.map((t) => [t.short_name, t._id]));

    const existingGames = await ctx.db
      .query("games")
      .withIndex("season", (q) => q.eq("season", seasonYear))
      .collect();
    const existingMap = new Map(existingGames.map((g) => [g.gameId, g._id]));

    let inserted = 0;
    let updated = 0;

    for (const game of args.games) {
      const homeTeamId = teamMap.get(game.homeTeamAbbrev);
      const awayTeamId = teamMap.get(game.awayTeamAbbrev);

      if (!homeTeamId || !awayTeamId) {
        console.log(
          `Team not found: ${game.homeTeamAbbrev} or ${game.awayTeamAbbrev}`
        );
        continue;
      }

      const gameData = {
        gameId: game.gameId,
        gameDate: game.gameDate,
        season: game.season,
        homeTeam_id: homeTeamId,
        awayTeam_id: awayTeamId,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        gameState: game.gameState,
        period: game.period,
        venue: game.venue,
        startTimeUTC: game.startTimeUTC,
        goals: game.goals,
      };

      const existingId = existingMap.get(game.gameId);
      if (existingId) {
        await ctx.db.patch(existingId, gameData);
        updated++;
      } else {
        await ctx.db.insert("games", gameData);
        inserted++;
      }
    }

    return { inserted, updated };
  },
});
