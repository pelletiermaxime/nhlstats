import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

export default defineMcpTool({
  name: 'nhl-scores',
  description: 'Get NHL scores for a specific date',
  inputSchema: {
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Date in YYYY-MM-DD format (defaults to today)')
  },
  handler: async ({ date }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetDate = date ?? new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

    try {
      const [yearStr, monthStr] = targetDate.split('-')
      const year = Number(yearStr)
      const startYear = Number(monthStr) >= 7 ? year : year - 1
      const season = startYear * 10000 + (startYear + 1)

      const games = await convexClient.query(api.games.getGamesByDate, {
        date: targetDate,
        season
      })

      const cleanGames = games.map((game) => ({
        gameId: game.gameId,
        gameDate: game.gameDate,
        gameState: game.gameState,
        period: game.period,
        startTime: game.startTimeUTC,
        homeTeam: game.homeTeam
          ? { name: `${game.homeTeam.city} ${game.homeTeam.name}`, shortName: game.homeTeam.short_name, score: game.homeScore }
          : null,
        awayTeam: game.awayTeam
          ? { name: `${game.awayTeam.city} ${game.awayTeam.name}`, shortName: game.awayTeam.short_name, score: game.awayScore }
          : null,
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
