<template>
  <div class="bg-zinc-700 rounded-lg p-3 w-full max-w-xl">
    <!-- Header: Teams and Score -->
    <div class="flex items-center justify-between mb-2">
      <!-- Away -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <img
          :src="`/logos/SVG/${game.awayTeam?.short_name}.svg`"
          class="h-8 w-auto flex-shrink-0"
          :alt="`${game.awayTeam?.city} ${game.awayTeam?.name}`"
        >
        <span class="text-white font-semibold text-sm truncate">
          {{ game.awayTeam?.city }}
        </span>
      </div>

      <!-- Score -->
      <div class="flex items-center gap-2 px-2">
        <template v-if="hasScore">
          <span class="text-xl font-bold text-white">{{ game.awayScore ?? 0 }}</span>
          <span class="text-zinc-400">-</span>
          <span class="text-xl font-bold text-white">{{ game.homeScore ?? 0 }}</span>
        </template>
        <template v-else>
          <span class="text-xl text-zinc-400">@</span>
        </template>
      </div>

      <!-- Home -->
      <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span class="text-white font-semibold text-sm truncate">
          {{ game.homeTeam?.city }}
        </span>
        <img
          :src="`/logos/SVG/${game.homeTeam?.short_name}.svg`"
          class="h-8 w-auto flex-shrink-0"
          :alt="`${game.homeTeam?.city} ${game.homeTeam?.name}`"
        >
      </div>
    </div>

    <!-- Game State -->
    <div class="flex items-center justify-center gap-2 mb-2">
      <span class="text-xs px-2 py-0.5 rounded" :class="stateBadgeClass">
        {{ stateText }}
      </span>
      <span v-if="game.venue" class="text-zinc-500 text-xs truncate max-w-[150px]">
        {{ game.venue }}
      </span>
    </div>

    <!-- Real Goals by Period -->
    <div v-if="hasGoals" class="border-t border-zinc-600 pt-2">
      <div class="grid grid-cols-2 gap-2 text-xs">
        <!-- Away Goals -->
        <div class="space-y-0.5">
          <div class="text-zinc-400">
            1st: <span :class="getGoalsClass(1, 'away')">{{ formatGoals(1, 'away') }}</span>
          </div>
          <div class="text-zinc-400">
            2nd: <span :class="getGoalsClass(2, 'away')">{{ formatGoals(2, 'away') }}</span>
          </div>
          <div class="text-zinc-400">
            3rd: <span :class="getGoalsClass(3, 'away')">{{ formatGoals(3, 'away') }}</span>
          </div>
          <div
            v-for="period in otPeriods"
            :key="period"
            class="text-green-400 font-medium"
          >
            {{ formatOtLabel(period) }}: <span>{{ formatGoals(period, 'away') }}</span>
          </div>
        </div>
        <!-- Home Goals -->
        <div class="space-y-0.5 text-right">
          <div class="text-zinc-400">
            1st: <span :class="getGoalsClass(1, 'home')">{{ formatGoals(1, 'home') }}</span>
          </div>
          <div class="text-zinc-400">
            2nd: <span :class="getGoalsClass(2, 'home')">{{ formatGoals(2, 'home') }}</span>
          </div>
          <div class="text-zinc-400">
            3rd: <span :class="getGoalsClass(3, 'home')">{{ formatGoals(3, 'home') }}</span>
          </div>
          <div
            v-for="period in otPeriods"
            :key="period"
            class="text-green-400 font-medium"
          >
            {{ formatOtLabel(period) }}: <span>{{ formatGoals(period, 'home') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameWithTeams, EnrichedGoal } from '~/types/games'

const props = defineProps<{
  game: GameWithTeams
}>()

const hasScore = computed(() => {
  return props.game.gameState === 'LIVE' || props.game.gameState === 'FINAL'
})

const hasGoals = computed(() => {
  return props.game.goals && props.game.goals.length > 0
})

const awayTeamAbbrev = computed(() => props.game.awayTeam?.short_name ?? '')
const homeTeamAbbrev = computed(() => props.game.homeTeam?.short_name ?? '')

const otPeriods = computed(() => {
  if (!props.game.goals) return []
  const periods = new Set(props.game.goals.filter(g => g.period > 3).map(g => g.period))
  return Array.from(periods).sort((a, b) => a - b)
})

function getGoalsForPeriod(period: number, team: 'away' | 'home'): EnrichedGoal[] {
  if (!props.game.goals) return []
  const teamAbbrev = team === 'away' ? awayTeamAbbrev.value : homeTeamAbbrev.value
  return props.game.goals.filter(g => g.period === period && g.teamAbbrev === teamAbbrev)
}

function formatGoals(period: number, team: 'away' | 'home'): string {
  const goals = getGoalsForPeriod(period, team)
  if (goals.length === 0) return '—'
  return goals.map(g => {
    let s = `${g.timeInPeriod} ${g.lastName}`
    if (g.isEmptyNet) s += ' (EN)'
    return s
  }).join(', ')
}

function formatOtLabel(period: number): string {
  const otNum = period - 3
  return otNum === 1 ? 'OT' : `OT${otNum}`
}

function getGoalsClass(period: number, team: 'away' | 'home'): string {
  const goals = getGoalsForPeriod(period, team)
  return goals.length > 0 ? 'text-zinc-300' : 'text-zinc-500'
}

const stateBadgeClass = computed(() => {
  switch (props.game.gameState) {
  case 'LIVE':
    return 'bg-red-600 text-white animate-pulse'
  case 'FINAL':
    return 'bg-zinc-600 text-zinc-300'
  default:
    return 'bg-zinc-500 text-white'
  }
})

const stateText = computed(() => {
  switch (props.game.gameState) {
  case 'LIVE':
    if (props.game.period !== undefined) {
      const period = props.game.period
      let periodText: string
      if (period === 1) periodText = '1st'
      else if (period === 2) periodText = '2nd'
      else if (period === 3) periodText = '3rd'
      else {
        const otNum = period - 3
        periodText = otNum === 1 ? 'OT' : `OT${otNum}`
      }
      return `LIVE ${periodText}`
    }
    return 'LIVE'
  case 'FINAL':
    return 'FINAL'
  default:
    return formatTime(props.game.startTimeUTC)
  }
})

function formatTime(utcString: string): string {
  const date = new Date(utcString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short'
  })
}
</script>
