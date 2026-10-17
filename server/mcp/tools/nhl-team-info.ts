import { z } from 'zod'
import { currentSeason } from '~/shared/utils/seasons'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

export default defineMcpTool({
  name: 'nhl-team-info',
  description:
    'Get detailed information about a specific NHL team including standings and all players',
  inputSchema: {
    team: z.string().describe('Team short name (e.g., "MTL", "TOR", "NYR")'),
    year: z
      .number()
      .optional()
      .describe('Season ending year (2026 means 2025–26). Defaults to the current season'),
  },
  handler: async ({ team, year }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    const targetYear = year ?? currentSeason().year

    try {
      const teamData = await convexClient.query(api.teams.getTeamByShortName, {
        shortName: team.toUpperCase(),
        year: targetYear,
      })

      if (!teamData) {
        return {
          content: [
            {
              type: 'text',
              text: `Team "${team}" not found. Please use a valid team short name (e.g., "MTL", "TOR", "NYR")`,
            },
          ],
          isError: true,
        }
      }

      let division = null
      if (teamData.division_id) {
        const divisions = await convexClient.query(api.teams.getDivisions, { year: targetYear })
        division = divisions.find((d: { _id: Id<'divisions'> }) => d._id === teamData.division_id)
      }

      const standings = await convexClient.query(api.standings.getStandingByTeamAndYear, {
        teamId: teamData._id,
        year: targetYear,
      })

      const allPlayers = await convexClient.query(
        api.playerStats.getPlayerStatsWithTeamsByTeamSorted,
        {
          year: targetYear,
          teamId: teamData._id,
          sortBy: 'points',
          sortOrder: 'desc',
        },
      )

      const cleanPlayers = allPlayers.map((stat) => ({
        playerId: stat.playerId,
        name: `${stat.firstName} ${stat.lastName}`,
        position: stat.positionCode,
        gamesPlayed: stat.gamesPlayed,
        goals: stat.goals,
        assists: stat.assists,
        points: stat.points,
        plusMinus: stat.plusMinus,
      }))

      const cleanStandings = standings
        ? {
            year: standings.year,
            gamesPlayed: standings.gp,
            wins: standings.w,
            losses: standings.l,
            otLosses: standings.otl,
            points: standings.pts,
            goalFor: standings.gf,
            goalAgainst: standings.ga,
            goalDifferential: Number(standings.diff),
            home: standings.home,
            away: standings.away,
            l10: standings.l10,
            streak: standings.streak,
          }
        : null

      return jsonResult(
        {
          team: {
            name: teamData.name,
            city: teamData.city,
            shortName: teamData.short_name,
          },
          division: division
            ? {
                name: division.name,
                conference: division.conference,
              }
            : null,
          standings: cleanStandings,
          players: cleanPlayers,
        },
        false,
      )
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching team info for "${team}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      }
    }
  },
})
