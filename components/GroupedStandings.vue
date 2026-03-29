<template>
  <div>
    <div
      v-for="(groupTeams, groupName) in groupedStandings"
      :key="groupName"
      class="mb-8"
    >
      <h3 class="text-xl font-bold mb-2 text-center text-white">{{ groupName }}</h3>
      <table class="w-4/5 m-auto text-white table-fixed">
        <thead>
          <tr>
            <th class="w-12">Position</th>
            <th class="w-16">Team</th>
            <th v-if="showDivision !== false" class="w-16">Division</th>
            <th v-if="showConference !== false" class="w-16">Conference</th>
            <th class="w-10">GP</th>
            <th class="w-10">W</th>
            <th class="w-10">L</th>
            <th class="w-10">OTL</th>
            <th class="w-10">PTS</th>
            <th class="w-10">ROW</th>
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
          <StatsBlock :standings="groupTeams" :show-division="showDivision" :show-conference="showConference" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'

defineProps<{
  groupedStandings: Record<string, Standing[]>
  showDivision?: boolean
  showConference?: boolean
}>()
</script>
