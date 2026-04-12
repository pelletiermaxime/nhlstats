import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    return teams;
  },
});

export const getTeamsByDivision = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const teamsByDivision: Record<string, typeof teams> = {};

    for (const team of teams) {
      if (team.division_id !== undefined) {
        const id = team.division_id.toString();
        if (!teamsByDivision[id]) {
          teamsByDivision[id] = [];
        }
        teamsByDivision[id]!.push(team);
      }
    }

    return teamsByDivision;
  },
});

export const getDivisions = query({
  args: {},
  handler: async (ctx) => {
    const divisions = await ctx.db.query("divisions").collect();
    return divisions;
  },
});

export const getTeamByShortName = query({
  args: { shortName: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_short_name", (q) => q.eq("short_name", args.shortName))
      .first();
    return team;
  },
});

export const getTeamsByConference = query({
  args: { conference: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let teams = await ctx.db.query("teams").collect();

    if (args.conference) {
      const divisions = await ctx.db.query("divisions").collect();
      const divisionIds = divisions
        .filter((d) => d.conference === args.conference)
        .map((d) => d._id.toString());

      teams = teams.filter((t) =>
        t.division_id && divisionIds.includes(t.division_id.toString())
      );
    }

    return teams;
  },
});

export const getTeamsByDivisionName = query({
  args: { division: v.string() },
  handler: async (ctx, args) => {
    const divisions = await ctx.db.query("divisions").collect();
    const division = divisions.find((d) => d.name === args.division);

    if (!division) {
      return [];
    }

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_division_id", (q) => q.eq("division_id", division._id))
      .collect();

    return teams;
  },
});
