<template>
  <tr
    v-for="(s, position) in standings"
    :key="position"
    class="odd:bg-zinc-700 text-center"
  >
    <td :style="{ background: s.conference === 'EAST' ? '#b9112d' : '#003872', color: 'white', fontSize: '1.8em' }">
      {{ position + 1 }}
    </td>
    <td width="100" align="center">
      <NuxtLink :to="`/player-stats/${s.short_name}`">
        <img
          :src="`/logos/SVG/${s.short_name}.svg`"
          class="h-10 cursor-pointer hover:scale-110 transition-transform"
          :alt="`${s.city} ${s.name}`"
          :title="`${s.city} ${s.name}`"
        >
      </NuxtLink>
    </td>
    <td>{{ s.division }}</td>
    <td>{{ s.conference }}</td>
    <td>{{ s.gp }}</td>
    <td>{{ s.w }}</td>
    <td>{{ s.l }}</td>
    <td>{{ s.otl }}</td>
    <td>{{ s.pts }}</td>
    <td>{{ s.row }}</td>
    <td>{{ s.gf }}</td>
    <td>{{ s.ga }}</td>
    <td>{{ s.diff }}</td>
    <td>{{ s.home }}</td>
    <td>{{ s.away }}</td>
    <td>{{ s.l10 }}</td>
    <td>{{ s.streak }}</td>
  </tr>
</template>

<script setup lang="ts">
import type { Standing } from '~/types/teams'

defineProps<{
  standings: Standing[]
}>()
</script>
