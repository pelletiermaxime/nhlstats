import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'

export default defineMcpTool({
  name: 'nhl-standings',
  description: 'Get the NHL standings for a given year',
  inputSchema: {
    year: z.number().describe('The year to fetch the standings for (e.g., 2023, 2024, 2026)')
  },
  handler: async ({ year }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    try {
      const result = await convexClient.query(api.standings.getStandingsWithTeams, { year })

      // Transform to clean format without internal IDs and metadata
      const cleanStandings = result.map((item) => ({
        year: item.year,
        gamesPlayed: item.gp,
        wins: item.w,
        losses: item.l,
        otLosses: item.otl,
        points: item.pts,
        row: item.row,
        goalFor: item.gf,
        goalAgainst: item.ga,
        goalDifferential: Number(item.diff),
        home: item.home,
        away: item.away,
        l10: item.l10,
        streak: item.streak,
        team: {
          name: item.name || '',
          city: item.city || '',
          shortName: item.short_name || '',
        },
        division: {
          name: item.division || '',
          conference: item.conference || '',
        },
      }))

      return jsonResult(cleanStandings, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching standings for year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      }
    }
  }
})
