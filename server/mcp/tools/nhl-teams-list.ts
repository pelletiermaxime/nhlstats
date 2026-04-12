import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

interface Team {
  _id: Id<'teams'>
  short_name: string
  city: string
  name: string
  year: number
  division_id?: Id<'divisions'>
}

interface Division {
  _id: Id<'divisions'>
  name: string
  conference: string
}

interface CleanTeam {
  name: string
  city: string
  shortName: string
  division: string | null
  conference: string | null
}

export default defineMcpTool({
  name: 'nhl-teams-list',
  description: 'Get list of all NHL teams with optional filtering by conference or division',
  inputSchema: {
    conference: z.enum(['EAST', 'WEST']).optional().describe('Filter by conference: EAST or WEST'),
    division: z.string().optional().describe('Filter by division name (e.g., "Atlantic", "Metropolitan", "Central", "Pacific")')
  },
  handler: async ({ conference, division }) => {
    const runtimeConfig = useRuntimeConfig()
    const convexClient = new ConvexHttpClient(runtimeConfig.convex.url)

    try {
      let teams: Team[]

      if (division) {
        teams = await convexClient.query(api.teams.getTeamsByDivisionName, { division })
      } else if (conference) {
        teams = await convexClient.query(api.teams.getTeamsByConference, { conference })
      } else {
        teams = await convexClient.query(api.teams.getTeams)
      }

      const divisions = await convexClient.query(api.teams.getDivisions)
      const divisionMap = new Map<string, Division>(divisions.map((d: Division) => [d._id.toString(), d]))

      const cleanTeams: CleanTeam[] = teams.map((team: Team) => {
        const div = team.division_id ? divisionMap.get(team.division_id.toString()) : undefined

        return {
          name: team.name,
          city: team.city,
          shortName: team.short_name,
          division: div?.name || null,
          conference: div?.conference || null,
        }
      })

      const sortedTeams = cleanTeams.sort((a: CleanTeam, b: CleanTeam) => {
        if (a.conference === b.conference) {
          if (a.division === b.division) {
            return a.name.localeCompare(b.name)
          }
          return (a.division || '').localeCompare(b.division || '')
        }
        return (a.conference || '').localeCompare(b.conference || '')
      })

      return jsonResult({
        total: sortedTeams.length,
        conference: conference || null,
        division: division || null,
        teams: sortedTeams
      }, false)
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error fetching teams list: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      }
    }
  }
})
