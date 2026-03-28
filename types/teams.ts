import type { Doc } from "../convex/_generated/dataModel";

export type Team = Doc<"teams">;
export type Division = Doc<"divisions">;
export type StandingRecord = Doc<"standings">;

export type PlayoffStatus = 'division-leader' | 'playoff-spot' | 'out'

export interface Standing extends Omit<StandingRecord, "_id" | "_creationTime" | "team_id"> {
  conference: string | undefined
  short_name: string | undefined
  city: string | undefined
  name: string | undefined
  division: string | undefined
}

export interface StandingWithStatus extends Standing {
  playoffStatus: PlayoffStatus
}

export interface TeamsResponse {
  divisions: Division[]
  teams: Team[]
  teamsByDivision: Record<string, Team[]>
}
