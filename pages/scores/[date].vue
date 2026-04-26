<template>
  <div class="px-4 sm:px-0">
    <div class="w-full sm:w-4/5 sm:mx-auto mb-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-white">
          Scores
        </h1>

        <div class="flex items-center gap-2">
          <button
            class="p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            title="Previous day"
            @click="goToPreviousDay"
          >
            <span class="i-mdi-chevron-left block w-6 h-6" />
          </button>

          <div class="relative">
            <input
              id="date-picker"
              :value="selectedDate"
              type="date"
              class="bg-zinc-700 text-white px-3 py-2 pr-10 rounded-lg border border-zinc-600 focus:outline-none focus:border-blue-500 text-sm appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              @change="onDateChange"
            >
            <span class="i-mdi-calendar absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
          </div>

          <button
            class="p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            title="Next day"
            @click="goToNextDay"
          >
            <span class="i-mdi-chevron-right block w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <div class="w-full sm:w-4/5 sm:mx-auto">
      <h2 class="text-lg font-semibold text-white mb-4">
        {{ formattedDate }}
      </h2>

      <!-- Live Games -->
      <div v-if="liveGames.length > 0" class="mb-6">
        <h3 class="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 text-center">
          Live Games
        </h3>
        <div class="flex flex-wrap gap-3 justify-center">
          <GameCard
            v-for="game in liveGames"
            :key="game._id"
            :game="game"
          />
        </div>
      </div>

      <!-- Completed Games -->
      <div v-if="finalGames.length > 0" class="mb-6">
        <h3 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
          Final
        </h3>
        <div class="flex flex-wrap gap-3 justify-center">
          <GameCard
            v-for="game in finalGames"
            :key="game._id"
            :game="game"
          />
        </div>
      </div>

      <!-- Upcoming Games -->
      <div v-if="scheduledGames.length > 0">
        <h3 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
          Upcoming
        </h3>
        <div class="flex flex-wrap gap-3 justify-center">
          <GameCard
            v-for="game in scheduledGames"
            :key="game._id"
            :game="game"
          />
        </div>
      </div>

      <!-- No Games -->
      <div v-if="allGames.length === 0" class="text-center text-zinc-400 py-8">
        No games scheduled for this date
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from "~/convex/_generated/api"

definePageMeta({
  title: 'Scores'
})

const route = useRoute()
const router = useRouter()

const selectedDate = computed(() => route.params.date as string)

function navigateToDate(date: string) {
  router.push(`/scores/${date}`)
}

function goToPreviousDay() {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  date.setDate(date.getDate() - 1)
  navigateToDate(date.toLocaleDateString('en-CA'))
}

function goToNextDay() {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  date.setDate(date.getDate() + 1)
  navigateToDate(date.toLocaleDateString('en-CA'))
}

function onDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.value) {
    navigateToDate(target.value)
  }
}

const queryArgs = computed(() => ({
  date: selectedDate.value,
  season: 20252026,
}))

const { data: games } = await useConvexQuery(
  api.games.getGamesByDate,
  queryArgs
)

const allGames = computed(() => games.value ?? [])

const liveGames = computed(() =>
  allGames.value.filter((g) => g.gameState === 'LIVE')
)

const finalGames = computed(() =>
  allGames.value.filter((g) => g.gameState === 'FINAL')
)

const scheduledGames = computed(() =>
  allGames.value.filter((g) => g.gameState === 'SCHEDULED')
)

const isHydrated = ref(false)

const formattedDate = computed(() => {
  if (!isHydrated.value) {
    return selectedDate.value
  }
  const date = new Date(`${selectedDate.value}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

onMounted(() => {
  isHydrated.value = true
})
</script>
