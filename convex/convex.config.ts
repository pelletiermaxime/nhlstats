import betterAuth from '@lupinum/better-convex-nuxt/better-auth/convex.config'
import { defineApp } from 'convex/server'

const app = defineApp()
app.use(betterAuth, { name: 'betterAuthV2' })

export default app
