import type { Standing } from '~/types/teams'

export function useStandingsTransform(standingsData: Ref<{ team: { short_name: string, city: string, name: string } | null, division: { name: string, conference: string } | null }[] | null>) {
  return computed<Standing[]>(() => {
    if (!standingsData.value) return []

    return standingsData.value.map((item) => {
      const { team, division, ...stats } = item
      return {
        conference: division!.conference,
        short_name: team!.short_name,
        city: team!.city,
        name: team!.name,
        division: division!.name,
        ...stats,
      }
    })
  })
}
