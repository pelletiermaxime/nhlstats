import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

const DEFAULT_YEAR = 2026

export default defineMcpTool({
  name: 'nhl-player-details',
  description: 'Get detailed season statistics for a specific NHL player for a given year',
  inputSchema: {
    playerId: z.number().describe('NHL player ID (e.g., 8478402 for Connor McDavid)'),
    year: z.number().optional().describe('The season year (e.g., 2024, 2025, 2026). Defaults to current season')
  },
  handler: async ({ playerId, year }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetYear = year ?? DEFAULT_YEAR

    try {
      const player = await convexClient.query(api.playerStats.getPlayerById, {
        playerId,
        year: targetYear
      })

      if (!player) {
        return {
          content: [{
            type: 'text',
            text: `Player with ID ${playerId} not found for season ${targetYear}. Please verify the player ID.`
          }],
          isError: true
        }
      }

      const cleanPlayer = {
        playerId: player.playerId,
        name: `${player.firstName} ${player.lastName}`,
        position: player.positionCode,
        team: {
          name: player.team?.name || '',
          shortName: player.team?.short_name || '',
          city: player.team?.city || '',
        },
        season: {
          year: player.year,
          gamesPlayed: player.gamesPlayed,
          goals: player.goals,
          assists: player.assists,
          points: player.points,
          plusMinus: player.plusMinus,
          penaltyMinutes: player.penaltyMinutes,
          shots: player.shots,
          shootingPct: player.shootingPct,
          timeOnIcePerGame: player.timeOnIcePerGame,
          faceoffWinPct: player.faceoffWinPct,
        },
        scoring: {
          goals: player.goals,
          assists: player.assists,
          points: player.points,
          pointsPerGame: player.pointsPerGame,
          gameWinningGoals: player.gameWinningGoals,
          overtimeGoals: player.overtimeGoals,
          powerPlayGoals: player.powerPlayGoals,
          powerPlayPoints: player.powerPlayPoints,
          shorthandedGoals: player.shorthandedGoals,
          shorthandedPoints: player.shorthandedPoints,
        },
        advanced: {
          shots: player.shots,
          shootingPct: player.shootingPct,
          timeOnIcePerGame: player.timeOnIcePerGame,
          faceoffWinPct: player.faceoffWinPct,
        },
      }

      return jsonResult(cleanPlayer, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching player details for ID ${playerId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
