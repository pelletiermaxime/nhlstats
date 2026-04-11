<template>
  <tr
    v-for="(s, position) in standings"
    :key="position"
    class="even:bg-zinc-600 text-center text-sm"
  >
    <td class="px-1 py-2" :style="{ background: s.conference === 'EAST' ? '#b9112d' : '#003872', color: 'white' }">
      {{ position + 1 }}
    </td>
    <td class="w-12 px-1 py-2">
      <NuxtLink :to="`/player-stats/${s.short_name}`" class="flex justify-center">
        <img
          :src="`/logos/SVG/${s.short_name}.svg`"
          class="h-8 sm:h-10 cursor-pointer hover:scale-110 transition-transform"
          :alt="`${s.city} ${s.name}`"
          :title="`${s.city} ${s.name}`"
        >
      </NuxtLink>
    </td>
    <td v-if="showDivision !== false" class="px-1 py-2">{{ s.division }}</td>
    <td v-if="showConference !== false" class="px-1 py-2">{{ s.conference }}</td>
    <td class="px-1 py-2">{{ s.gp }}</td>
    <td class="px-1 py-2">{{ s.w }}</td>
    <td class="px-1 py-2">{{ s.l }}</td>
    <td class="px-1 py-2">{{ s.otl }}</td>
    <td class="font-bold px-1 py-2">{{ s.pts }}</td>
    <td class="px-1 py-2">{{ s.row }}</td>
    <td class="px-1 py-2">{{ s.gf }}</td>
    <td class="px-1 py-2">{{ s.ga }}</td>
    <td class="px-1 py-2">{{ s.diff }}</td>
    <td class="px-1 py-2">{{ s.home }}</td>
    <td class="px-1 py-2">{{ s.away }}</td>
    <td class="px-1 py-2">{{ s.l10 }}</td>
    <td class="px-1 py-2">{{ s.streak }}</td>
  </tr>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'

defineProps<{
  standings: Standing[]
  showDivision?: boolean
  showConference?: boolean
}>()
</script>
