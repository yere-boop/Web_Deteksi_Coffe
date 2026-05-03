"use client";

import { useState, useEffect } from "react";
import type { SessionOutcome } from "@/lib/types";

interface SessionRow {
  id: string;
  durationMin: number;
  lecturerNotes: string | null;
  followUpFlag: boolean;
  outcome: SessionOutcome;
  createdAt: string;
  booking: {
    scheduledAt: string;
    topicCategory: string;
    urgencyLevel: string;
    lecturer: { id: string; name: string; email: string; department: string | null };
  };
}

interface HistoryTableProps {
  studentId: string;
  initialData?: SessionRow[];
}

const OUTCOME_STYLES: Record<SessionOutcome, string> = {
  RESOLVED: "bg-emerald-50 text-emerald-700",
  FOLLOW_UP_NEEDED: "bg-amber-50 text-amber-700",
  REFERRED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export function HistoryTable({ studentId, initialData = [] }: HistoryTableProps) {
  const [sessions, setSessions] = useState<SessionRow[]>(initialData);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!initialData.length);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const res = await fetch(`/api/history/${studentId}?page=${page}&limit=10`);
      const data = await res.json();
      setSessions(data.data);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
    };
    fetchHistory();
  }, [studentId, page]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="history-table" className="space-y-4">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Session History</h2>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center bg-white/50">
          <p className="text-sm text-gray-500 font-medium">No session history yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Topic</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Lecturer</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Duration</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Outcome</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-600">
                      {new Date(s.booking.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#1A1A1A] font-semibold">{s.booking.topicCategory.replace("_", " ")}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{s.booking.lecturer.name}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{s.durationMin} min</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${OUTCOME_STYLES[s.outcome]}`}>
                        {s.outcome.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">{s.followUpFlag ? <span className="text-[#FFC107] font-bold">Yes</span> : <span className="text-gray-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <button id="history-prev-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 shadow-sm">Previous</button>
              <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
              <button id="history-next-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 shadow-sm">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
