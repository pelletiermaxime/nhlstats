import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

const DEFAULT_YEAR = 2026
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

export default defineMcpTool({
  name: 'nhl-player-stats',
  description: 'Get NHL player statistics with optional filtering by team and sorting',
  inputSchema: {
    year: z.number().optional().describe('The season year (e.g., 2024, 2025, 2026). Defaults to current season'),
    team: z.string().optional().describe('Team short name to filter by (e.g., "MTL", "TOR", "NYR")'),
    sortBy: z.enum(['points', 'goals', 'assists']).optional().describe('Sort players by: points, goals, or assists. Defaults to points'),
    limit: z.number().optional().describe('Number of players to return (default 50, max 100)')
  },
  handler: async ({ year, team, sortBy, limit }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetYear = year ?? DEFAULT_YEAR
    const targetSortBy = sortBy ?? 'points'
    const targetLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT)

    try {
      let playerStats

      if (team) {
        const teamData = await convexClient.query(api.teams.getTeamByShortName, { shortName: team.toUpperCase() })

        if (!teamData) {
          return {
            content: [{
              type: 'text',
              text: `Team "${team}" not found. Please use a valid team short name (e.g., "MTL", "TOR", "NYR")`
            }],
            isError: true
          }
        }

        playerStats = await convexClient.query(api.playerStats.getPlayerStatsWithTeamsByTeamSorted, {
          year: targetYear,
          teamId: teamData._id,
          sortBy: targetSortBy,
          sortOrder: 'desc',
          limit: targetLimit
        })
      } else {
        playerStats = await convexClient.query(api.playerStats.getPlayerStatsWithTeamsSorted, {
          year: targetYear,
          sortBy: targetSortBy,
          sortOrder: 'desc',
          limit: targetLimit
        })
      }

      const cleanStats = playerStats.map((stat) => ({
        playerId: stat.playerId,
        name: `${stat.firstName} ${stat.lastName}`,
        position: stat.positionCode,
        team: {
          name: stat.team?.name || '',
          shortName: stat.team?.short_name || '',
        },
        gamesPlayed: stat.gamesPlayed,
        goals: stat.goals,
        assists: stat.assists,
        points: stat.points,
        plusMinus: stat.plusMinus,
        penaltyMinutes: stat.penaltyMinutes,
        shots: stat.shots,
        shootingPct: stat.shootingPct,
        timeOnIcePerGame: stat.timeOnIcePerGame,
        powerPlayGoals: stat.powerPlayGoals,
        powerPlayPoints: stat.powerPlayPoints,
        shorthandedGoals: stat.shorthandedGoals,
        gameWinningGoals: stat.gameWinningGoals,
      }))

      return jsonResult({
        year: targetYear,
        sortBy: targetSortBy,
        total: cleanStats.length,
        players: cleanStats
      }, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching player stats: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
