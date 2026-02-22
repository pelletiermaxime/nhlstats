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
        <div
          v-for="team in teamsByDivision[division._id]"
          :key="team._id"
          class="p-3 bg-zinc-700 last:rounded-b-lg"
        >
          <span class="text-white">{{ team.city }} {{ team.name }}</span>
        </div>
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
