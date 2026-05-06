"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { createBooking } from "@/app/actions/booking";
import type { TopicCategory, UrgencyLevel } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Video,
  MapPin,
  FileUp,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lecturer {
  id: string;
  name: string;
  department: string | null;
}

interface BookingFormProps {
  lecturers: Lecturer[];
  onSuccess?: () => void;
}

const TOPICS: { value: TopicCategory; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { value: "THESIS", label: "Skripsi / Thesis", icon: "📝", color: "blue", desc: "Konsultasi tugas akhir atau tesis" },
  { value: "COURSEWORK", label: "Tugas Kuliah", icon: "📚", color: "emerald", desc: "Diskusi tugas harian atau proyek kelas" },
  { value: "EXAM_PREP", label: "Persiapan Ujian", icon: "📖", color: "orange", desc: "Review materi sebelum ujian" },
  { value: "PROJECT", label: "Proyek", icon: "💻", color: "purple", desc: "Konsultasi proyek penelitian atau lomba" },
  { value: "CAREER_GUIDANCE", label: "Karir", icon: "🎯", color: "rose", desc: "Bimbingan karir dan masa depan" },
  { value: "ACADEMIC_ADVISING", label: "Akademik", icon: "🎓", color: "amber", desc: "Konsultasi KRS atau masalah akademik" },
  { value: "RESEARCH", label: "Penelitian", icon: "🔬", color: "cyan", desc: "Diskusi metodologi atau publikasi" },
  { value: "OTHER", label: "Lainnya", icon: "📋", color: "slate", desc: "Topik lainnya yang belum tersedia" },
];

const URGENCIES: { value: UrgencyLevel; label: string; desc: string; color: string; bg: string; dot: string }[] = [
  { value: "LOW", label: "Low", desc: "Bisa menunggu", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  { value: "MEDIUM", label: "Medium", desc: "Cukup penting", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  { value: "HIGH", label: "High", desc: "Mendesak", color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  { value: "CRITICAL", label: "Critical", desc: "Sangat mendesak", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
];

export function BookingForm({ lecturers, onSuccess }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    lecturerId: "",
    lecturerName: "",
    topicCategory: "" as TopicCategory | "",
    urgencyLevel: "MEDIUM" as UrgencyLevel,
    description: "",
    consultationMode: "OFFLINE" as "ONLINE" | "OFFLINE",
    location: "",
  });
  
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState<string>("09:00");
  const [examDateObj, setExamDateObj] = useState<Date>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter lecturers based on search
  const filteredLecturers = useMemo(() => {
    if (!lecturerSearch.trim()) return lecturers.slice(0, 5);
    const q = lecturerSearch.toLowerCase();
    return lecturers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.department && l.department.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [lecturers, lecturerSearch]);

  // Estimated priority score preview
  const estimatedPriority = useMemo(() => {
    const urgencyWeights: Record<UrgencyLevel, number> = { LOW: 0.1, MEDIUM: 0.4, HIGH: 0.7, CRITICAL: 1.0 };
    const urgencyScore = urgencyWeights[formData.urgencyLevel] * 0.3;
    let examScore = 0;
    if (examDateObj && scheduledDate) {
      const diffMs = examDateObj.getTime() - scheduledDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 0) examScore = 1.0;
      else if (diffDays <= 3) examScore = 0.9;
      else if (diffDays <= 7) examScore = 0.7;
      else if (diffDays <= 14) examScore = 0.4;
      else if (diffDays <= 30) examScore = 0.2;
      else examScore = 0.05;
      examScore *= 0.4;
    }
    return Math.round((urgencyScore + examScore) * 1000) / 1000;
  }, [formData.urgencyLevel, examDateObj, scheduledDate]);

  const priorityLevel = estimatedPriority >= 0.5 ? "High" : estimatedPriority >= 0.2 ? "Medium" : "Low";
  const priorityColor = estimatedPriority >= 0.5 ? "bg-orange-500" : estimatedPriority >= 0.2 ? "bg-blue-500" : "bg-emerald-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.lecturerId || !formData.topicCategory || !scheduledDate) {
      setError("Mohon lengkapi data wajib (Dosen, Topik, dan Jadwal).");
      setStep(1);
      return;
    }

    const finalScheduledAt = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(":");
    finalScheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (finalScheduledAt < new Date()) {
      setError("Jadwal tidak boleh di masa lalu.");
      return;
    }

    startTransition(async () => {
      try {
        await createBooking({
          lecturerId: formData.lecturerId,
          topicCategory: formData.topicCategory as TopicCategory,
          urgencyLevel: formData.urgencyLevel,
          scheduledAt: finalScheduledAt.toISOString(),
          description: formData.description || undefined,
          examDate: examDateObj ? examDateObj.toISOString() : null,
          consultationMode: formData.consultationMode,
          location: formData.location || undefined,
        });
        setSuccess(true);
        // Reset form
        setFormData({ 
          lecturerId: "", 
          lecturerName: "", 
          topicCategory: "", 
          urgencyLevel: "MEDIUM", 
          description: "", 
          consultationMode: "OFFLINE", 
          location: "" 
        });
        setScheduledDate(undefined);
        setExamDateObj(undefined);
        setStep(1);
        setTimeout(() => setSuccess(false), 5000);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat booking");
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const inputClass = "w-full rounded-2xl border border-white/20 bg-white/40 backdrop-blur-md px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 outline-none transition-all focus:border-[#1E5BFF]/50 focus:bg-white focus:ring-4 focus:ring-[#1E5BFF]/10 shadow-sm";

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-white/80 to-white/40 p-1 shadow-2xl backdrop-blur-xl border border-white/50">
      {/* Background Decor with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#1E5BFF]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  step === i ? "w-8 bg-[#1E5BFF]" : "w-4 bg-gray-200"
                )} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Step {step} of 3
          </span>
        </div>

        {/* Step 1: Lecturer & Topic */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Dosen & Topik
              </h3>
              <p className="text-xs text-gray-500">Pilih dosen pembimbing dan topik yang ingin dibahas.</p>
            </div>

            {/* Lecturer Search */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Dosen Pembimbing</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={formData.lecturerId ? formData.lecturerName : lecturerSearch}
                  onChange={(e) => {
                    setLecturerSearch(e.target.value);
                    if (formData.lecturerId) setFormData(f => ({ ...f, lecturerId: "", lecturerName: "" }));
                    setShowLecturerDropdown(true);
                  }}
                  onFocus={() => setShowLecturerDropdown(true)}
                  placeholder="Cari dosen..."
                  className={cn(
                    inputClass, 
                    "pl-11 pr-10",
                    formData.lecturerId && "border-emerald-300 bg-emerald-50/50 shadow-emerald-100"
                  )}
                />
                {formData.lecturerId && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
                
                {showLecturerDropdown && !formData.lecturerId && (
                  <div className="absolute z-50 top-full mt-2 w-full overflow-hidden rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredLecturers.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-400 italic">Dosen tidak ditemukan</p>
                      </div>
                    ) : (
                      filteredLecturers.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            setFormData(f => ({ ...f, lecturerId: l.id, lecturerName: l.name }));
                            setLecturerSearch("");
                            setShowLecturerDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#1E5BFF]/5 transition-all flex items-center gap-3 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg">
                            {l.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{l.name}</p>
                            <p className="text-[10px] text-gray-500">{l.department || "General Department"}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Topic Tiles */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Topik Konsultasi</label>
              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, topicCategory: t.value }))}
                    className={cn(
                      "relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left group",
                      formData.topicCategory === t.value 
                        ? "border-[#1E5BFF] bg-[#1E5BFF]/5 ring-2 ring-[#1E5BFF]/10" 
                        : "border-white/50 bg-white/20 hover:border-gray-300 hover:bg-white/50 shadow-sm"
                    )}
                  >
                    <span className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">{t.icon}</span>
                    <p className={cn("text-xs font-bold", formData.topicCategory === t.value ? "text-[#1E5BFF]" : "text-gray-700")}>{t.label}</p>
                    <p className="text-[9px] text-gray-400 mt-1 line-clamp-1">{t.desc}</p>
                    {formData.topicCategory === t.value && (
                      <div className="absolute top-2 right-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1E5BFF] animate-ping" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!formData.lecturerId || !formData.topicCategory}
              onClick={nextStep}
              className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              Lanjutkan
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Step 2: Schedule & Mode */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Jadwal & Mode
              </h3>
              <p className="text-xs text-gray-500">Tentukan kapan dan bagaimana konsultasi akan dilakukan.</p>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Mode Konsultasi</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, consultationMode: "OFFLINE" }))}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 space-y-2",
                    formData.consultationMode === "OFFLINE"
                      ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/5"
                      : "border-white/50 bg-white/20 hover:bg-white/40"
                  )}
                >
                  <MapPin className={cn("h-6 w-6", formData.consultationMode === "OFFLINE" ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-xs font-bold", formData.consultationMode === "OFFLINE" ? "text-blue-700" : "text-gray-600")}>Offline</span>
                  <span className="text-[9px] text-gray-400">Tatap Muka</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, consultationMode: "ONLINE" }))}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 space-y-2",
                    formData.consultationMode === "ONLINE"
                      ? "border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5"
                      : "border-white/50 bg-white/20 hover:bg-white/40"
                  )}
                >
                  <Video className={cn("h-6 w-6", formData.consultationMode === "ONLINE" ? "text-indigo-500" : "text-gray-400")} />
                  <span className={cn("text-xs font-bold", formData.consultationMode === "ONLINE" ? "text-indigo-700" : "text-gray-600")}>Online</span>
                  <span className="text-[9px] text-gray-400">Video Call</span>
                </button>
              </div>
            </div>

            {/* Location / Link */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                {formData.consultationMode === "ONLINE" ? "Link Meeting (Opsional)" : "Usulan Ruangan (Opsional)"}
              </label>
              <div className="relative">
                {formData.consultationMode === "ONLINE" ? <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> : <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                  placeholder={formData.consultationMode === "ONLINE" ? "Zoom/GMeet link..." : "Contoh: Lab 201, Ruang Dosen..."}
                  className={cn(inputClass, "pl-11")}
                />
              </div>
            </div>

            {/* Date & Time Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tanggal</label>
                <Popover>
                <PopoverTrigger className={cn(inputClass, "flex items-center gap-2 text-left", !scheduledDate && "text-gray-400")}>
                  <CalendarIcon className="h-4 w-4 text-[#1E5BFF]" />
                  {scheduledDate ? format(scheduledDate, "dd MMM") : "Pilih"}
                </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white shadow-2xl rounded-2xl border-none" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      className="rounded-2xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Waktu</label>
                <Popover>
                  <PopoverTrigger className={cn(inputClass, "flex items-center gap-3 text-left")}>
                    <Clock className="h-4 w-4 text-[#1E5BFF]" />
                    <span className="font-bold text-[#1A1A1A]">{scheduledTime}</span>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white shadow-2xl rounded-3xl border-none" align="start">
                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
                      {Array.from({ length: 11 * 4 }, (_, i) => {
                        const hour = Math.floor(i / 4) + 8;
                        const minute = (i % 4) * 15;
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setScheduledTime(time)}
                            className={cn(
                              "py-2 rounded-xl text-[11px] font-bold transition-all",
                              scheduledTime === time 
                                ? "bg-[#1E5BFF] text-white shadow-lg shadow-[#1E5BFF]/20" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-[#1E5BFF]"
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                disabled={!scheduledDate}
                onClick={nextStep}
                className="flex-1 h-12 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
              >
                Lanjutkan
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Urgency & Description */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Detail & Urgensi
              </h3>
              <p className="text-xs text-gray-500">Berikan detail masalah dan tingkat kepentingan konsultasi.</p>
            </div>

            {/* Urgency Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tingkat Urgensi</label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCIES.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, urgencyLevel: u.value }))}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
                      formData.urgencyLevel === u.value
                        ? "border-gray-800 bg-gray-900 text-white shadow-xl shadow-black/10 scale-[1.02]"
                        : "border-white/50 bg-white/20 hover:bg-white/50 text-gray-600"
                    )}
                  >
                    <div className={cn("h-2 w-2 rounded-full", u.dot)} />
                    <div className="text-left">
                      <p className="text-xs font-bold">{u.label}</p>
                      <p className={cn("text-[8px] opacity-60", formData.urgencyLevel === u.value ? "text-gray-300" : "text-gray-400")}>{u.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Date (Priority Booster) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Deadline / Tanggal Ujian</label>
              <Popover>
              <PopoverTrigger className={cn(inputClass, "flex items-center gap-2 text-left", !examDateObj && "text-gray-400")}>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                {examDateObj ? format(examDateObj, "dd MMM yyyy") : "Pilih jika ada tenggat waktu (Opsional)"}
              </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-2xl rounded-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={examDateObj}
                    onSelect={setExamDateObj}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[9px] text-gray-400 flex items-center gap-1 pl-1">
                <Info className="h-3 w-3" />
                Mendekati deadline akan meningkatkan antrian Anda.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi</label>
                <span className="text-[9px] text-gray-400 font-medium">{formData.description.length}/500</span>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value.slice(0, 500) }))}
                rows={3}
                placeholder="Apa yang ingin Anda tanyakan..."
                className={cn(inputClass, "resize-none py-4")}
              />
            </div>

            {/* File Zone Placeholder */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:border-[#1E5BFF] hover:bg-[#1E5BFF]/5 transition-all"
            >
              <FileUp className="h-6 w-6 text-gray-400 group-hover:text-[#1E5BFF] transition-colors" />
              <p className="text-[10px] font-bold text-gray-500 group-hover:text-[#1E5BFF]">Lampirkan Berkas (PDF/DOC)</p>
              <p className="text-[8px] text-gray-300">Maksimal 5MB • Simulasi</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" />
            </div>

            {/* Final Action */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", priorityColor)} 
                    style={{ width: `${Math.max(estimatedPriority * 100, 10)}%` }} 
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400">ESTIMASI PRIORITAS</p>
                  <p className={cn("text-xs font-black uppercase", priorityLevel === "High" ? "text-orange-500" : "text-blue-500")}>{priorityLevel}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  id="booking-submit-btn"
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-12 rounded-2xl bg-[#1E5BFF] text-white font-bold text-sm shadow-xl shadow-[#1E5BFF]/20 hover:shadow-2xl hover:shadow-[#1E5BFF]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  {isPending ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Konfirmasi Booking</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message overlay */}
        {success && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl animate-in fade-in duration-500">
            <div className="text-center space-y-4 p-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="text-2xl font-black text-gray-800">Booking Berhasil!</h4>
              <p className="text-sm text-gray-500">Permintaan Anda telah dikirim ke sistem antrian dosen.</p>
              <button 
                type="button"
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-black transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-100 animate-in shake-in duration-300">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-[11px] text-red-600 font-bold">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
