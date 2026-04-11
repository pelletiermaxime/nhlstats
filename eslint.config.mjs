import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({}, {
  ignores: [
    'desktop/build',
    'desktop/artifacts',
    'convex/_generated'
  ]
}).append({
  rules: {
    'indent': ['error', 2],
    'vue/html-indent': ['error', 2]
  }
})
