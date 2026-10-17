<template>
  <nav class="flex gap-4 justify-center p-4 text-white">
    <SeasonLink
      to="/standings"
      :class="{ 'font-bold': active === 'league' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      League
    </SeasonLink>
    <SeasonLink
      to="/standings/division"
      :class="{ 'font-bold': active === 'division' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Division
    </SeasonLink>
    <SeasonLink
      to="/standings/conference"
      :class="{ 'font-bold': active === 'conference' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Conference
    </SeasonLink>
    <SeasonLink
      to="/standings/wildcard"
      :class="{ 'font-bold': active === 'wildcard' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Wildcard
    </SeasonLink>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  active: 'league' | 'division' | 'conference' | 'wildcard'
}>()
</script>
