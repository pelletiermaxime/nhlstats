<template>
  <div>
    <div class="w-4/5 mx-auto mb-4 flex items-center gap-4">
      <label for="team-filter" class="text-white font-semibold">Filter by Team:</label>
      <select
        id="team-filter"
        :value="selectedTeamShortName"
        class="bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-600 focus:outline-none focus:border-blue-500"
        @change="onTeamChange(($event.target as HTMLSelectElement).value)"
      >
        <option value="">All Teams</option>
        <option v-for="team in sortedTeams" :key="team._id" :value="team.short_name">
          {{ team.city }} {{ team.name }}
        </option>
      </select>
    </div>
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
          v-for="(player, index) in players"
          :key="player._id"
          class="odd:bg-zinc-700 text-center"
        >
          <td class="py-2 text-lg font-bold">{{ index + 1 }}</td>
          <td class="py-2">
            <NuxtLink :to="`/player-stats/${player.team?.short_name}`">
              <img
                :src="`/logos/SVG/${player.team?.short_name}.svg`"
                class="h-8 mx-auto cursor-pointer hover:scale-110 transition-transform"
                :alt="`${player.team?.city} ${player.team?.name}`"
                :title="`Click to filter by ${player.team?.city} ${player.team?.name}`"
              >
            </NuxtLink>
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
import type { PlayerStatsWithTeam } from '~/types/players'

defineProps<{
  players: PlayerStatsWithTeam[]
  selectedTeamShortName: string
  onTeamChange: (value: string) => void
}>()

const { data: teams } = await useConvexQuery(api.teams.getTeams, {})

const sortedTeams = computed(() => {
  const teamsList = teams.value ?? []
  return [...teamsList].sort((a, b) => a.city.localeCompare(b.city))
})
</script>
