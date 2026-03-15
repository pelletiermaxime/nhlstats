<template>
  <PlayerStatsTable
    :players="players"
    :selected-team-short-name="teamParam"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    :on-team-change="onTeamChange"
    :on-sort-change="onSortChange"
  />
</template>

<script setup lang="ts">
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import type { FunctionReturnType } from "convex/server"

type Teams = FunctionReturnType<typeof api.teams.getTeams>
type SortColumn = 'gamesPlayed' | 'goals' | 'assists' | 'points' | 'plusMinus' | 'penaltyMinutes' | 'shots' | 'shootingPct'
type SortDirection = 'asc' | 'desc'

const route = useRoute()
const router = useRouter()

definePageMeta({})

useHead({
  title: 'Player Stats'
})

const teamParam = computed(() => route.params.team as string)
const sortBy = ref<SortColumn>('points')
const sortOrder = ref<SortDirection>('desc')

const { data: teams } = await useConvexQuery(api.teams.getTeams, {})

const selectedTeamId = computed<Id<"teams"> | undefined>(() => {
  const team = teams.value?.find((t: Teams[number]) => t.short_name === teamParam.value)
  return team?._id
})

const { data: teamPlayers } = await useConvexQuery(
  api.playerStats.getPlayerStatsWithTeamsByTeamSorted,
  computed(() => selectedTeamId.value ? {
    year: 2026,
    teamId: selectedTeamId.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  } : 'skip')
)

const players = computed(() => teamPlayers.value ?? [])

function onTeamChange(value: string) {
  if (value) {
    router.push(`/player-stats/${value}`)
  } else {
    router.push('/player-stats')
  }
}

function onSortChange(column: SortColumn, direction: SortDirection) {
  sortBy.value = column
  sortOrder.value = direction
}
</script>
