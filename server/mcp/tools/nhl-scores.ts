import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

export default defineMcpTool({
  name: 'nhl-scores',
  description: 'Get NHL scores for a specific date',
  inputSchema: {
    date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)')
  },
  handler: async ({ date }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetDate = date || new Date().toLocaleDateString('en-CA') as string

    try {
      const games = await convexClient.query(api.games.getGamesByDate, {
        date: targetDate,
        season: 20252026
      })

      const cleanGames = games.map((game) => ({
        gameId: game.gameId,
        gameDate: game.gameDate,
        gameState: game.gameState,
        period: game.period,
        startTime: game.startTimeUTC,
        homeTeam: {
          name: `${game.homeTeam?.city} ${game.homeTeam?.name}`,
          shortName: game.homeTeam?.short_name,
          score: game.homeScore
        },
        awayTeam: {
          name: `${game.awayTeam?.city} ${game.awayTeam?.name}`,
          shortName: game.awayTeam?.short_name,
          score: game.awayScore
        },
        venue: game.venue
      }))

      return jsonResult(cleanGames, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching scores for ${targetDate}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
