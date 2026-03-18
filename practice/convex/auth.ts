import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

/**
 * Helper to get the authenticated user ID using Better Auth via Convex.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx) {
  try {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (authUser) {
      const email = (authUser as any).email;
      if (!email) return null;
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      return user?._id ?? null;
    }
  } catch {
    // Not authenticated
  }
  return null;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (userId) {
      return await ctx.db.get(userId);
    }

    // Try to get auth user and look up existing app profile
    try {
      const authUser = await authComponent.safeGetAuthUser(ctx);
      if (authUser) {
        const email = (authUser as any).email;
        if (!email) return null;

        const existing = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();

        return existing ?? null;
      }
    } catch {
      // Not authenticated
    }

    return null;
  },
});

// Auto-create app profile when a user first signs in via Better Auth
export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new ConvexError("Not authenticated");

    const email = (authUser as any).email;
    if (!email) throw new ConvexError("No email in auth user");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) return existing;

    const name = (authUser as any).name;
    const image = (authUser as any).image;

    const newUserId = await ctx.db.insert("users", {
      email,
      name: name ?? undefined,
      image: image ?? undefined,
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(newUserId);
  },
});

export const updatePreferredSport = mutation({
  args: { sport: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    await ctx.db.patch(userId, { preferredSport: args.sport, updatedAt: Date.now() });
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    await ctx.db.patch(userId, { onboardingCompleted: true, updatedAt: Date.now() });
  },
});

// Expose getAuthUser for ClientAuthBoundary
export const { getAuthUser } = authComponent.clientApi();
