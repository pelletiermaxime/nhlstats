<template>
  <div>
    <table class="w-4/5 m-auto text-white">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Player</th>
          <th>Pos</th>
          <th>GP</th>
          <th>G</th>
          <th>A</th>
          <th>PTS</th>
          <th>+/-</th>
          <th>PIM</th>
          <th>S</th>
          <th>S%</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(player, index) in sortedPlayers"
          :key="player._id"
          class="odd:bg-zinc-700 text-center"
        >
          <td class="py-2 text-lg font-bold">{{ index + 1 }}</td>
          <td class="py-2">
            <img
              :src="`/logos/SVG/${player.team?.short_name}.svg`"
              class="h-8 mx-auto"
              :alt="`${player.team?.city} ${player.team?.name}`"
              :title="`${player.team?.city} ${player.team?.name}`"
            >
          </td>
          <td class="py-2">{{ player.firstName }} {{ player.lastName }}</td>
          <td class="py-2">{{ player.positionCode }}</td>
          <td class="py-2">{{ player.gamesPlayed }}</td>
          <td class="py-2">{{ player.goals }}</td>
          <td class="py-2">{{ player.assists }}</td>
          <td class="py-2 font-semibold">{{ player.points }}</td>
          <td class="py-2">{{ player.plusMinus > 0 ? '+' : '' }}{{ player.plusMinus }}</td>
          <td class="py-2">{{ player.penaltyMinutes }}</td>
          <td class="py-2">{{ player.shots }}</td>
          <td class="py-2">{{ (player.shootingPct * 100).toFixed(1) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { api } from "../convex/_generated/api"

definePageMeta({
  title: 'Player Stats'
})

const playerStatsQuery = useConvexQuery(api.playerStats.getTopPlayerStatsWithTeams, { year: 2026 })
await playerStatsQuery.suspense()

const sortedPlayers = computed(() => {
  const data = playerStatsQuery.data.value
  if (!data) return []
  return data
})
</script>
