<template>
  <GoalieStatsTable
    v-model:search-query="searchQuery"
    :goalies="goalies"
    :selected-team-short-name="''"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    :on-team-change="onTeamChange"
    :on-sort-change="onSortChange"
  />
</template>

<script setup lang="ts">
import { api } from '../../convex/_generated/api'

type SortColumn =
  | 'gamesPlayed'
  | 'wins'
  | 'losses'
  | 'otLosses'
  | 'savePct'
  | 'goalsAgainstAverage'
  | 'shutouts'
type SortDirection = 'asc' | 'desc'

const router = useRouter()
const { year, withSeason } = useSeason()

const sortBy = ref<SortColumn>('wins')
const sortOrder = ref<SortDirection>('desc')
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 200)

const { data: goaliesData } = await useConvexQuery(
  api.goalieStats.getGoalieStatsWithTeamsSorted,
  computed(() => ({
    year: year.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    limit: 100,
  })),
  { auth: 'none' },
)

const { data: searchResults } = await useConvexQuery(
  api.goalieStats.searchGoalies,
  computed(() => ({
    query: debouncedSearchQuery.value,
    year: year.value,
    limit: 20,
  })),
  { auth: 'none' },
)

const goalies = computed(() => {
  if (debouncedSearchQuery.value.trim()) {
    return searchResults.value ?? []
  }
  return goaliesData.value ?? []
})

function onTeamChange(value: string) {
  if (value) {
    router.push(withSeason(`/goalie-stats/${value}`))
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}

useHead({
  title: 'Goalie Stats',
})
</script>
