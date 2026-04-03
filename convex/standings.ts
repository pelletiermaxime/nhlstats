import { query, internalAction, internalMutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

interface NHLStanding {
  teamCommonName: { default: string };
  gamesPlayed: number;
  wins: number;
  losses: number;
  regulationPlusOtWins: number;
  otLosses: number;
  points: number;
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;
  homeWins: number;
  homeLosses: number;
  homeOtLosses: number;
  roadWins: number;
  roadLosses: number;
  roadOtLosses: number;
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  streakCode: string;
  streakCount: number;
}

export const getStandingsByYear = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const standings = await ctx.db
      .query("standings")
      .withIndex("year", (q) => q.eq("year", args.year))
      .collect();
    return standings;
  },
});

async function fetchStandingsWithTeams(ctx: QueryCtx, year: number) {
  const standings = await ctx.db
    .query("standings")
    .withIndex("year", (q) => q.eq("year", year))
    .collect();

  const teams = await ctx.db.query("teams").collect();
  const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

  const divisions = await ctx.db.query("divisions").collect();
  const divisionMap = new Map(divisions.map((d) => [d._id.toString(), d]));

  return standings.map((standing) => {
    const team = teamMap.get(standing.team_id.toString());
    const division = team?.division_id
      ? divisionMap.get(team.division_id.toString())
      : null;

    return {
      ...standing,
      conference: division?.conference,
      short_name: team?.short_name,
      city: team?.city,
      name: team?.name,
      division: division?.name,
    };
  });
}

export const getStandingsWithTeams = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    return fetchStandingsWithTeams(ctx, args.year);
  },
});

export const getCurrentStandingsWithTeams = query({
  args: {},
  handler: async (ctx) => {
    return fetchStandingsWithTeams(ctx, 2026);
  },
});

export const getStandingByTeamAndYear = query({
  args: { teamId: v.id("teams"), year: v.number() },
  handler: async (ctx, args) => {
    const standing = await ctx.db
      .query("standings")
      .withIndex("year_team", (q) =>
        q.eq("year", args.year).eq("team_id", args.teamId)
      )
      .first();
    return standing;
  },
});

export const syncStandingsAction = internalAction({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api-web.nhle.com/v1/standings/${today}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.statusText}`);
    }

    const data = await response.json();
    const apiStandings: NHLStanding[] = data.standings;

    const standings = apiStandings.map((s) => ({
      teamCommonName: { default: s.teamCommonName.default },
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      regulationPlusOtWins: s.regulationPlusOtWins,
      otLosses: s.otLosses,
      points: s.points,
      goalFor: s.goalFor,
      goalAgainst: s.goalAgainst,
      goalDifferential: s.goalDifferential,
      homeWins: s.homeWins,
      homeLosses: s.homeLosses,
      homeOtLosses: s.homeOtLosses,
      roadWins: s.roadWins,
      roadLosses: s.roadLosses,
      roadOtLosses: s.roadOtLosses,
      l10Wins: s.l10Wins,
      l10Losses: s.l10Losses,
      l10OtLosses: s.l10OtLosses,
      streakCode: s.streakCode,
      streakCount: s.streakCount,
    }));

    await ctx.runMutation(internal.standings.syncStandings, {
      year: args.year,
      standings,
    });

    return { count: standings.length };
  },
});

export const syncStandings = internalMutation({
  args: {
    year: v.number(),
    standings: v.array(
      v.object({
        teamCommonName: v.object({ default: v.string() }),
        gamesPlayed: v.number(),
        wins: v.number(),
        losses: v.number(),
        regulationPlusOtWins: v.number(),
        otLosses: v.number(),
        points: v.number(),
        goalFor: v.number(),
        goalAgainst: v.number(),
        goalDifferential: v.number(),
        homeWins: v.number(),
        homeLosses: v.number(),
        homeOtLosses: v.number(),
        roadWins: v.number(),
        roadLosses: v.number(),
        roadOtLosses: v.number(),
        l10Wins: v.number(),
        l10Losses: v.number(),
        l10OtLosses: v.number(),
        streakCode: v.string(),
        streakCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const allTeams = await ctx.db.query("teams").collect();
    const teamMap = new Map(allTeams.map((t) => [t.name, t._id]));

    const existingStandings = await ctx.db
      .query("standings")
      .withIndex("year", (q) => q.eq("year", args.year))
      .collect();
    const existingMap = new Map(
      existingStandings.map((s) => [s.team_id.toString(), s._id])
    );

    for (const standing of args.standings) {
      const teamName = standing.teamCommonName.default;
      const teamId = teamMap.get(teamName);

      if (!teamId) {
        console.log(`Team not found: ${teamName}`);
        continue;
      }

      const home = `${standing.homeWins}-${standing.homeLosses}-${standing.homeOtLosses}`;
      const away = `${standing.roadWins}-${standing.roadLosses}-${standing.roadOtLosses}`;
      const l10 = `${standing.l10Wins}-${standing.l10Losses}-${standing.l10OtLosses}`;
      const streak = `${standing.streakCode}${standing.streakCount}`;

      const standingData = {
        team_id: teamId,
        year: args.year,
        gp: standing.gamesPlayed,
        w: standing.wins,
        l: standing.losses,
        otl: standing.otLosses,
        pts: standing.points,
        row: standing.regulationPlusOtWins,
        gf: standing.goalFor,
        ga: standing.goalAgainst,
        diff: String(standing.goalDifferential),
        home,
        away,
        l10,
        streak,
      };

      const existingId = existingMap.get(teamId.toString());
      if (existingId) {
        await ctx.db.patch(existingId, standingData);
      } else {
        await ctx.db.insert("standings", standingData);
      }
    }

    return { updated: args.standings.length };
  },
});
