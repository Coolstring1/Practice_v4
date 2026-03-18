import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    preferredSport: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"]),

  analyses: defineTable({
    userId: v.id("users"),
    videoStorageId: v.id("_storage"),
    thumbnailStorageId: v.optional(v.id("_storage")),
    videoUrl: v.string(),
    sport: v.string(),
    identifiedActions: v.array(
      v.object({
        action: v.string(),
        timestamp: v.union(v.string(), v.null()),
        analysis: v.string(),
        practiceTips: v.array(v.string()),
      })
    ),
    overallFeedback: v.string(),
    rawResponse: v.optional(v.any()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    sessionNumber: v.number(),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_status_created", ["userId", "status", "createdAt"]),
});
