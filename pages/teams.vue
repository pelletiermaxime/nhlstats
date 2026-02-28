<template>
  <div v-if="divisions && teamsByDivision" class="grid grid-cols-2 gap-6 mx-10 mt-10">
    <div
      v-for="division in divisions"
      :key="division._id"
      class="border-solid border-black border shadow-sm rounded-lg"
    >
      <div class="bg-zinc-500 px-2 py-3 border-b text-white rounded-t-lg">
        {{ division.name }}
      </div>
      <NuxtLink
        v-for="team in teamsByDivision[division._id]"
        :key="team._id"
        :to="`/player-stats/${team.short_name}`"
        class="p-3 bg-zinc-700 last:rounded-b-lg flex items-center gap-3 hover:bg-zinc-600 transition-colors"
      >
        <div class="w-12 flex justify-center">
          <img
            :src="`/logos/SVG/${team.short_name}.svg`"
            class="h-10 hover:scale-110 transition-transform"
            :alt="`${team.city} ${team.name}`"
          >
        </div>
        <span class="text-white">{{ team.city }} {{ team.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from "../convex/_generated/api";

definePageMeta({
  title: 'Teams'
})

const { data: divisions } = await useConvexQuery(api.teams.getDivisions, {})
const { data: teamsByDivision } = await useConvexQuery(api.teams.getTeamsByDivision, {})
</script>
