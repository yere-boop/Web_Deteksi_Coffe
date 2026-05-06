import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LecturerDashboardClient } from "@/components/LecturerDashboardClient";

export default async function LecturerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const lecturerId = session.user.id;

  const [availability, upcomingBookings, completedCount, totalCount] = await Promise.all([
    prisma.availability.findMany({
      where: { lecturerId },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        lecturerId,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      },
      include: {
        student: { select: { id: true, name: true, email: true, department: true } },
        lecturer: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.booking.count({
      where: { lecturerId, status: "COMPLETED" }
    }),
    prisma.booking.count({
      where: { lecturerId }
    })
  ]);

  const stats = {
    upcoming: upcomingBookings.length,
    completed: completedCount,
    total: totalCount,
  };

  const formattedBookings = upcomingBookings.map(b => ({
    ...b,
    scheduledAt: b.scheduledAt.toISOString()
  }));

  return (
    <LecturerDashboardClient 
      user={session.user} 
      availability={availability} 
      upcomingBookings={formattedBookings} 
      stats={stats}
    />
  );
}
