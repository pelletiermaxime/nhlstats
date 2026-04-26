<template>
  <main class="bg-zinc-800 min-h-screen flex flex-col">
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative flex h-14 items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center">
            <img
              src="/icons/nhlstats-logo.avif"
              alt="NHL Stats"
              class="h-10 w-auto"
            >
          </NuxtLink>

          <!-- Desktop Menu -->
          <div class="hidden sm:flex items-center space-x-2">
            <NuxtLink
              v-for="item in menuElements"
              :key="item.name"
              :to="item.url"
              class="text-sm"
              :class="[isActive(item.url) ? 'menu-active' : 'menu-inactive']"
              :aria-current="isActive(item.url) ? 'page' : undefined"
            >
              {{ item.name }}
            </NuxtLink>
          </div>

          <!-- Desktop Auth -->
          <div class="hidden sm:flex items-center space-x-3">
            <template v-if="isAuthenticated">
              <NuxtLink to="/profile" class="text-gray-300 hover:text-white text-sm">
                {{ user?.email || user?.name || 'Profile' }}
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/signin"
                class="text-sm"
                :class="[isActive('/auth/signin') ? 'menu-active' : 'menu-inactive']"
                :aria-current="isActive('/auth/signin') ? 'page' : undefined"
              >
                Sign In
              </NuxtLink>
              <NuxtLink
                to="/auth/signup"
                class="text-sm"
                :class="[isActive('/auth/signup') ? 'menu-active' : 'menu-inactive']"
                :aria-current="isActive('/auth/signup') ? 'page' : undefined"
              >
                Sign Up
              </NuxtLink>
            </template>
          </div>

          <!-- Mobile Hamburger Button -->
          <div
            role="button"
            tabindex="0"
            class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none cursor-pointer"
            aria-controls="mobile-menu"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
            @keydown.enter="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Drawer -->
      <div
        v-show="mobileMenuOpen"
        id="mobile-menu"
        class="sm:hidden border-t border-gray-700"
      >
        <div class="px-2 pb-3 pt-2 space-y-1">
          <NuxtLink
            v-for="item in menuElements"
            :key="item.name"
            :to="item.url"
            class="block text-base"
            :class="[isActive(item.url) ? 'menu-mobile-active' : 'menu-mobile-inactive']"
            :aria-current="isActive(item.url) ? 'page' : undefined"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </NuxtLink>

          <div class="border-t border-gray-700 my-2" />

          <template v-if="isAuthenticated">
            <NuxtLink
              to="/profile"
              class="block text-base menu-mobile-inactive"
              @click="mobileMenuOpen = false"
            >
              Profile
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/auth/signin"
              class="block text-base"
              :class="[isActive('/auth/signin') ? 'menu-mobile-active' : 'menu-mobile-inactive']"
              :aria-current="isActive('/auth/signin') ? 'page' : undefined"
              @click="mobileMenuOpen = false"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="block text-base"
              :class="[isActive('/auth/signup') ? 'menu-mobile-active' : 'menu-mobile-inactive']"
              :aria-current="isActive('/auth/signup') ? 'page' : undefined"
              @click="mobileMenuOpen = false"
            >
              Sign Up
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>
    <slot />
  </main>
</template>

<script setup lang="ts">
const { isAuthenticated, user } = useConvexAuth()

const mobileMenuOpen = ref(false)

const menuElements = [
  { name: 'Teams', url: '/teams' },
  { name: 'Standings', url: '/standings' },
  { name: 'Scores', url: '/scores' },
  { name: 'Player Stats', url: '/player-stats' },
  { name: 'Goalie Stats', url: '/goalie-stats' },
  { name: 'MCP/AI tool', url: '/mcp' },
  { name: 'About', url: '/about' }
]

const route = useRoute()

function isActive(url: string): boolean {
  return route.path === url || route.path.startsWith(`${url}/`)
}
</script>
