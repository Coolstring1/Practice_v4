import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

/**
 * Helper to get the authenticated user ID using Better Auth via Convex.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx) {
  try {
    const identity = await ctx.auth.getUserIdentity();
    console.log("[getUserId] Convex identity:", identity ? "PRESENT" : "NULL");

    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (authUser) {
      const email = (authUser as any).email;
      if (!email) {
        console.log("[getUserId] No email found in authUser object");
        return null;
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      
      if (!user) {
        console.log("[getUserId] Auth user exists but no app profile in 'users' table for:", email);
      }
      return user?._id ?? null;
    } else {
      console.log("[getUserId] safeGetAuthUser returned null");
    }
  } catch (err) {
    console.error("[getUserId] Error during safeGetAuthUser:", err);
  }
  return null;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = await getUserId(ctx);
    return {
      user: userId ? await ctx.db.get(userId) : null,
      isAuthenticated: !!identity,
    };
  },
});

// Auto-create app profile when a user first signs in via Better Auth
export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[ensureUserProfile] Mutation CALLED");
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      console.error("[ensureUserProfile] Failed: safeGetAuthUser returned null. User might not be authenticated with Better Auth.");
      throw new ConvexError("Not authenticated");
    }

    const email = (authUser as any).email;
    if (!email) {
      console.error("[ensureUserProfile] Failed: No email in authUser object", authUser);
      throw new ConvexError("No email in auth user");
    }

    console.log("[ensureUserProfile] Checking for existing profile in 'users' table for:", email);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      console.log("[ensureUserProfile] Found existing profile, skipping creation:", existing._id);
      return existing;
    }

    const name = (authUser as any).name;
    const image = (authUser as any).image;

    console.log("[ensureUserProfile] Creating new app profile for:", email);
    const newUserId = await ctx.db.insert("users", {
      email,
      name: name ?? undefined,
      image: image ?? undefined,
      onboardingCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("[ensureUserProfile] Profile created successfully with ID:", newUserId);
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

export const checkUsersDebug = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user" as any).collect();
    const appUsers = await ctx.db.query("users").collect();
    const sessions = await ctx.db.query("session" as any).collect();
    const accounts = await ctx.db.query("account" as any).collect();
    return {
      betterAuthUsers: users.length,
      appUsers: appUsers.length,
      sessions: sessions.length,
      accounts: accounts.length,
      userEmails: users.map(u => u.email),
    };
  },
});
