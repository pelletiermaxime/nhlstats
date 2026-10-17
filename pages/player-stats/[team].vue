<template>
  <PlayerStatsTable
    v-model:search-query="searchQuery"
    :players="players"
    :selected-team-short-name="teamParam"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    :on-team-change="onTeamChange"
    :on-sort-change="onSortChange"
  />
</template>

<script setup lang="ts">
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'

type Teams = FunctionReturnType<typeof api.teams.getTeams>
type SortColumn =
  | 'gamesPlayed'
  | 'goals'
  | 'assists'
  | 'points'
  | 'plusMinus'
  | 'penaltyMinutes'
  | 'shots'
  | 'shootingPct'
type SortDirection = 'asc' | 'desc'

const route = useRoute('player-stats-team')
const router = useRouter()
const { year, withSeason } = useSeason()

useHead({
  title: 'Player Stats',
})

const teamParam = computed(() => route.params.team)
const sortBy = ref<SortColumn>('points')
const sortOrder = ref<SortDirection>('desc')
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 200)

const { data: teams } = await useConvexQuery(
  api.teams.getTeams,
  computed(() => ({ year: year.value })),
  { auth: 'none' },
)

const selectedTeamId = computed<Id<'teams'> | undefined>(() => {
  const team = teams.value?.find((t: Teams[number]) => t.short_name === teamParam.value)
  return team?._id
})

interface PlayerStatsArgs {
  year: number
  teamId: Id<'teams'>
  sortBy: SortColumn
  sortOrder: SortDirection
}

const queryArgs = computed<PlayerStatsArgs | 'skip'>(() =>
  selectedTeamId.value
    ? {
        year: year.value,
        teamId: selectedTeamId.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      }
    : 'skip',
)

const { data: teamPlayers } = await useConvexQuery(
  api.playerStats.getPlayerStatsWithTeamsByTeamSorted,
  queryArgs,
  { auth: 'none' },
)

const { data: searchResults } = await useConvexQuery(
  api.playerStats.searchPlayers,
  computed(() => ({
    query: debouncedSearchQuery.value,
    year: year.value,
    teamId: selectedTeamId.value,
    limit: 20,
  })),
  { auth: 'none' },
)

const players = computed(() => {
  if (debouncedSearchQuery.value.trim()) {
    return searchResults.value ?? []
  }
  return teamPlayers.value ?? []
})

function onTeamChange(value: string) {
  if (value) {
    router.push(withSeason(`/player-stats/${value}`))
  } else {
    router.push(withSeason('/player-stats'))
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}
</script>
