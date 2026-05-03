"use client";

import { useState, useEffect, useTransition } from "react";
import { BookingCard } from "@/components/BookingCard";
import { recalculateQueueScores } from "@/app/actions/booking";
import type { BookingStatus, UrgencyLevel, TopicCategory } from "@/lib/types";

interface QueueBooking {
  id: string;
  topicCategory: TopicCategory;
  urgencyLevel: UrgencyLevel;
  priorityScore: number;
  status: BookingStatus;
  scheduledAt: string;
  description: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
  lecturer: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
}

interface QueueListProps {
  lecturerId: string;
  initialData?: QueueBooking[];
}

export function QueueList({ lecturerId, initialData = [] }: QueueListProps) {
  const [queue, setQueue] = useState<QueueBooking[]>(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData.length) return;

    const fetchQueue = async () => {
      const res = await fetch(`/api/queue/${lecturerId}`);
      const data = await res.json();
      setQueue(data.data);
      setLoading(false);
    };

    fetchQueue();
  }, [lecturerId, initialData.length]);

  const handleRecalculate = () => {
    startTransition(async () => {
      await recalculateQueueScores(lecturerId);
      const res = await fetch(`/api/queue/${lecturerId}`);
      const data = await res.json();
      setQueue(data.data);
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 border border-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div id="queue-list" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1E5BFF]/10 px-2 text-xs font-bold text-[#1E5BFF]">
            {queue.length}
          </span>
          <span className="text-xs text-gray-400 font-medium">active bookings</span>
        </div>
        <button
          id="recalculate-queue-btn"
          onClick={handleRecalculate}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#1A1A1A] disabled:opacity-50 shadow-sm"
        >
          <svg className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {isPending ? "Recalculating..." : "Recalculate"}
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center bg-white/50">
          <div className="rounded-full bg-gray-100 p-4 mb-3">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-medium">No bookings in queue</p>
          <p className="text-xs text-gray-400 mt-1">New bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((booking, index) => (
            <div key={booking.id} className="relative">
              <div className="absolute -left-8 top-5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-mono font-bold text-gray-400 border border-gray-200">
                {index + 1}
              </div>
              <BookingCard
                {...booking}
                scheduledAt={booking.scheduledAt}
                viewerRole="LECTURER"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
