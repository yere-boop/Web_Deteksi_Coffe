"use client";

import { useState, useTransition } from "react";
import { updateBooking, deleteBooking } from "@/app/actions/booking";
import type { BookingStatus, UrgencyLevel, TopicCategory } from "@/lib/types";
import { CompleteSessionModal } from "./CompleteSessionModal";

interface BookingUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
}

interface BookingCardProps {
  id: string;
  topicCategory: TopicCategory;
  urgencyLevel: UrgencyLevel;
  priorityScore: number;
  status: BookingStatus;
  scheduledAt: string;
  description?: string | null;
  student: BookingUser;
  lecturer: BookingUser;
  viewerRole: "STUDENT" | "LECTURER" | "ADMIN";
  queuePosition?: number;
  totalInQueue?: number;
  onOptimisticUpdate?: () => void;
}

const URGENCY_STYLES: Record<UrgencyLevel, { bg: string; dot: string }> = {
  LOW: { bg: "text-emerald-700", dot: "bg-emerald-500" },
  MEDIUM: { bg: "text-amber-700", dot: "bg-amber-500" },
  HIGH: { bg: "text-orange-700", dot: "bg-orange-500" },
  CRITICAL: { bg: "text-red-700", dot: "bg-red-500" },
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-[#1E5BFF]/10 text-[#1E5BFF] border-[#1E5BFF]/20",
  IN_PROGRESS: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  NO_SHOW: "bg-red-50 text-red-700 border-red-200",
};

const TOPIC_LABELS: Record<TopicCategory, string> = {
  THESIS: "Thesis",
  COURSEWORK: "Coursework",
  EXAM_PREP: "Exam Prep",
  PROJECT: "Project",
  CAREER_GUIDANCE: "Career Guidance",
  ACADEMIC_ADVISING: "Academic Advising",
  RESEARCH: "Research",
  OTHER: "Other",
};

export function BookingCard({
  id,
  topicCategory,
  urgencyLevel,
  priorityScore,
  status,
  scheduledAt,
  description,
  student,
  lecturer,
  viewerRole,
  queuePosition,
  totalInQueue,
  onOptimisticUpdate,
}: BookingCardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleStatusChange = (newStatus: BookingStatus) => {
    const prevStatus = currentStatus;
    setCurrentStatus(newStatus);
    onOptimisticUpdate?.();

    startTransition(async () => {
      try {
        await updateBooking({ id, status: newStatus });
      } catch {
        setCurrentStatus(prevStatus);
      }
    });
  };

  const handleCompleteSuccess = () => {
    setShowCompleteModal(false);
    setCurrentStatus("COMPLETED");
    onOptimisticUpdate?.();
  };

  const handleDelete = () => {
    setIsDeleted(true);
    onOptimisticUpdate?.();

    startTransition(async () => {
      try {
        await deleteBooking(id);
      } catch {
        setIsDeleted(false);
      }
    });
  };

  if (isDeleted) return null;

  const scheduledDate = new Date(scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const urgency = URGENCY_STYLES[urgencyLevel];

  return (
    <div
      id={`booking-card-${id}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/60 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#1E5BFF] to-[#5A2D82]" />
      
      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#1A1A1A] truncate">
                {TOPIC_LABELS[topicCategory]}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${urgency.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
                {urgencyLevel}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {viewerRole === "STUDENT" ? `with ${lecturer.name}` : `by ${student.name}`}
              {student.department && <span className="text-gray-400"> · {viewerRole === "STUDENT" ? lecturer.department : student.department}</span>}
            </p>
          </div>
          
          <span className={`shrink-0 inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[currentStatus]}`}>
            {currentStatus.replace("_", " ")}
          </span>
        </div>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="font-medium">{scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{scheduledDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          
          {queuePosition != null && (
            <div className="ml-auto flex items-center gap-1.5 bg-[#1E5BFF]/5 rounded-lg px-2 py-1">
              <span className="text-[10px] text-[#1E5BFF]/70 font-bold uppercase tracking-wider">#</span>
              <span className="font-mono text-sm font-black text-[#1E5BFF]">{queuePosition}</span>
              {totalInQueue && <span className="text-gray-400 text-[10px]">of {totalInQueue}</span>}
            </div>
          )}
          
          {queuePosition == null && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Score</span>
              <span className="font-mono text-sm font-black text-[#1E5BFF]">
                {(priorityScore * 100).toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED" && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            {/* Lecturer: Accept a pending consultation */}
            {viewerRole === "LECTURER" && currentStatus === "PENDING" && (
              <button
                id={`confirm-booking-${id}`}
                onClick={() => handleStatusChange("CONFIRMED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Accept Consultation
              </button>
            )}
            {/* Lecturer: Start an accepted session */}
            {viewerRole === "LECTURER" && currentStatus === "CONFIRMED" && (
              <button
                id={`start-booking-${id}`}
                onClick={() => handleStatusChange("IN_PROGRESS")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E5BFF] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1546CC] shadow-sm"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
                Start Session
              </button>
            )}
            {/* Lecturer: Mark session as completed */}
            {viewerRole === "LECTURER" && currentStatus === "IN_PROGRESS" && (
              <button
                id={`complete-booking-${id}`}
                onClick={() => setShowCompleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFC107] px-3.5 py-1.5 text-xs font-bold text-[#1A1A1A] transition-colors hover:bg-[#e6ad00] shadow-sm"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Complete Session
              </button>
            )}
            {/* Cancel — available for both roles */}
            <button
              id={`cancel-booking-${id}`}
              onClick={() => handleStatusChange("CANCELLED")}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              Cancel
            </button>
            {/* Student: Delete */}
            {viewerRole === "STUDENT" && (
              <button
                id={`delete-booking-${id}`}
                onClick={handleDelete}
                className="ml-auto rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      {showCompleteModal && (
        <CompleteSessionModal 
          bookingId={id} 
          onClose={() => setShowCompleteModal(false)} 
          onSuccess={handleCompleteSuccess} 
        />
      )}
    </div>
  );
}
