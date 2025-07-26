"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function CreateQueue() {
    const createQueue = useMutation(api.queues.createQueue);
    const [queueName, setQueueName] = useState("");
    const [description, setDescription] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCreateQueue = async () => {
        if (queueName.trim()) {
            await createQueue({
                name: queueName.trim(),
                description: description.trim() || undefined,
            });
            setQueueName("");
            setDescription("");
            setIsExpanded(false);
        }
    };

    return (
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create New Queue</h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    {isExpanded ? "Hide" : "Show"}
                </button>
            </div>
            
            {isExpanded && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Queue name</label>
                        <input
                            type="text"
                            value={queueName}
                            onChange={(e) => setQueueName(e.target.value)}
                            placeholder="Enter queue name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleCreateQueue}
                        disabled={!queueName.trim()}
                        className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                    >
                        Create Queue
                    </button>
                </div>
            )}
        </div>
    );
} 