"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function TaskManager() {
  return (
    <>
      <CategoryManager />
      <CategoryStats />
      <TaskInput />
      <TaskList />
    </>
  );
} 

function TaskList() {
  const tasksWithCategories = useQuery(api.tasks.getWithCategories);
  const toggleTask = useMutation(api.tasks.toggle);

  const handleToggleTask = async (id: string) => {
    await toggleTask({ id: id as any });
  };

  // Show skeleton while loading
  if (tasksWithCategories === undefined) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="space-y-2">
      {tasksWithCategories.map((task) => (
                <div
          key={task._id}
          className="group flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <input
            type="checkbox"
            checked={task.isCompleted}
            onChange={() => handleToggleTask(task._id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span
            className={`flex-1 ${
              task.isCompleted ? "line-through text-gray-500" : "text-gray-900"
            } group-hover:text-gray-700`}
          >
            {task.text}
          </span>
          {task.category && (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: task.category.color }}
              ></div>
              <span className="text-xs text-gray-500">{task.category.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TaskInput() {
  const createTask = useMutation(api.tasks.create);
  const categories = useQuery(api.categories.get);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleCreateTask = async () => {
    if (newTaskText.trim()) {
      await createTask({ 
        text: newTaskText.trim(),
        categoryId: selectedCategoryId ? (selectedCategoryId as any) : undefined
      });
      setNewTaskText("");
      setSelectedCategoryId("");
    }
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
        />
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">No category</option>
          {categories?.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function CategoryManager() {
  const createCategory = useMutation(api.categories.create);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      await createCategory({ 
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md bg-white">
      <h3 className="font-semibold text-gray-900 mb-3">Create Category</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Category name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
        />
        <input
          type="color"
          value={newCategoryColor}
          onChange={(e) => setNewCategoryColor(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
        />
        <button
          onClick={handleCreateCategory}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}

function CategoryStats() {
  const stats = useQuery(api.tasks.getCategoryStats);
  
  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-md animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.category._id}
          className="p-4 border border-gray-200 rounded-md bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stat.category.color }}
            ></div>
            <h3 className="font-semibold text-gray-900">{stat.category.name}</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stat.completedTasks}/{stat.totalTasks}
          </div>
          <div className="text-sm text-gray-600">
            {stat.completionRate.toFixed(0)}% complete
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-md animate-pulse"
        >
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}
