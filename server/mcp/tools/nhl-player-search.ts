import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export default defineMcpTool({
  name: 'nhl-player-search',
  description: 'Search for NHL players by name with optional team filtering',
  inputSchema: {
    query: z.string().describe('Player name to search for (e.g., "Connor McDavid", "Ovechkin", "Sidney")'),
    team: z.string().optional().describe('Team short name to filter by (e.g., "MTL", "TOR", "EDM")'),
    limit: z.number().optional().describe('Number of results to return (default 20, max 50)')
  },
  handler: async ({ query, team, limit }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT)

    try {
      let teamId = undefined

      if (team) {
        const teamData = await convexClient.query(api.teams.getTeamByShortName, { shortName: team.toUpperCase() })

        if (!teamData) {
          return {
            content: [{
              type: 'text',
              text: `Team "${team}" not found. Please use a valid team short name (e.g., "MTL", "TOR", "EDM")`
            }],
            isError: true
          }
        }

        teamId = teamData._id
      }

      const searchResults = await convexClient.query(api.playerStats.searchPlayers, {
        query,
        teamId,
        limit: targetLimit
      })

      const cleanResults = searchResults.map((stat) => ({
        playerId: stat.playerId,
        name: `${stat.firstName} ${stat.lastName}`,
        position: stat.positionCode,
        team: {
          name: stat.team?.name || '',
          shortName: stat.team?.short_name || '',
        },
        year: stat.year,
        gamesPlayed: stat.gamesPlayed,
        goals: stat.goals,
        assists: stat.assists,
        points: stat.points,
      }))

      return jsonResult({
        query,
        team: team || null,
        total: cleanResults.length,
        players: cleanResults
      }, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error searching for players: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
