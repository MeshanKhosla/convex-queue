import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getWithCategories = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const categories = await ctx.db.query("categories").collect();
    
    // TODO Meshan: Is this performant?
    return tasks.map(task => ({
      ...task,
      category: task.categoryId ? categories.find(cat => cat._id === task.categoryId) : null
    }));
  },
});

export const getCategoryStats = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const categories = await ctx.db.query("categories").collect();
    
    const stats = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category._id);
      const completedTasks = categoryTasks.filter(task => task.isCompleted);
      
      return {
        category,
        totalTasks: categoryTasks.length,
        completedTasks: completedTasks.length,
        completionRate: categoryTasks.length > 0 ? (completedTasks.length / categoryTasks.length) * 100 : 0
      };
    });
    
    return stats;
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    isCompleted: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: args.isCompleted ?? false,
      categoryId: args.categoryId,
    });
    return taskId;
  },
});

export const toggle = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    await ctx.db.patch(args.id, {
      isCompleted: !task.isCompleted,
    });
  },
});