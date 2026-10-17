import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    projects: ['./tests/nuxt/vitest.config.ts', './tests/convex/vitest.config.ts'],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    ignorePatterns: [
      '.agents/**',
      '.idea/**',
      'convex/_generated/**',
      'desktop/**',
      'public/**',
      'skills-lock.json',
      'pnpm-lock.yaml',
      '.github/workflows/release.yml',
    ],
  },
  run: {
    tasks: {
      quality: {
        command: 'vp check',
        cache: false,
      },
      verify: {
        command: `node -e "console.log('All checks passed')"`,
        dependsOn: ['quality', 'typecheck', 'test', 'test:browser'],
        cache: false,
      },
    },
  },
  lint: {
    ignorePatterns: [
      '/*',
      '!/*.ts',
      '!/*.vue',
      '!/components/',
      '!/composables/',
      '!/convex/',
      '!/desktop/',
      '!/layouts/',
      '!/middleware/',
      '!/pages/',
      '!/server/',
      '!/shared/',
      '!/tests/',
      '!/types/',
      '!/utils/',
      'convex/_generated/',
    ],
  },
})
