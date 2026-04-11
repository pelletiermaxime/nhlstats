<template>
  <div class="px-4 sm:px-0">
    <StandingsNav active="league" />

    <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <table
        id="tableOverall"
        class="w-full text-white table-fixed min-w-[900px]"
      >
        <thead>
          <tr class="text-sm">
            <th class="w-10 px-1 py-2">#</th>
            <th class="w-12 px-1 py-2">Team</th>
            <th class="w-16 px-1 py-2">Division</th>
            <th class="w-16 px-1 py-2">Conference</th>
            <th class="w-10 px-1 py-2">GP</th>
            <th class="w-10 px-1 py-2">W</th>
            <th class="w-10 px-1 py-2">L</th>
            <th class="w-10 px-1 py-2">OTL</th>
            <th class="w-10 px-1 py-2">PTS</th>
            <th class="w-10 px-1 py-2" title="Regular or Overtime Wins">ROW</th>
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
          <StatsBlock :standings="standings" :show-division="true" :show-conference="true" />
        </tbody>
      </table>
    </div>
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
