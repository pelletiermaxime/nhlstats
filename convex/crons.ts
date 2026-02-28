import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

const isDev = process.env.CONVEX_CLOUD_URL?.includes("ideal-peccary-58");

if (!isDev) {
  crons.hourly(
    "sync NHL standings",
    {
      minuteUTC: 0,
    },
    internal.standings.syncStandingsAction,
    { year: 2026 }
  );

  crons.daily(
    "sync NHL player stats",
    {
      hourUTC: 12,
      minuteUTC: 0,
    },
    internal.playerStats.syncPlayerStatsAction,
    { year: 2026, limit: -1 }
  );
}

export default crons;
