<template>
  <PlayerStatsTable
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

definePageMeta({
  title: 'Player Stats'
})

const sortBy = ref<SortColumn>('points')
const sortOrder = ref<SortDirection>('desc')

const { data: allPlayers } = await useConvexQuery(
  api.playerStats.getPlayerStatsWithTeamsSorted,
  computed(() => ({
    year: 2026,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    limit: 100,
  }))
)

const players = computed(() => allPlayers.value ?? [])

function onTeamChange(value: string) {
  if (value) {
    router.push(`/player-stats/${value}`)
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}
</script>
