<template>
  <NuxtLink :to="target"><slot /></NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ to: string }>()
const { withSeason } = useSeason()
const target = computed(() => withSeason(props.to))
</script>
