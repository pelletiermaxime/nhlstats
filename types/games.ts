import type { Doc } from "../convex/_generated/dataModel";
import type { Team } from "./teams";

export type GameRecord = Doc<"games">;

export type GameState = "SCHEDULED" | "LIVE" | "FINAL";

// Goal data stored inline on games (matches API response)
export interface EnrichedGoal {
  period: number;
  timeInPeriod: string;
  playerId: number;
  lastName: string;
  teamAbbrev: string;
  isEmptyNet?: boolean;
}

export interface GameWithTeams {
  _id: string;
  _creationTime: number;
  gameId: number;
  gameDate: string;
  season: number;
  homeScore?: number;
  awayScore?: number;
  gameState: GameState;
  period?: number;
  timeRemaining?: string;
  venue?: string;
  startTimeUTC: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  goals: EnrichedGoal[];
}
