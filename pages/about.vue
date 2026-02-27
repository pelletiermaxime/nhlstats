<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="text-3xl font-bold text-white mb-6">About NHL Stats</h1>
    
    <div class="prose prose-invert max-w-none">
      <p class="text-gray-300 text-lg mb-4">
        NHL Stats is a web application that displays NHL standings, team statistics, and player stats.
        Built with Nuxt 4, Vue 3, TypeScript, Convex and UnoCSS.
      </p>
      
      <p class="text-gray-300 text-lg mb-4">
        This is an open-source project. If you have ideas, suggestions, or want to help code,
        feel free to contribute on GitHub.
      </p>
      
      <a 
        href="https://github.com/pelletiermaxime/nhlstats-v2-frontend/" 
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-lg mt-4"
      >
        <img src="/icons/github.svg" alt="GitHub" class="w-6 h-6">
        View on GitHub
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'About'
})
</script>
