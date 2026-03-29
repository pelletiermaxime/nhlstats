<template>
  <PlayerStatsTable
    v-model:search-query="searchQuery"
    :players="players"
    :selected-team-short-name="''"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    :on-team-change="onTeamChange"
    :on-sort-change="onSortChange"
  />
</template>

<script setup lang="ts">
import { api } from "../../convex/_generated/api"

type SortColumn = 'gamesPlayed' | 'goals' | 'assists' | 'points' | 'plusMinus' | 'penaltyMinutes' | 'shots' | 'shootingPct'
type SortDirection = 'asc' | 'desc'

const router = useRouter()

const sortBy = ref<SortColumn>('points')
const sortOrder = ref<SortDirection>('desc')
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 200)

const { data: playersData } = await useConvexQuery(
  api.playerStats.getPlayerStatsWithTeamsSorted,
  computed(() => ({
    year: 2026,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    limit: 100,
  }))
)

const { data: searchResults } = await useConvexQuery(
  api.playerStats.searchPlayers,
  computed(() => ({
    query: debouncedSearchQuery.value,
    limit: 20,
  }))
)

const players = computed(() => {
  if (debouncedSearchQuery.value.trim()) {
    return searchResults.value ?? []
  }
  return playersData.value ?? []
})

function onTeamChange(value: string) {
  if (value) {
    router.push(`/player-stats/${value}`)
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}

useHead({
  title: 'Player Stats'
})
</script>
