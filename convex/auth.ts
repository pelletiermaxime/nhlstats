import {
  createClient,
  type GenericCtx,
  type AuthFunctions,
} from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import type { DataModel } from "./_generated/dataModel";
import { components, internal } from "./_generated/api";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;
const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, user) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          authId: user._id,
          displayName: user.name,
          email: user.email,
          avatarUrl: user.image ?? undefined,
          createdAt: now,
          updatedAt: now,
        });
      },
      onUpdate: async (ctx, user, previousUser) => {
        const nameChanged = user.name !== previousUser.name;
        const emailChanged = user.email !== previousUser.email;
        const imageChanged = user.image !== previousUser.image;

        if (!nameChanged && !emailChanged && !imageChanged) return;

        const existing = await ctx.db
          .query("users")
          .withIndex("by_auth_id", (q) => q.eq("authId", user._id))
          .first();

        if (!existing) return;

        await ctx.db.patch(existing._id, {
          ...(nameChanged && { displayName: user.name }),
          ...(emailChanged && { email: user.email }),
          ...(imageChanged && { avatarUrl: user.image ?? undefined }),
          updatedAt: Date.now(),
        });
      },
      onDelete: async (ctx, user) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_auth_id", (q) => q.eq("authId", user._id))
          .first();

        if (!existing) return;

        await ctx.db.delete(existing._id);
      },
    },
  },
});

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
    plugins: [convex({ authConfig })],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    trustedOrigins: [siteUrl],
  });
};

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
