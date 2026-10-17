<template>
  <select
    id="season-selector"
    aria-label="Season"
    :value="String(seasonId)"
    :disabled="!availableSeasons.length"
    class="bg-zinc-700 text-white px-3 py-1.5 rounded-lg border border-zinc-600 text-sm focus:outline-none focus:border-blue-500"
    @change="selectSeason(($event.target as HTMLSelectElement).value)"
  >
    <option v-if="!isReady" :value="String(seasonId)">{{ season.label }} — unavailable</option>
    <option v-for="item in availableSeasons" :key="item.id" :value="String(item.id)">
      {{ item.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
const { season, seasonId, availableSeasons, isReady, selectSeason } = useSeason()
</script>
