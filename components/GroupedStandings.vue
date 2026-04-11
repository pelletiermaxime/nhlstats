<template>
  <div class="px-4 sm:px-0">
    <div
      v-for="(groupTeams, groupName) in groupedStandings"
      :key="groupName"
      class="mb-8"
    >
      <h3 class="text-xl font-bold mb-2 text-center text-white">{{ groupName }}</h3>
      <div class="w-full sm:w-4/5 sm:mx-auto overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table class="w-full text-white table-fixed min-w-[900px]">
          <thead>
            <tr class="text-sm">
              <th class="w-10 px-1 py-2">#</th>
              <th class="w-12 px-1 py-2">Team</th>
              <th v-if="showDivision !== false" class="w-16 px-1 py-2">Division</th>
              <th v-if="showConference !== false" class="w-16 px-1 py-2">Conference</th>
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
            <StatsBlock :standings="groupTeams" :show-division="showDivision" :show-conference="showConference" />
          </tbody>
        </table>
      </div>
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
