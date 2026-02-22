<template>
  <PlayerStatsTable
    :players="players"
    :selected-team-short-name="teamParam"
    :on-team-change="onTeamChange"
  />
</template>

<script setup lang="ts">
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import type { FunctionReturnType } from "convex/server"

type Teams = FunctionReturnType<typeof api.teams.getTeams>

const route = useRoute()
const router = useRouter()

definePageMeta({
  title: 'Player Stats'
})

const teamParam = computed(() => route.params.team as string)

const { data: teams } = await useConvexQuery(api.teams.getTeams, {})

const selectedTeamId = computed<Id<"teams"> | undefined>(() => {
  const team = teams.value?.find((t: Teams[number]) => t.short_name === teamParam.value)
  return team?._id
})

const { data: teamPlayers } = await useConvexQuery(
  api.playerStats.getPlayerStatsWithTeamsByTeam,
  computed(() => selectedTeamId.value ? { year: 2026, teamId: selectedTeamId.value } : 'skip')
)

const players = computed(() => teamPlayers.value ?? [])

function onTeamChange(value: string) {
  if (value) {
    router.push(`/player-stats/${value}`)
  } else {
    router.push('/player-stats')
  }
}
</script>
