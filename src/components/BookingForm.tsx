"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions/booking";
import type { TopicCategory, UrgencyLevel } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface Lecturer {
  id: string;
  name: string;
  department: string | null;
}

interface BookingFormProps {
  lecturers: Lecturer[];
  onSuccess?: () => void;
}

const TOPICS: { value: TopicCategory; label: string }[] = [
  { value: "THESIS", label: "Thesis" },
  { value: "COURSEWORK", label: "Coursework" },
  { value: "EXAM_PREP", label: "Exam Prep" },
  { value: "PROJECT", label: "Project" },
  { value: "CAREER_GUIDANCE", label: "Career Guidance" },
  { value: "ACADEMIC_ADVISING", label: "Academic Advising" },
  { value: "RESEARCH", label: "Research" },
  { value: "OTHER", label: "Other" },
];

const URGENCIES: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "border-emerald-200 bg-emerald-50 text-emerald-700 peer-checked:bg-emerald-100 peer-checked:border-emerald-400" },
  { value: "MEDIUM", label: "Medium", color: "border-amber-200 bg-amber-50 text-amber-700 peer-checked:bg-amber-100 peer-checked:border-amber-400" },
  { value: "HIGH", label: "High", color: "border-orange-200 bg-orange-50 text-orange-700 peer-checked:bg-orange-100 peer-checked:border-orange-400" },
  { value: "CRITICAL", label: "Critical", color: "border-red-200 bg-red-50 text-red-700 peer-checked:bg-red-100 peer-checked:border-red-400" },
];

export function BookingForm({ lecturers, onSuccess }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lecturerId: "",
    topicCategory: "" as TopicCategory | "",
    urgencyLevel: "MEDIUM" as UrgencyLevel,
    description: "",
  });
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState<string>("09:00");
  const [examDateObj, setExamDateObj] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.lecturerId || !formData.topicCategory || !scheduledDate) {
      setError("Please fill in all required fields including Date and Time.");
      return;
    }

    const finalScheduledAt = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(":");
    finalScheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    startTransition(async () => {
      try {
        await createBooking({
          lecturerId: formData.lecturerId,
          topicCategory: formData.topicCategory as TopicCategory,
          urgencyLevel: formData.urgencyLevel,
          scheduledAt: finalScheduledAt.toISOString(),
          description: formData.description || undefined,
          examDate: examDateObj ? examDateObj.toISOString() : null,
        });
        setFormData({ lecturerId: "", topicCategory: "", urgencyLevel: "MEDIUM", description: "" });
        setScheduledDate(undefined);
        setExamDateObj(undefined);
        setScheduledTime("09:00");
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create booking");
      }
    });
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none transition-all focus:border-[#1E5BFF]/50 focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10";
  const selectClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#1E5BFF]/50 focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10 appearance-none cursor-pointer";

  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );

  return (
    <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Lecturer & Topic */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Lecturer *</label>
          <SelectWrapper>
            <select id="booking-lecturer" value={formData.lecturerId} onChange={(e) => setFormData((f) => ({ ...f, lecturerId: e.target.value }))} className={selectClass} required>
              <option value="">Choose a lecturer...</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>{l.name}{l.department ? ` · ${l.department}` : ""}</option>
              ))}
            </select>
          </SelectWrapper>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Topic *</label>
          <SelectWrapper>
            <select id="booking-topic" value={formData.topicCategory} onChange={(e) => setFormData((f) => ({ ...f, topicCategory: e.target.value as TopicCategory }))} className={selectClass} required>
              <option value="">Choose a topic...</option>
              {TOPICS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </SelectWrapper>
        </div>
      </div>

      {/* Urgency Level */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Urgency Level</label>
        <div className="grid grid-cols-4 gap-2">
          {URGENCIES.map((u) => (
            <label key={u.value} className="cursor-pointer">
              <input type="radio" name="urgency" value={u.value} checked={formData.urgencyLevel === u.value} onChange={() => setFormData((f) => ({ ...f, urgencyLevel: u.value }))} className="peer sr-only" />
              <div className={`rounded-xl border px-3 py-2 text-center text-[11px] font-bold transition-all ${u.color}`}>{u.label}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Preferred Date & Time *</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger type="button" className={`flex-1 flex items-center justify-start gap-2.5 ${inputClass} ${!scheduledDate && "text-gray-400"}`}>
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="truncate">{scheduledDate ? format(scheduledDate, "MMM d, yyyy") : "Select date"}</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-xl rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                  className="bg-white text-[#1A1A1A] rounded-xl"
                />
              </PopoverContent>
            </Popover>
            <div className="relative w-[110px] shrink-0">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`${inputClass} pl-9 !bg-white`}
                required
              />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Nearest Exam Date</label>
          <Popover>
            <PopoverTrigger type="button" className={`w-full flex items-center justify-start gap-2.5 ${inputClass} ${!examDateObj && "text-gray-400"}`}>
              <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">{examDateObj ? format(examDateObj, "MMM d, yyyy") : "Select exam date (optional)"}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-xl rounded-xl" align="start">
              <Calendar
                mode="single"
                selected={examDateObj}
                onSelect={setExamDateObj}
                initialFocus
                className="bg-white text-[#1A1A1A] rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Description</label>
        <textarea id="booking-description" value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} rows={3} maxLength={2000} className={`${inputClass} resize-none`} placeholder="Briefly describe what you need help with..." />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button id="booking-submit-btn" type="submit" disabled={isPending} className="group relative w-full h-11 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1E5BFF] px-4 text-sm font-bold text-white transition-all hover:bg-[#1546CC] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#1E5BFF]/20 hover:shadow-lg hover:shadow-[#1E5BFF]/30">
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <span>Creating...</span>
          </>
        ) : (
          <span>Book Consultation</span>
        )}
      </button>
    </form>
  );
}
