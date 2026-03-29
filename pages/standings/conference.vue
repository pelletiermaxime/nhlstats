<template>
  <div>
    <StandingsNav active="conference" />

    <div class="mb-8">
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Western Conference
      </h2>
      <table class="w-4/5 m-auto text-white">
        <thead>
          <tr>
            <th>Position</th>
            <th>Team</th>
            <th>GP</th>
            <th>W</th>
            <th>L</th>
            <th>OTL</th>
            <th>PTS</th>
            <th>ROW</th>
            <th>GF</th>
            <th>GA</th>
            <th>Diff</th>
            <th>Home</th>
            <th>Away</th>
            <th>L10</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          <StatsBlock :standings="westTeams" :show-conference="false" :show-division="false" />
        </tbody>
      </table>
    </div>

    <div>
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Eastern Conference
      </h2>
      <table class="w-4/5 m-auto text-white">
        <thead>
          <tr>
            <th>Position</th>
            <th>Team</th>
            <th>GP</th>
            <th>W</th>
            <th>L</th>
            <th>OTL</th>
            <th>PTS</th>
            <th>ROW</th>
            <th>GF</th>
            <th>GA</th>
            <th>Diff</th>
            <th>Home</th>
            <th>Away</th>
            <th>L10</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          <StatsBlock :standings="eastTeams" :show-conference="false" :show-division="false" />
        </tbody>
      </table>
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
