"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface QueuePageProps {
    params: Promise<{
        queueId: string;
    }>;
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
        return (
            <div className="space-y-6">
                <div className="p-6 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    if (!queueData) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-red-600 mb-4">Queue not found</h2>
                <Link href="/" className="text-blue-500 hover:text-blue-600">
                    ← Back to all queues
                </Link>
            </div>
        );
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
        <div className="space-y-8">
            {/* Queue Header */}
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{queue.name}</h1>
                        {queue.description && (
                            <p className="text-gray-600 mt-2">{queue.description}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{waitingItems.length}</div>
                        <div className="text-sm text-gray-600 uppercase tracking-wide">waiting</div>
                    </div>
                </div>
            </div>

            {/* Join Queue Form */}
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Join Queue</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleJoinQueue}
                        disabled={!userName.trim()}
                        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                    >
                        Join Queue
                    </button>
                </div>
            </div>

            {/* Your Items */}
            {userItems.length > 0 && (
                <div className="p-6 border border-gray-200 rounded-lg bg-white">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Items</h2>
                    <div className="space-y-3">
                        {userItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{item.userName}</div>
                                    {item.notes && <div className="text-sm text-gray-600 mt-1">{item.notes}</div>}
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                                        item.status === "waiting" ? "bg-yellow-100 text-yellow-800" :
                                        item.status === "processing" ? "bg-blue-100 text-blue-800" :
                                        "bg-gray-100 text-gray-800"
                                    }`}>
                                        {item.status}
                                    </span>
                                    {item.status === "waiting" && (
                                        <button
                                            onClick={() => handleCancelItem(item._id)}
                                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Queue Management</h2>

                {/* Currently Processing */}
                {processingItems.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-md font-medium text-gray-700 mb-4">Currently Processing</h3>
                        <div className="space-y-3">
                            {processingItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{item.userName}</div>
                                        {item.notes && <div className="text-sm text-gray-600 mt-1">{item.notes}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleCompleteItem(item._id)}
                                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 ml-4"
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
                        <h3 className="text-md font-medium text-gray-700 mb-4">Waiting ({waitingItems.length})</h3>
                        <div className="space-y-3">
                            {waitingItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{item.userName}</div>
                                        {item.notes && <div className="text-sm text-gray-600 mt-1">{item.notes}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleStartProcessing(item._id)}
                                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 ml-4"
                                    >
                                        Start
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {waitingItems.length === 0 && processingItems.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No items in queue</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function QueuePage({ params }: QueuePageProps) {
    const { queueId } = use(params);
    
    return (
        <main className="flex flex-col items-center justify-between p-24">
            <div className="w-full max-w-6xl">
                <div className="mb-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all queues
                    </Link>
                </div>
                <QueueDetails queueId={queueId as Id<"queues">} />
            </div>
        </main>
    );
} 