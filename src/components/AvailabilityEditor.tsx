"use client";

import { useState, useTransition } from "react";
import { saveAvailability, deleteAvailability } from "@/app/actions/booking";
import type { DayOfWeek } from "@/lib/types";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface AvailabilityEditorProps {
  initialSlots: AvailabilitySlot[];
}

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_SHORT: Record<DayOfWeek, string> = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun" };

export function AvailabilityEditor({ initialSlots }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [isPending, startTransition] = useTransition();
  const [newSlot, setNewSlot] = useState({ dayOfWeek: "MONDAY" as DayOfWeek, startTime: "09:00", endTime: "10:00", isRecurring: true });

  const handleAdd = () => {
    startTransition(async () => {
      const created = await saveAvailability(newSlot);
      setSlots((prev) => [...prev, created as AvailabilitySlot]);
    });
  };

  const handleRemove = (id: string) => {
    const prev = slots;
    setSlots((s) => s.filter((sl) => sl.id !== id));
    startTransition(async () => {
      try {
        await deleteAvailability(id);
      } catch {
        setSlots(prev);
      }
    });
  };

  const inputClass = "rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-[#1A1A1A] outline-none transition-all focus:border-[#1E5BFF]/50 focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10 appearance-none";

  return (
    <div id="availability-editor" className="space-y-4">

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Day</label>
          <select value={newSlot.dayOfWeek} onChange={(e) => setNewSlot((s) => ({ ...s, dayOfWeek: e.target.value as DayOfWeek }))} className={inputClass}>
            {DAYS.map((d) => (<option key={d} value={d}>{DAY_SHORT[d]}</option>))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Start</label>
          <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot((s) => ({ ...s, startTime: e.target.value }))} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">End</label>
          <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot((s) => ({ ...s, endTime: e.target.value }))} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-0.5">
          <input type="checkbox" checked={newSlot.isRecurring} onChange={(e) => setNewSlot((s) => ({ ...s, isRecurring: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-[#1E5BFF] focus:ring-[#1E5BFF]/30" />
          <span className="text-xs text-gray-600 font-medium">Recurring</span>
        </label>
        <button id="add-availability-btn" onClick={handleAdd} disabled={isPending} className="rounded-xl bg-[#1E5BFF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1546CC] disabled:opacity-50 transition-all shadow-md shadow-[#1E5BFF]/20 hover:ring-2 hover:ring-[#1E5BFF]/30 hover:ring-offset-2 hover:ring-offset-white">
          {isPending ? "Adding..." : "Add Slot"}
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8 font-medium">No availability slots configured</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot.id} className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E5BFF]/10 text-[10px] font-bold text-[#1E5BFF]">{DAY_SHORT[slot.dayOfWeek]}</span>
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">{slot.startTime} — {slot.endTime}</p>
                  {slot.isRecurring && <p className="text-[10px] text-gray-400 font-medium">Recurring weekly</p>}
                </div>
              </div>
              <button onClick={() => handleRemove(slot.id)} className="rounded-lg p-1.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
