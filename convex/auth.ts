import {
  createBetterConvexAuth,
  type BetterConvexAuth,
} from '@lupinum/better-convex-nuxt/better-auth/server'
import { components, internal } from './_generated/api'
import type { DataModel } from './_generated/dataModel'

function userProfile(user: Record<string, unknown>) {
  if (typeof user.id !== 'string') throw new Error('Auth user ID is missing')
  return {
    authId: user.id,
    displayName: typeof user.name === 'string' ? user.name : undefined,
    email: typeof user.email === 'string' ? user.email : undefined,
    avatarUrl: typeof user.image === 'string' ? user.image : undefined,
  }
}

export const auth: BetterConvexAuth<DataModel> = createBetterConvexAuth<DataModel>(
  components.betterAuthV2,
  {
    authFunctions: internal.auth,
    emailAndPassword: { requireEmailVerification: false },
    socialProviders: () => ({
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),
    defineSessionClaims: ({ user }) => ({
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    }),
    triggers: {
      user: {
        onCreate: async (ctx, user) => {
          const now = Date.now()
          await ctx.db.insert('users', {
            ...userProfile(user),
            createdAt: now,
            updatedAt: now,
          })
        },
        onUpdate: async (ctx, user) => {
          const profile = userProfile(user)
          const existing = await ctx.db
            .query('users')
            .withIndex('by_auth_id', (q) => q.eq('authId', profile.authId))
            .unique()
          if (!existing) return
          await ctx.db.patch(existing._id, { ...profile, updatedAt: Date.now() })
        },
        onDelete: async (ctx, user) => {
          const profile = userProfile(user)
          const existing = await ctx.db
            .query('users')
            .withIndex('by_auth_id', (q) => q.eq('authId', profile.authId))
            .unique()
          if (existing) await ctx.db.delete(existing._id)
        },
      },
    },
  },
)

export const createAuth = auth.createAuth
export const { ensureSigningKey, pruneSigningKeys, rotateSigningKey } = auth.jwksOperatorFunctions()
export const { onCreate, onUpdate, onDelete } = auth.triggerFunctions()
