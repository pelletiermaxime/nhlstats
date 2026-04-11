<template>
  <div class="px-4 sm:px-0">
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
          <template v-for="section in sections" :key="section.title">
            <tr class="bg-zinc-800">
              <td :colspan="colspanCount" class="text-left pl-4 py-2 font-bold text-white text-sm">
                {{ section.title }}
              </td>
            </tr>
            <StatsBlock :standings="section.teams" />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandingWithStatus } from '~/types/teams'

interface Section {
  title: string
  teams: StandingWithStatus[]
}

defineProps<{
  sections: Section[]
}>()

const colspanCount = 15
</script>
