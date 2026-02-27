<template>
  <main class="bg-zinc-800 min-h-screen">
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <NuxtLink
                  v-for="item in menuElements"
                  :key="item.name"
                  :to="item.url"
                  :class="[route.path === item.url ? 'menu-active' : 'menu-inactive']"
                  :aria-current="route.path === item.url ? 'page' : undefined"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div id="mobile-menu" class="sm:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <NuxtLink
            v-for="item in menuElements"
            :key="item.name"
            :to="item.url"
            :class="[route.path === item.url ? 'menu-mobile-active' : 'menu-mobile-inactive']"
            :aria-current="route.path === item.url ? 'page' : undefined"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </nav>
    <slot />
  </main>
</template>

<script setup lang="ts">
const menuElements = [
  { name: 'Teams', url: '/teams' },
  { name: 'Standings', url: '/standings' },
  { name: 'Player Stats', url: '/player-stats' },
  { name: 'MCP/AI tool', url: '/mcp' },
  { name: 'About', url: '/about' }
]

const route = useRoute()
</script>
