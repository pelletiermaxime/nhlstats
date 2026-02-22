<template>
  <PlayerStatsTable
    :players="players"
    :selected-team-short-name="''"
    :on-team-change="onTeamChange"
  />
</template>

<script setup lang="ts">
import { api } from "../../convex/_generated/api"

const router = useRouter()

definePageMeta({
  title: 'Player Stats'
})

const { data: allPlayers } = await useConvexQuery(
  api.playerStats.getTopPlayerStatsWithTeams,
  { year: 2026 }
)

const players = computed(() => allPlayers.value ?? [])

function onTeamChange(value: string) {
  if (value) {
    router.push(`/player-stats/${value}`)
  }
}
</script>
