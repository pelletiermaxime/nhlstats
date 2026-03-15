<template>
  <div>
    <table
      id="tableOverall"
      class="w-4/5 m-auto text-white"
    >
      <thead>
        <tr>
          <th>Position</th>
          <th>Team</th>
          <th>Division</th>
          <th>Conference</th>
          <th>GP</th>
          <th>W</th>
          <th>L</th>
          <th>OTL</th>
          <th>PTS</th>
          <th title="Regular or Overtime Wins">ROW</th>
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
        <StatsBlock :standings="standings" />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'
import { api } from "../convex/_generated/api";

definePageMeta({})

useHead({
  title: 'Standings'
})

const { data: standingsData } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)

const standings = computed<Standing[]>(() => {
  if (!standingsData.value) return []
  
  return standingsData.value.map((item) => {
    const { team, division, ...stats } = item
    return {
      conference: division!.conference,
      short_name: team!.short_name,
      city: team!.city,
      name: team!.name,
      division: division!.name,
      ...stats,
    }
  })
})
</script>
