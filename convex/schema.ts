import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  queues: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    maxConcurrentItems: v.optional(v.number()),
  }),
  queueItems: defineTable({
    queueId: v.id("queues"),
    userId: v.string(), // Simple string for demo, could be v.id("users") in production
    userName: v.string(),
    status: v.union(v.literal("waiting"), v.literal("processing"), v.literal("completed"), v.literal("cancelled")),
    joinedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
  users: defineTable({
    name: v.string(),
    isAdmin: v.boolean(),
    activeQueueId: v.optional(v.id("queues")), // For admins managing a specific queue
  }),
}); 