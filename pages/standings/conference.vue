<template>
  <div class="px-4 sm:px-0">
    <StandingsNav active="conference" />

    <div class="mb-8">
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Western Conference
      </h2>
      <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table class="w-full text-white table-fixed min-w-[900px]">
          <thead>
            <tr class="text-sm">
              <th class="w-10 px-1 py-2">#</th>
              <th class="w-12 px-1 py-2">Team</th>
              <th class="w-10 px-1 py-2">GP</th>
              <th class="w-10 px-1 py-2">W</th>
              <th class="w-10 px-1 py-2">L</th>
              <th class="w-10 px-1 py-2">OTL</th>
              <th class="w-10 px-1 py-2">PTS</th>
              <th class="w-10 px-1 py-2">ROW</th>
              <th class="w-10 px-1 py-2">GF</th>
              <th class="w-10 px-1 py-2">GA</th>
              <th class="w-10 px-1 py-2">Diff</th>
              <th class="w-16 px-1 py-2">Home</th>
              <th class="w-16 px-1 py-2">Away</th>
              <th class="w-14 px-1 py-2">L10</th>
              <th class="w-12 px-1 py-2">Streak</th>
            </tr>
          </thead>
          <tbody>
            <StatsBlock :standings="westTeams" :show-conference="false" :show-division="false" />
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Eastern Conference
      </h2>
      <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table class="w-full text-white table-fixed min-w-[900px]">
          <thead>
            <tr class="text-sm">
              <th class="w-10 px-1 py-2">#</th>
              <th class="w-12 px-1 py-2">Team</th>
              <th class="w-10 px-1 py-2">GP</th>
              <th class="w-10 px-1 py-2">W</th>
              <th class="w-10 px-1 py-2">L</th>
              <th class="w-10 px-1 py-2">OTL</th>
              <th class="w-10 px-1 py-2">PTS</th>
              <th class="w-10 px-1 py-2">ROW</th>
              <th class="w-10 px-1 py-2">GF</th>
              <th class="w-10 px-1 py-2">GA</th>
              <th class="w-10 px-1 py-2">Diff</th>
              <th class="w-16 px-1 py-2">Home</th>
              <th class="w-16 px-1 py-2">Away</th>
              <th class="w-14 px-1 py-2">L10</th>
              <th class="w-12 px-1 py-2">Streak</th>
            </tr>
          </thead>
          <tbody>
            <StatsBlock :standings="eastTeams" :show-conference="false" :show-division="false" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'
import { api } from "~/convex/_generated/api"
import { compareStandings } from '~/utils/standings'

definePageMeta({
  title: 'Standings - Conference'
})

const { data: standingsData } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)

const standings = computed<Standing[]>(() => {
  return standingsData.value ?? []
})

const getTeamsByConference = (conference: string) => {
  return standings.value
    .filter(s => s.conference === conference)
    .sort(compareStandings)
}

const westTeams = computed(() => getTeamsByConference('WEST'))
const eastTeams = computed(() => getTeamsByConference('EAST'))
</script>
