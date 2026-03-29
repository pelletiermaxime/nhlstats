import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/visual/**/*.{test,spec}.{ts,js}']
  }
})
