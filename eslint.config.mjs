import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({}, { 
    ignores: [
        'desktop/build', 
        'desktop/artifacts'
    ] 
})
