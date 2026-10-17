import type { NhlSeason } from '~/shared/utils/seasons'
import {
  currentSeason,
  easternDate,
  parseSeasonId,
  scoresDateForSeason,
  seasonForDate,
  seasonFromYear,
} from '~/shared/utils/seasons'

export interface AvailableSeason extends NhlSeason {
  lastGameDate: string
}

export function useSeason() {
  const route = useRoute()
  const router = useRouter()
  const today = useState('nhl-today', () => easternDate())
  const defaultSeason = useState('nhl-current-season', () => currentSeason())
  const availableSeasons = useState<AvailableSeason[]>('nhl-available-seasons', () => [])
  const season = computed(() => {
    let id = parseSeasonId(route.query.season)
    if (
      !id &&
      route.path.startsWith('/scores/') &&
      'date' in route.params &&
      typeof route.params.date === 'string'
    ) {
      try {
        id = seasonForDate(route.params.date).id
      } catch {
        id = null
      }
    }
    if (!id) {
      return defaultSeason.value
    }
    return seasonFromYear(id % 10000)
  })
  const year = computed(() => season.value.year)
  const seasonId = computed(() => season.value.id)
  const isReady = computed(() => availableSeasons.value.some((item) => item.id === seasonId.value))

  function withSeason(path: string) {
    const explicit =
      parseSeasonId(route.query.season) !== null || seasonId.value !== defaultSeason.value.id
    return { path, query: explicit ? { season: String(seasonId.value) } : {} }
  }

  async function selectSeason(value: string) {
    const selected = availableSeasons.value.find((item) => item.id === parseSeasonId(value))
    if (!selected) return
    let path = route.path
    if (path === '/scores' || path.startsWith('/scores/')) {
      path = `/scores/${scoresDateForSeason(selected.id, selected.lastGameDate, today.value)}`
    }
    await router.push({ path, query: { ...route.query, season: String(selected.id) } })
  }

  return { season, seasonId, year, today, availableSeasons, isReady, withSeason, selectSeason }
}
