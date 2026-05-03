import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QueueList } from "@/components/QueueList";
import { AvailabilityEditor } from "@/components/AvailabilityEditor";
import { GridPattern } from "@/components/ui/grid-pattern";
import { LogoutButton } from "@/components/LogoutButton";

export default async function LecturerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const lecturerId = session.user.id;

  const availability = await prisma.availability.findMany({
    where: { lecturerId },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="relative min-h-screen bg-[#F5F5F5] text-[#1A1A1A] selection:bg-[#1E5BFF]/20 overflow-hidden">
      <GridPattern
        squares={[
          [4, 4], [5, 1], [8, 2], [5, 3], [5, 5],
          [10, 10], [12, 15], [15, 10], [10, 15],
        ]}
        className="[mask-image:radial-gradient(800px_circle_at_top,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />
      
      <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-[#1E5BFF]/8 blur-[150px] rounded-full pointer-events-none fixed" />
      <div className="absolute bottom-[-15%] left-[5%] w-[400px] h-[400px] bg-[#5A2D82]/6 blur-[120px] rounded-full pointer-events-none fixed" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A2D82]/10 text-[#5A2D82]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
              </div>
              <h1 className="font-bold tracking-tight text-[#1A1A1A]">AcadConsult</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">{session.user.name}</span>
              <span className="rounded-full bg-[#5A2D82]/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#5A2D82] uppercase">Lecturer</span>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 grid gap-8 lg:grid-cols-3">
          {/* Priority Queue — takes 2/3 */}
          <div className="lg:col-span-2">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Priority Queue</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Student consultations ranked by priority score</p>
                </div>
              </div>
              <div className="p-6">
                <QueueList lecturerId={lecturerId} />
              </div>
            </section>
          </div>
          
          {/* Availability — right sidebar */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden sticky top-24">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Your Availability</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage your open consultation slots</p>
                </div>
              </div>
              <div className="p-6">
                <AvailabilityEditor initialSlots={availability as any} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
