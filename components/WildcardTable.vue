<template>
  <div>
    <table class="w-4/5 m-auto text-white table-fixed">
      <thead>
        <tr>
          <th class="w-12">Position</th>
          <th class="w-16">Team</th>
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
        <template v-for="section in sections" :key="section.title">
          <tr class="bg-zinc-800">
            <td colspan="15" class="text-left pl-4 py-2 font-bold text-white">
              {{ section.title }}
            </td>
          </tr>
          <StatsBlock :standings="section.teams" />
        </template>
      </tbody>
    </table>
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
</script>
