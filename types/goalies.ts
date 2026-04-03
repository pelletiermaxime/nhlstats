import type { Doc } from "../convex/_generated/dataModel";
import type { Team } from "./teams";

export type GoalieStats = Doc<"goalieStats">;

export interface GoalieStatsWithTeam extends Omit<GoalieStats, "team_id"> {
  team?: Team | null;
}
