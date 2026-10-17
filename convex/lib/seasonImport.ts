import type { ActionCtx } from '../_generated/server'
import type { NHLStanding } from '../standings'
import { internal } from '../_generated/api'
import { seasonFromYear } from '../../shared/utils/seasons'
import { fetchNhl } from './seasonData'

interface StandingSeason {
  id: number
  standingsStart: string
  standingsEnd: string
}

export async function prepareSeason(ctx: ActionCtx, year: number) {
  const season = seasonFromYear(year)
  const catalog = await fetchNhl<{ seasons: StandingSeason[] }>('standings-season')
  const source = catalog.seasons.find((item) => item.id === season.id)
  if (!source) throw new Error(`NHL season ${season.label} is not available`)
  const data = await fetchNhl<{ standings: NHLStanding[] }>(`standings/${source.standingsEnd}`)
  if (!data.standings.length || data.standings.some((item) => item.seasonId !== season.id)) {
    throw new Error(`Standings do not belong to season ${season.label}`)
  }
  await ctx.runMutation(internal.seasons.upsertTeams, {
    year,
    teams: data.standings.map((item) => ({
      short_name: item.teamAbbrev.default,
      city: item.teamName?.default.endsWith(` ${item.teamCommonName.default}`)
        ? item.teamName.default.slice(0, -(item.teamCommonName.default.length + 1))
        : item.placeName.default,
      name: item.teamCommonName.default,
      division: item.divisionName,
      conference: item.conferenceAbbrev === 'E' ? 'EAST' : 'WEST',
    })),
  })
  return {
    standings: data.standings,
    startDate: source.standingsStart,
    endDate: source.standingsEnd,
  }
}
