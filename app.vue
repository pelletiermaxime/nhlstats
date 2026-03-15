<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Preload critical CSS to prevent FOUC
useHead({
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} - NHL Stats` : 'NHL Stats',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'NHL statistics, standings, and player stats' },
    { name: 'theme-color', content: '#27272a' },
    { property: 'og:image', content: '/icons/nhlstats-logo-bg.avif' },
    { property: 'og:title', content: 'NHL Stats' },
    { property: 'og:description', content: 'NHL statistics, standings, and player stats' }
  ],
  link: [
    { rel: 'icon', type: 'image/avif', sizes: 'any', href: '/icons/favicon.avif' },
    { rel: 'apple-touch-icon', type: 'image/avif', href: '/icons/favicon.avif' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<style>
/* Prevent unstyled flash by setting base styles */
body {
  background-color: #27272a; /* zinc-800 */
  visibility: visible;
  opacity: 1;
}
</style>
