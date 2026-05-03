import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

const isDev = process.env.CONVEX_CLOUD_URL?.includes("ideal-peccary-58");

if (!isDev) {
  crons.interval(
    "sync NHL standings",
    { hours: 1 },
    internal.standings.syncStandingsAction,
    { year: 2026 }
  );

  crons.cron(
    "sync NHL player stats",
    "0 12 * * *",
    internal.playerStats.syncPlayerStatsAction,
    { year: 2026, limit: -1 }
  );

  crons.cron(
    "sync NHL goalie stats",
    "22 11 * * *",
    internal.goalieStats.syncGoalieStatsAction,
    { year: 2026, limit: -1 }
  );

  // Evening games — every 5 min from 22:00 to 03:59 UTC (18:00 to 23:59 ET)
  crons.cron(
    "sync NHL games evening",
    "*/5 22-23 * * *",
    internal.games.syncGamesAction,
    {}
  );

  // Late west-coast games — every 5 min from 04:00 to 05:59 UTC (00:00 to 01:59 ET)
  crons.cron(
    "sync NHL games late night",
    "*/5 4-5 * * *",
    internal.games.syncGamesAction,
    {}
  );

  // Weekend afternoon games — every 5 min from 17:00 to 21:59 UTC on Sat & Sun (13:00 to 17:59 ET)
  crons.cron(
    "sync NHL games weekend afternoon",
    "*/5 17-21 * * 0,6",
    internal.games.syncGamesAction,
    {}
  );

  // Daily morning fetch for future games / schedule changes
  crons.cron(
    "sync NHL games morning",
    "0 5 * * *",
    internal.games.syncGamesAction,
    {}
  );
}

export default crons;
