export default defineNuxtConfig({
  compatibilityDate: '2025-01-10',
  routeRules: {
    '/': { redirect: '/player-stats' },
    '/mcp': { swr: 86400 },
    '/standings': { swr: 3600 },
    '/teams': { swr: 86400 }
  },
  nitro: {
    preset: 'cloudflare_pages'
  },
  modules: [
    '@unocss/nuxt',
    'better-convex-nuxt',
    '@nuxt/hints',
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-seo-utils',
    'nuxt-site-config',
    '@vueuse/nuxt'
  ],
  site: {
    url: 'https://nhlstats.org',
    name: 'NHL Stats'
  },
  css: ['@unocss/reset/tailwind-compat.css'],
  ssr: true,
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'https://api.nhlstats.org',
    },
    convex: {
      url: process.env.CONVEX_URL
    }
  },
  devtools: { enabled: true },
  convex: {
    auth: {
      enabled: false
    },
    url: process.env.CONVEX_URL
  },
  mcp: {
    name: 'nhlstats',
    version: '1.0.0',
    route: '/mcp-server',
    dir: 'mcp',
    browserRedirect: '/mcp'
  },
  experimental: {
    asyncContext: true,
    viewTransition: true,
  },
  typescript: {
    tsConfig: {
      exclude: ['../desktop']
    }
  }
})