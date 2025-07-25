import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active queues
export const getActiveQueues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("queues")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get queue with all its items
export const getQueueWithItems = query({
  args: { queueId: v.id("queues") },
  handler: async (ctx, args) => {
    const queue = await ctx.db.get(args.queueId);
    if (!queue) return null;

    const items = await ctx.db.query("queueItems")
      .filter((q) => q.eq(q.field("queueId"), args.queueId))
      .order("asc")
      .collect();

    return {
      queue,
      items: items.sort((a, b) => a.joinedAt - b.joinedAt) // Sort by join time
    };
  },
});

// Get queue statistics
export const getQueueStats = query({
  args: { queueId: v.id("queues") },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("queueItems")
      .filter((q) => q.eq(q.field("queueId"), args.queueId))
      .collect();

    const waiting = items.filter(item => item.status === "waiting").length;
    const processing = items.filter(item => item.status === "processing").length;
    const completed = items.filter(item => item.status === "completed").length;
    const cancelled = items.filter(item => item.status === "cancelled").length;

    return {
      total: items.length,
      waiting,
      processing,
      completed,
      cancelled,
      estimatedWaitTime: waiting * 5, // Rough estimate: 5 minutes per person
    };
  },
});

// Create a new queue
export const createQueue = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    maxConcurrentItems: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const queueId = await ctx.db.insert("queues", {
      name: args.name,
      description: args.description,
      isActive: true,
      maxConcurrentItems: args.maxConcurrentItems,
    });
    return queueId;
  },
});

// Join a queue
export const joinQueue = mutation({
  args: {
    queueId: v.id("queues"),
    userId: v.string(),
    userName: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const queue = await ctx.db.get(args.queueId);
    if (!queue || !queue.isActive) {
      throw new Error("Queue not found or inactive");
    }

    const itemId = await ctx.db.insert("queueItems", {
      queueId: args.queueId,
      userId: args.userId,
      userName: args.userName,
      status: "waiting",
      joinedAt: Date.now(),
      notes: args.notes,
    });
    return itemId;
  },
});

// Start processing an item (admin action)
export const startProcessing = mutation({
  args: {
    itemId: v.id("queueItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item || item.status !== "waiting") {
      throw new Error("Item not found or not waiting");
    }

    await ctx.db.patch(args.itemId, {
      status: "processing",
      startedAt: Date.now(),
    });
  },
});

// Complete an item (admin action)
export const completeItem = mutation({
  args: {
    itemId: v.id("queueItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item || item.status !== "processing") {
      throw new Error("Item not found or not processing");
    }

    await ctx.db.patch(args.itemId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

// Cancel an item (user can cancel their own, admin can cancel any)
export const cancelItem = mutation({
  args: {
    itemId: v.id("queueItems"),
    userId: v.string(), // To verify ownership
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Users can only cancel their own items
    if (item.userId !== args.userId) {
      throw new Error("Not authorized to cancel this item");
    }

    if (item.status === "completed") {
      throw new Error("Cannot cancel completed item");
    }

    await ctx.db.patch(args.itemId, {
      status: "cancelled",
    });
  },
});

// Get user's active items
export const getUserItems = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("queueItems")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
  },
}); 