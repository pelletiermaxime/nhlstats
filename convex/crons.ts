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
}

export default crons;
