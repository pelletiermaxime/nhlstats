<template>
  <div>
    <StandingsNav active="league" />

    <table
      id="tableOverall"
      class="w-4/5 m-auto text-white table-fixed"
    >
      <thead>
        <tr>
          <th class="w-12">Position</th>
          <th class="w-16">Team</th>
          <th class="w-16">Division</th>
          <th class="w-16">Conference</th>
          <th class="w-10">GP</th>
          <th class="w-10">W</th>
          <th class="w-10">L</th>
          <th class="w-10">OTL</th>
          <th class="w-10">PTS</th>
          <th class="w-10" title="Regular or Overtime Wins">ROW</th>
          <th class="w-10">GF</th>
          <th class="w-10">GA</th>
          <th class="w-10">Diff</th>
          <th class="w-16">Home</th>
          <th class="w-16">Away</th>
          <th class="w-14">L10</th>
          <th class="w-12">Streak</th>
        </tr>
      </thead>
      <tbody>
        <StatsBlock :standings="standings" :show-division="true" :show-conference="true" />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'
import { api } from "~/convex/_generated/api"

definePageMeta({
  title: 'Standings - League'
})

const { data: standingsData } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)

const standings = computed<Standing[]>(() => {
  const data = standingsData.value ?? []
  return [...data].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (a.gp !== b.gp) return a.gp - b.gp
    if (b.row !== a.row) return b.row - a.row
    return b.w - a.w
  })
})
</script>
