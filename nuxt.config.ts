import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-10',
  future: {
    compatibilityVersion: 5,
  },
  ignore: ['dist/**'],
  routeRules: {
    '/': { redirect: '/player-stats' },
    '/mcp': { swr: 86400, convex: { ssrAuth: false } },
    '/scores': { swr: 60, convex: { ssrAuth: false } },
    '/standings': { swr: 3600, convex: { ssrAuth: false } },
    '/teams': { swr: 86400, convex: { ssrAuth: false } },
  },
  nitro: {
    preset: 'cloudflare_pages',
  },
  modules: [
    '@unocss/nuxt',
    '@lupinum/better-convex-nuxt',
    '@nuxt/hints',
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-seo-utils',
    'nuxt-site-config',
    '@vueuse/nuxt',
  ],
  site: {
    url: 'https://nhlstats.org',
    name: 'NHL Stats',
  },
  css: ['@unocss/reset/tailwind-compat.css'],
  ssr: true,
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'https://api.nhlstats.org',
    },
    convex: {
      url: process.env.CONVEX_URL,
    },
  },
  devtools: { enabled: true },
  convex: {
    url: process.env.CONVEX_URL,
    siteUrl: process.env.CONVEX_SITE_URL,
    auth: {
      origin:
        process.env.SITE_URL ||
        (process.env.NODE_ENV === 'production' ? 'https://nhlstats.org' : 'http://localhost:3000'),
      trustedClientIpHeader:
        process.env.BCN_AUTH_TRUSTED_CLIENT_IP_HEADER ||
        (process.env.NODE_ENV === 'production' ? 'cf-connecting-ip' : undefined),
    },
  },
  mcp: {
    name: 'nhlstats',
    version: '1.0.0',
    route: '/mcp-server',
    dir: 'mcp',
    browserRedirect: '/mcp',
  },
  experimental: {
    asyncContext: true,
    viewTransition: true,
    ssrStreaming: true,
    buildCache: true,
  },
  typescript: {
    tsConfig: {
      exclude: [fileURLToPath(new URL('./desktop', import.meta.url))],
      compilerOptions: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
  },
})
