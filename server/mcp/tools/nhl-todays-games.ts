import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

export default defineMcpTool({
  name: 'nhl-todays-games',
  description: 'Get today\'s NHL games with scores and live status',
  inputSchema: {},
  handler: async () => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const today = new Date().toLocaleDateString('en-CA') as string

    try {
      const games = await convexClient.query(api.games.getGamesByDate, {
        date: today,
        season: 20252026
      })

      const liveGames = games.filter(g => g.gameState === 'LIVE')
      const scheduledGames = games.filter(g => g.gameState === 'SCHEDULED')
      const finalGames = games.filter(g => g.gameState === 'FINAL')

      const formatGame = (game: typeof games[0]) => ({
        gameId: game.gameId,
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
        }
      })

      return jsonResult({
        date: today,
        summary: {
          total: games.length,
          live: liveGames.length,
          scheduled: scheduledGames.length,
          final: finalGames.length
        },
        liveGames: liveGames.map(formatGame),
        upcomingGames: scheduledGames.map(formatGame),
        completedGames: finalGames.map(formatGame)
      }, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching today's games: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
