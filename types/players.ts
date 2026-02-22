import type { Doc } from "../convex/_generated/dataModel";
import type { Team } from "./teams";

export type PlayerStats = Doc<"playerStats">;

export interface PlayerStatsWithTeam extends Omit<PlayerStats, "team_id"> {
  team?: Team | null;
}
