"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState } from "react";

function QueueList() {
    const queues = useQuery(api.queues.getActiveQueues);
    const [selectedQueueId, setSelectedQueueId] = useState<Id<"queues"> | null>(null);

    if (queues === undefined) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-md animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Available Queues</h3>
            {queues.map((queue) => (
                <div
                    key={queue._id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedQueueId === queue._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                    onClick={() => setSelectedQueueId(queue._id)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium text-gray-900">{queue.name}</h4>
                            {queue.description && (
                                <p className="text-sm text-gray-600 mt-1">{queue.description}</p>
                            )}
                        </div>
                        <QueueStats queueId={queue._id} />
                    </div>
                </div>
            ))}

            {selectedQueueId && (
                <QueueDetails queueId={selectedQueueId} />
            )}
        </div>
    );
}

function QueueStats({ queueId }: { queueId: Id<"queues"> }) {
    const stats = useQuery(api.queues.getQueueStats, { queueId });

    if (stats === undefined) {
        return <div className="text-sm text-gray-400">Loading...</div>;
    }

    return (
        <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{stats.waiting}</div>
            <div className="text-xs text-gray-600">waiting</div>
        </div>
    );
}

function QueueDetails({ queueId }: { queueId: Id<"queues"> }) {
    const queueData = useQuery(api.queues.getQueueWithItems, { queueId });
    const joinQueue = useMutation(api.queues.joinQueue);
    const startProcessing = useMutation(api.queues.startProcessing);
    const completeItem = useMutation(api.queues.completeItem);
    const cancelItem = useMutation(api.queues.cancelItem);

    const [userName, setUserName] = useState("");
    const [notes, setNotes] = useState("");
    const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);

    if (queueData === undefined) {
        return <div className="p-4 border border-gray-200 rounded-md">Loading queue details...</div>;
    }

    if (!queueData) {
        return <div className="p-4 border border-gray-200 rounded-md text-red-600">Queue not found</div>;
    }

    const { queue, items } = queueData;
    const waitingItems = items.filter(item => item.status === "waiting");
    const processingItems = items.filter(item => item.status === "processing");
    const userItems = items.filter(item => item.userId === userId);

    const handleJoinQueue = async () => {
        if (userName.trim()) {
            await joinQueue({
                queueId,
                userId,
                userName: userName.trim(),
                notes: notes.trim() || undefined,
            });
            setUserName("");
            setNotes("");
        }
    };

    const handleStartProcessing = async (itemId: string) => {
        await startProcessing({ itemId: itemId as any });
    };

    const handleCompleteItem = async (itemId: string) => {
        await completeItem({ itemId: itemId as any });
    };

    const handleCancelItem = async (itemId: string) => {
        await cancelItem({ itemId: itemId as any, userId });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-white">
            <h4 className="font-semibold text-gray-900 mb-4">{queue.name}</h4>

            {/* Join Queue Form */}
            <div className="mb-6 p-3 border border-gray-200 rounded-md bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-2">Join Queue</h5>
                <div className="space-y-2">
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleJoinQueue}
                        disabled={!userName.trim()}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Join Queue
                    </button>
                </div>
            </div>

            {/* Your Items */}
            {userItems.length > 0 && (
                <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-2">Your Items</h5>
                    <div className="space-y-2">
                        {userItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                                <div>
                                    <span className="font-medium">{item.userName}</span>
                                    {item.notes && <span className="text-sm text-gray-600 ml-2">- {item.notes}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === "waiting" ? "bg-yellow-100 text-yellow-800" :
                                            item.status === "processing" ? "bg-blue-100 text-blue-800" :
                                                "bg-gray-100 text-gray-800"
                                        }`}>
                                        {item.status}
                                    </span>
                                    {item.status === "waiting" && (
                                        <button
                                            onClick={() => handleCancelItem(item._id)}
                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Queue Management (Admin View) */}
            <div>
                <h5 className="font-medium text-gray-900 mb-2">Queue Management</h5>

                {/* Currently Processing */}
                {processingItems.length > 0 && (
                    <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Currently Processing</h6>
                        <div className="space-y-2">
                            {processingItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-3 border border-blue-200 rounded-md bg-blue-50">
                                    <div>
                                        <span className="font-medium">{item.userName}</span>
                                        {item.notes && <span className="text-sm text-gray-600 ml-2">- {item.notes}</span>}
                                    </div>
                                    <button
                                        onClick={() => handleCompleteItem(item._id)}
                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Waiting Items */}
                {waitingItems.length > 0 && (
                    <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Waiting ({waitingItems.length})</h6>
                        <div className="space-y-2">
                            {waitingItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                                    <div>
                                        <span className="font-medium">{item.userName}</span>
                                        {item.notes && <span className="text-sm text-gray-600 ml-2">- {item.notes}</span>}
                                    </div>
                                    <button
                                        onClick={() => handleStartProcessing(item._id)}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Start
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {waitingItems.length === 0 && processingItems.length === 0 && (
                    <p className="text-gray-500 text-sm">No items in queue</p>
                )}
            </div>
        </div>
    );
}

function CreateQueue() {
    const createQueue = useMutation(api.queues.createQueue);
    const [queueName, setQueueName] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateQueue = async () => {
        if (queueName.trim()) {
            await createQueue({
                name: queueName.trim(),
                description: description.trim() || undefined,
            });
            setQueueName("");
            setDescription("");
        }
    };

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-white">
            <h3 className="font-semibold text-gray-900 mb-3">Create New Queue</h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={queueName}
                    onChange={(e) => setQueueName(e.target.value)}
                    placeholder="Queue name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCreateQueue}
                    disabled={!queueName.trim()}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Create Queue
                </button>
            </div>
        </div>
    );
}

export default function QueueManager() {
    return (
        <div className="space-y-6">
            <div className="flex gap-6">
                <div className="flex-1">
                    <CreateQueue />
                </div>
                <div className="flex-1">
                    <QueueList />
                </div>
            </div>
        </div>
    );
} 