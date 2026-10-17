import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineVitestProject({
  test: {
    name: 'nuxt',
    environment: 'nuxt',
    include: ['**/*.nuxt.{test,spec}.ts'],
    exclude: ['node_modules', '.nuxt', 'dist', 'tests/visual/**/*'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          buildDir: './node_modules/.cache/nuxt/test',
        },
        mock: {
          intersectionObserver: true,
          indexedDb: false,
        },
      },
    },
  },
})
