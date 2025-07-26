"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import Link from "next/link";
import CreateQueue from "./CreateQueue";

function QueueStats({ queueId }: { queueId: Id<"queues"> }) {
    const stats = useQuery(api.queues.getQueueStats, { queueId });

    if (stats === undefined) {
        return <div className="text-sm text-gray-400">Loading...</div>;
    }

    return (
        <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-900">{stats.waiting}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">waiting</div>
        </div>
    );
}

export default function QueueList() {
    const queues = useQuery(api.queues.getActiveQueues);

    if (queues === undefined) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-5 bg-gray-300 rounded mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
                <CreateQueue />
                
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Available Queues</h3>
                    {queues.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No queues available</p>
                            <p className="text-gray-400 mt-2">Create a new queue to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {queues.map((queue) => (
                                <Link
                                    key={queue._id}
                                    href={`/queues/${queue._id}`}
                                    className="block p-6 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">{queue.name}</h4>
                                            {queue.description && (
                                                <p className="text-sm text-gray-600">{queue.description}</p>
                                            )}
                                        </div>
                                        <QueueStats queueId={queue._id} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 