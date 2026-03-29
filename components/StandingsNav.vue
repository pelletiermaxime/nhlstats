<template>
  <nav class="flex gap-4 justify-center p-4 text-white">
    <NuxtLink
      to="/standings"
      :class="{ 'font-bold': active === 'league' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      League
    </NuxtLink>
    <NuxtLink
      to="/standings/division"
      :class="{ 'font-bold': active === 'division' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Division
    </NuxtLink>
    <NuxtLink
      to="/standings/conference"
      :class="{ 'font-bold': active === 'conference' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Conference
    </NuxtLink>
    <NuxtLink
      to="/standings/wildcard"
      :class="{ 'font-bold': active === 'wildcard' }"
      class="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
    >
      Wildcard
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  active: 'league' | 'division' | 'conference' | 'wildcard'
}>()
</script>
