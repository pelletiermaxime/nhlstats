import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/nuxt/**/*.{test,spec}.{ts,js}'],
    exclude: ['node_modules', '.nuxt', 'dist', 'tests/visual/**/*'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        mock: {
          intersectionObserver: true,
          indexedDb: false
        }
      }
    }
  }
})
