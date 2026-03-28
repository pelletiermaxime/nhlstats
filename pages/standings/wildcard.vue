<template>
  <div>
    <StandingsNav active="wildcard" />

    <div class="mb-8">
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Western Conference
      </h2>
      <WildcardTable :sections="westSections" />
    </div>

    <div>
      <h2 class="text-2xl font-bold text-center text-white mb-4">
        Eastern Conference
      </h2>
      <WildcardTable :sections="eastSections" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Standing, StandingWithStatus } from '~/types/teams'
import { api } from "~/convex/_generated/api"

definePageMeta({
  title: 'Standings - Wildcard'
})

const { data: standingsData } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)

const standings = computed<Standing[]>(() => {
  return standingsData.value ?? []
})

interface Section {
  title: string
  teams: StandingWithStatus[]
}

const buildWildcardSections = (teams: Standing[], divisions: string[]): Section[] => {
  const sortedTeams = [...teams].sort((a, b) => b.pts - a.pts)
  const divisionLeaders: Record<string, Standing[]> = {}

  for (const div of divisions) {
    const divTeams = sortedTeams.filter(t => t.division === div).slice(0, 3)
    divisionLeaders[div] = divTeams
  }

  const leadersSet = new Set(
    Object.values(divisionLeaders).flat().map(t => t.short_name)
  )

  const nonLeaders = sortedTeams.filter(t => !leadersSet.has(t.short_name))
  const wildcards = nonLeaders.slice(0, 2)
  const out = nonLeaders.slice(2)

  const sections: Section[] = []

  for (const div of divisions) {
    if (divisionLeaders[div]?.length) {
      sections.push({
        title: div,
        teams: divisionLeaders[div]!.map(t => ({ ...t, playoffStatus: 'division-leader' as const }))
      })
    }
  }

  if (wildcards.length) {
    sections.push({
      title: 'Wild Card',
      teams: wildcards.map(t => ({ ...t, playoffStatus: 'playoff-spot' as const }))
    })
  }

  if (out.length) {
    sections.push({
      title: 'Out of Playoffs',
      teams: out.map(t => ({ ...t, playoffStatus: 'out' as const }))
    })
  }

  return sections
}

const westSections = computed(() => {
  const westTeams = standings.value.filter(s => s.conference === 'WEST')
  return buildWildcardSections(westTeams, ['Central', 'Pacific'])
})

const eastSections = computed(() => {
  const eastTeams = standings.value.filter(s => s.conference === 'EAST')
  return buildWildcardSections(eastTeams, ['Atlantic', 'Metropolitan'])
})
</script>
