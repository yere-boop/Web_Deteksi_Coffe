"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Clock, 
  Settings, 
  GraduationCap, 
  Bell, 
  Calendar,
  ListOrdered
} from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { LogoutButton } from "@/components/LogoutButton";
import { BookingCard } from "@/components/BookingCard";
import { QueueList } from "@/components/QueueList";
import { AvailabilityEditor } from "@/components/AvailabilityEditor";
import { HistoryTable } from "@/components/HistoryTable";
import { SettingsForm } from "@/components/SettingsForm";
import { GridPattern } from "@/components/ui/grid-pattern";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface LecturerDashboardClientProps {
  user: any;
  availability: any[];
  upcomingBookings: any[];
  stats: {
    upcoming: number;
    completed: number;
    total: number;
  };
}

export function LecturerDashboardClient({ user, availability, upcomingBookings, stats }: LecturerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "settings">("overview");

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#1A1A1A] selection:bg-[#1E5BFF]/20 overflow-hidden">
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
        ]}
        className="[mask-image:radial-gradient(800px_circle_at_top,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />
      
      <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-[#1E5BFF]/5 blur-[150px] rounded-full pointer-events-none fixed" />
      <div className="absolute bottom-[-15%] left-[5%] w-[400px] h-[400px] bg-[#5A2D82]/5 blur-[120px] rounded-full pointer-events-none fixed" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E5BFF] text-white shadow-lg shadow-[#1E5BFF]/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tighter text-[#1A1A1A] leading-none uppercase">UNKLAB</h1>
                <p className="text-[11px] font-bold text-[#1E5BFF] tracking-widest uppercase mt-0.5">AcadConsult</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                <div className="h-2 w-2 rounded-full bg-[#1E5BFF]" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lecturer Portal</span>
              </div>
              <NotificationDropdown />
              <div className="w-px h-6 bg-gray-200" />
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 grid gap-8 lg:grid-cols-12">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileCard 
              name={user.name || "Lecturer"} 
              role={user.role || "LECTURER"} 
              department={user.department} 
              stats={stats}
            />
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "overview" 
                  ? "bg-[#1E5BFF] text-white shadow-lg shadow-[#1E5BFF]/20" 
                  : "text-gray-500 hover:bg-white hover:text-[#1E5BFF]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "history" 
                  ? "bg-[#1E5BFF] text-white shadow-lg shadow-[#1E5BFF]/20" 
                  : "text-gray-500 hover:bg-white hover:text-[#1E5BFF]"
                }`}
              >
                <Clock className="h-4 w-4" />
                Riwayat Sesi
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "settings" 
                  ? "bg-[#1E5BFF] text-white shadow-lg shadow-[#1E5BFF]/20" 
                  : "text-gray-500 hover:bg-white hover:text-[#1E5BFF]"
                }`}
              >
                <Settings className="h-4 w-4" />
                Pengaturan
              </button>
            </nav>

            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 text-white shadow-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Mengajar</p>
              <h4 className="text-xs font-bold mb-3">Tersedia untuk Konsultasi</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Online</span>
              </div>
            </div>
          </aside>

          {/* Center Content */}
          <div className="lg:col-span-6 space-y-6">
            {activeTab === "overview" && (
              <>
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">Upcoming Consultations</h2>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sesi yang perlu disetujui atau akan datang</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E5BFF] text-white text-xs font-black shadow-md">
                      {upcomingBookings.length}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {upcomingBookings.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 p-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                          <Calendar className="h-6 w-6 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400">Tidak ada jadwal terdekat</h4>
                        <p className="text-[11px] text-gray-400 mt-1">Mahasiswa yang memesan akan muncul di sini.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <BookingCard
                            key={booking.id}
                            {...booking}
                            viewerRole="LECTURER"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <ListOrdered className="h-5 w-5 text-[#1E5BFF]" />
                        <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">Priority Queue</h2>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Antrean mahasiswa berdasarkan skor prioritas</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <QueueList lecturerId={user.id} />
                  </div>
                </section>
              </>
            )}

            {activeTab === "history" && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden p-6">
                <HistoryTable userId={user.id} userRole="LECTURER" />
              </section>
            )}

            {activeTab === "settings" && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden p-8">
                <SettingsForm user={user} />
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden sticky top-24">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">Availability</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Atur jadwal ketersediaan Anda</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="p-6">
                <AvailabilityEditor initialSlots={availability} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
