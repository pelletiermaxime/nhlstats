<template>
  <GoalieStatsTable
    v-model:search-query="searchQuery"
    :goalies="goalies"
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
  | 'wins'
  | 'losses'
  | 'otLosses'
  | 'savePct'
  | 'goalsAgainstAverage'
  | 'shutouts'
type SortDirection = 'asc' | 'desc'

const route = useRoute('goalie-stats-team')
const router = useRouter()
const { year, withSeason } = useSeason()

useHead({
  title: 'Goalie Stats',
})

const teamParam = computed(() => route.params.team)
const sortBy = ref<SortColumn>('wins')
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

interface GoalieStatsArgs {
  year: number
  teamId: Id<'teams'>
  sortBy: SortColumn
  sortOrder: SortDirection
}

const queryArgs = computed<GoalieStatsArgs | 'skip'>(() =>
  selectedTeamId.value
    ? {
        year: year.value,
        teamId: selectedTeamId.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      }
    : 'skip',
)

const { data: teamGoalies } = await useConvexQuery(
  api.goalieStats.getGoalieStatsWithTeamsByTeamSorted,
  queryArgs,
  { auth: 'none' },
)

const { data: searchResults } = await useConvexQuery(
  api.goalieStats.searchGoalies,
  computed(() => ({
    query: debouncedSearchQuery.value,
    year: year.value,
    teamId: selectedTeamId.value,
    limit: 20,
  })),
  { auth: 'none' },
)

const goalies = computed(() => {
  if (debouncedSearchQuery.value.trim()) {
    return searchResults.value ?? []
  }
  return teamGoalies.value ?? []
})

function onTeamChange(value: string) {
  if (value) {
    router.push(withSeason(`/goalie-stats/${value}`))
  } else {
    router.push(withSeason('/goalie-stats'))
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}
</script>
