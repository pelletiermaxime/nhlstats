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
        <label for="goalie-search" class="sr-only">Search goalies</label>
        <input
          id="goalie-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search goalies..."
          class="bg-zinc-700 text-white px-3 py-2 rounded-lg border border-zinc-600 focus:outline-none focus:border-blue-500 w-full sm:w-64 placeholder-zinc-400 text-sm"
        >
      </div>
    </div>
    <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <table class="w-full text-white min-w-[700px]">
        <thead>
          <tr class="text-sm">
            <th class="px-1 py-2">#</th>
            <th class="px-1 py-2">Team</th>
            <th class="px-1 py-2 text-left">Goalie</th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('gamesPlayed')"
            >
              GP {{ sortIndicator('gamesPlayed') }}
            </th>
            <th class="px-1 py-2">GS</th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('wins')"
            >
              W {{ sortIndicator('wins') }}
            </th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('losses')"
            >
              L {{ sortIndicator('losses') }}
            </th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('otLosses')"
            >
              OTL {{ sortIndicator('otLosses') }}
            </th>
            <th class="px-1 py-2">SA</th>
            <th class="px-1 py-2">GA</th>
            <th class="px-1 py-2">SV</th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('savePct')"
            >
              SV% {{ sortIndicator('savePct') }}
            </th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('goalsAgainstAverage')"
            >
              GAA {{ sortIndicator('goalsAgainstAverage') }}
            </th>
            <th
              class="cursor-pointer hover:text-blue-400 select-none px-1 py-2"
              @click="toggleSort('shutouts')"
            >
              SO {{ sortIndicator('shutouts') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(goalie, index) in goalies"
            :key="goalie._id"
            class="even:bg-zinc-600 text-center text-sm"
          >
            <td class="px-1 py-2 font-bold">{{ index + 1 }}</td>
            <td class="px-1 py-2">
              <NuxtLink
                v-if="goalie.team"
                :to="`/goalie-stats/${goalie.team.short_name}`"
              >
                <img
                  :src="`/logos/SVG/${goalie.team.short_name}.svg`"
                  class="h-8 sm:h-10 mx-auto cursor-pointer hover:scale-110 transition-transform"
                  :alt="`${goalie.team.city} ${goalie.team.name}`"
                  :title="`Click to filter by ${goalie.team.city} ${goalie.team.name}`"
                >
              </NuxtLink>
              <span v-else class="text-zinc-400">-</span>
            </td>
            <td class="px-1 py-2 text-left">{{ goalie.firstName }} {{ goalie.lastName }}</td>
            <td class="px-1 py-2">{{ goalie.gamesPlayed }}</td>
            <td class="px-1 py-2">{{ goalie.gamesStarted }}</td>
            <td class="px-1 py-2 font-semibold">{{ goalie.wins }}</td>
            <td class="px-1 py-2">{{ goalie.losses }}</td>
            <td class="px-1 py-2">{{ goalie.otLosses }}</td>
            <td class="px-1 py-2">{{ goalie.shotsAgainst }}</td>
            <td class="px-1 py-2">{{ goalie.goalsAgainst }}</td>
            <td class="px-1 py-2">{{ goalie.saves }}</td>
            <td class="px-1 py-2">{{ (goalie.savePct * 100).toFixed(1) }}%</td>
            <td class="px-1 py-2">{{ goalie.goalsAgainstAverage.toFixed(2) }}</td>
            <td class="px-1 py-2">{{ goalie.shutouts }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from "../convex/_generated/api"
import type { GoalieStatsWithTeam } from '~/types/goalies'

type SortColumn = 'gamesPlayed' | 'wins' | 'losses' | 'otLosses' | 'savePct' | 'goalsAgainstAverage' | 'shutouts'
type SortDirection = 'asc' | 'desc'

const props = defineProps<{
  goalies: GoalieStatsWithTeam[]
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
