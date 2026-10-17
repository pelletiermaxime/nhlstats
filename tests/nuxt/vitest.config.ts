import { defineVitestProject } from '@nuxt/test-utils/config'
import type { ModuleOptions } from '@lupinum/better-convex-nuxt'
import type { NuxtConfig } from 'nuxt/schema'

interface TestNuxtConfig extends NuxtConfig {
  convex: Partial<ModuleOptions>
}

const overrides: TestNuxtConfig = {
  buildDir: './node_modules/.cache/nuxt/test',
  typesDir: './node_modules/.cache/nuxt/test',
  convex: {
    url: 'https://backend.example.invalid',
    siteUrl: 'https://auth.example.invalid',
    client: { connect: 'on-demand' },
    auth: {
      origin: 'https://app.example.invalid',
      trustedClientIpHeader: 'x-test-client-ip',
    },
  },
  routeRules: {
    '/**': { robots: false },
  },
}

export default defineVitestProject({
  test: {
    name: 'nuxt',
    environment: 'nuxt',
    include: ['**/*.nuxt.{test,spec}.ts'],
    exclude: ['node_modules', '.nuxt', 'dist', 'tests/visual/**/*'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides,
        mock: {
          intersectionObserver: true,
          indexedDb: false,
        },
      },
    },
  },
})
