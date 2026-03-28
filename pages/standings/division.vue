<template>
  <div>
    <StandingsNav active="division" />

    <div class="mb-8">
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Western Conference
      </h2>
      <GroupedStandings :grouped-standings="westDivisions" :show-division="false" :show-conference="false" />
    </div>

    <div>
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Eastern Conference
      </h2>
      <GroupedStandings :grouped-standings="eastDivisions" :show-division="false" :show-conference="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'
import { api } from "~/convex/_generated/api"

definePageMeta({
  title: 'Standings - Division'
})

const { data: standingsData } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)

const standings = computed<Standing[]>(() => {
  return standingsData.value ?? []
})

const standingsByDivision = computed(() => {
  const groups: Record<string, Standing[]> = {}
  for (const s of standings.value) {
    if (!s.division) continue
    if (!groups[s.division]) {
      groups[s.division] = []
    }
    groups[s.division]!.push(s)
  }
  for (const div in groups) {
    groups[div]!.sort((a, b) => b.pts - a.pts)
  }
  return groups
})

const getDivisions = (divisionNames: string[]) => {
  const result: Record<string, Standing[]> = {}
  for (const div of divisionNames) {
    if (standingsByDivision.value[div]) {
      result[div] = standingsByDivision.value[div]!
    }
  }
  return result
}

const westDivisions = computed(() => getDivisions(['Central', 'Pacific']))
const eastDivisions = computed(() => getDivisions(['Atlantic', 'Metropolitan']))
</script>
