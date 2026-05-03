import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingCard } from "@/components/BookingCard";
import { BookingForm } from "@/components/BookingForm";
import { HistoryTable } from "@/components/HistoryTable";
import { LogoutButton } from "@/components/LogoutButton";

import { GridPattern } from "@/components/ui/grid-pattern";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "LECTURER") redirect("/dashboard/lecturer");
  if (session.user.role === "ADMIN") redirect("/dashboard/admin");

  const studentId = session.user.id;

  const [upcomingBookings, lecturers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        studentId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        student: { select: { id: true, name: true, email: true, department: true } },
        lecturer: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "LECTURER" },
      select: { id: true, name: true, department: true },
    }),
  ]);

  // For each booking, fetch its position in the lecturer's queue
  const bookingsWithPosition = await Promise.all(
    upcomingBookings.map(async (booking) => {
      const queue = await prisma.booking.findMany({
        where: {
          lecturerId: booking.lecturerId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { priorityScore: "desc" },
        select: { id: true },
      });
      const position = queue.findIndex((b) => b.id === booking.id) + 1;
      return { ...booking, queuePosition: position, totalInQueue: queue.length };
    })
  );

  return (
    <div className="relative min-h-screen bg-[#F5F5F5] text-[#1A1A1A] selection:bg-[#1E5BFF]/20 overflow-hidden">
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
        ]}
        className="[mask-image:radial-gradient(800px_circle_at_top,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />
      
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#1E5BFF]/10 blur-[150px] rounded-full pointer-events-none fixed" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E5BFF]/10 text-[#1E5BFF]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              </div>
              <h1 className="font-bold tracking-tight">AcadConsult</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">{session.user.name}</span>
              <span className="rounded-full bg-[#5A2D82]/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#5A2D82] uppercase">Student</span>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

      <main className="mx-auto max-w-7xl px-6 py-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Consultations */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Upcoming Consultations</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Your scheduled sessions, sorted by date</p>
                </div>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#1E5BFF]/10 px-2 text-xs font-bold text-[#1E5BFF]">
                  {bookingsWithPosition.length}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {bookingsWithPosition.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No upcoming consultations</p>
                  <p className="text-xs text-gray-400 mt-1">Book one using the form on the right →</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingsWithPosition.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      {...booking as any}
                      scheduledAt={booking.scheduledAt.toISOString()}
                      viewerRole="STUDENT"
                      queuePosition={booking.queuePosition}
                      totalInQueue={booking.totalInQueue}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Session History */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <HistoryTable studentId={studentId} />
            </div>
          </section>
        </div>

        {/* Right sidebar - Booking Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Book New Consultation</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details to request a session</p>
            </div>
            <BookingForm lecturers={lecturers} />
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
