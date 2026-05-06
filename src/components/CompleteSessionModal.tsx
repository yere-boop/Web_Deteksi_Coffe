"use client";

import { useState } from "react";
import { completeSession } from "@/app/actions/session";
import type { SessionOutcome } from "@/lib/types";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  X, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface CompleteSessionModalProps {
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

import { useToast } from "@/components/ui/toast-provider";

export function CompleteSessionModal({ bookingId, onClose, onSuccess }: CompleteSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    durationMin: 30,
    lecturerNotes: "",
    followUpFlag: false,
    outcome: "RESOLVED" as SessionOutcome,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await completeSession({
      bookingId,
      ...formData,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast(result.error, "error");
    } else {
      toast("Consultation session completed!", "success");
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight leading-none">Complete Session</h3>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Finalize Consultation</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-xs font-bold text-red-700 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="h-3 w-3" /> Duration (Minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                max="300"
                value={formData.durationMin}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMin: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Outcome
              </label>
              <select
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as SessionOutcome }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-semibold appearance-none"
              >
                <option value="RESOLVED">Resolved</option>
                <option value="FOLLOW_UP_NEEDED">Follow-up Needed</option>
                <option value="REFERRED">Referred</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lecturer Notes</label>
              <textarea
                value={formData.lecturerNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, lecturerNotes: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-semibold min-h-[100px] resize-none"
                placeholder="Summary of the consultation..."
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={formData.followUpFlag}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpFlag: e.target.checked }))}
                  className="peer h-5 w-5 rounded-md border-2 border-gray-300 bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer appearance-none"
                />
                <CheckCircle2 className="absolute h-3.5 w-3.5 text-white scale-0 peer-checked:scale-100 transition-transform left-0.5 top-0.5 pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-700">Follow-up Required</span>
                <span className="text-[10px] text-gray-400">Mark if student needs another session</span>
              </div>
            </label>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Finish & Save <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
