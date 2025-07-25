import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    categoryId: v.optional(v.id("categories")),
  }),
  categories: defineTable({
    name: v.string(),
    color: v.string(),
  }),
}); 