<template>
  <div class="px-4 sm:px-0">
    <div class="w-full sm:w-4/5 sm:mx-auto mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <label for="team-filter" class="text-white font-semibold whitespace-nowrap">Filter by Team:</label>
        <select
          id="team-filter"
          :value="selectedTeamShortName"
          class="bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
          @change="onTeamChange(($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Teams</option>
          <option v-for="team in sortedTeams" :key="team._id" :value="team.short_name">
            {{ team.city }} {{ team.name }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label for="player-search" class="sr-only">Search players</label>
        <input
          id="player-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search players..."
          class="bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:outline-none focus:border-blue-500 w-full sm:w-64 placeholder-zinc-400 text-sm"
        >
      </div>
    </div>
    <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <table class="w-full text-white min-w-[600px]">
      <thead>
        <tr class="text-sm">
          <th class="px-1 py-2">#</th>
          <th class="px-1 py-2">Team</th>
          <th class="px-1 py-2 text-left">Player</th>
          <th class="px-1 py-2">Pos</th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('gamesPlayed')"
          >
            GP {{ sortIndicator('gamesPlayed') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('goals')"
          >
            G {{ sortIndicator('goals') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('assists')"
          >
            A {{ sortIndicator('assists') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('points')"
          >
            PTS {{ sortIndicator('points') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('plusMinus')"
          >
            +/- {{ sortIndicator('plusMinus') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('penaltyMinutes')"
          >
            PIM {{ sortIndicator('penaltyMinutes') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('shots')"
          >
            S {{ sortIndicator('shots') }}
          </th>
          <th
            class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
            @click="toggleSort('shootingPct')"
          >
            S% {{ sortIndicator('shootingPct') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(player, index) in players"
          :key="player._id"
          class="even:bg-zinc-600 text-center text-sm"
        >
          <td class="px-1 py-2 font-bold">{{ index + 1 }}</td>
          <td class="px-1 py-2">
            <NuxtLink :to="`/player-stats/${player.team?.short_name}`">
              <img
                :src="`/logos/SVG/${player.team?.short_name}.svg`"
                class="h-8 sm:h-10 mx-auto cursor-pointer hover:scale-110 transition-transform"
                :alt="`${player.team?.city} ${player.team?.name}`"
                :title="`Click to filter by ${player.team?.city} ${player.team?.name}`"
              >
            </NuxtLink>
          </td>
          <td class="px-1 py-2 text-left">{{ player.firstName }} {{ player.lastName }}</td>
          <td class="px-1 py-2">{{ player.positionCode }}</td>
          <td class="px-1 py-2">{{ player.gamesPlayed }}</td>
          <td class="px-1 py-2">{{ player.goals }}</td>
          <td class="px-1 py-2">{{ player.assists }}</td>
          <td class="px-1 py-2 font-semibold">{{ player.points }}</td>
          <td class="px-1 py-2">{{ player.plusMinus > 0 ? '+' : '' }}{{ player.plusMinus }}</td>
          <td class="px-1 py-2">{{ player.penaltyMinutes }}</td>
          <td class="px-1 py-2">{{ player.shots }}</td>
          <td class="px-1 py-2">{{ (player.shootingPct * 100).toFixed(1) }}%</td>
        </tr>
      </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from "../convex/_generated/api"
import type { PlayerStatsWithTeam } from '~/types/players'

type SortColumn = 'gamesPlayed' | 'goals' | 'assists' | 'points' | 'plusMinus' | 'penaltyMinutes' | 'shots' | 'shootingPct'
type SortDirection = 'asc' | 'desc'

const props = defineProps<{
  players: PlayerStatsWithTeam[]
  selectedTeamShortName: string
  sortBy: SortColumn
  sortOrder: SortDirection
  onTeamChange: (value: string) => void
  onSortChange: (column: SortColumn, direction: SortDirection) => void
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const { data: teams } = await useConvexQuery(api.teams.getTeams, {})

const sortedTeams = computed(() => {
  const teamsList = teams.value ?? []
  return [...teamsList].sort((a, b) => a.city.localeCompare(b.city))
})

function toggleSort(column: SortColumn) {
  let newDirection: SortDirection = 'desc'
  if (props.sortBy === column) {
    newDirection = props.sortOrder === 'asc' ? 'desc' : 'asc'
  }
  props.onSortChange(column, newDirection)
}

function sortIndicator(column: SortColumn): string {
  if (props.sortBy !== column) {
    return ''
  }
  return props.sortOrder === 'asc' ? '↑' : '↓'
}
</script>
