import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentDashboardClient } from "@/components/StudentDashboardClient";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "LECTURER") redirect("/dashboard/lecturer");
  if (session.user.role === "ADMIN") redirect("/dashboard/admin");

  const studentId = session.user.id;

  const [upcomingBookings, lecturers, completedCount, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        studentId,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
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
    prisma.booking.count({
      where: { studentId, status: "COMPLETED" }
    }),
    prisma.booking.count({
      where: { studentId }
    })
  ]);

  // Statistics
  const stats = {
    upcoming: upcomingBookings.length,
    completed: completedCount,
    total: totalCount,
  };

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
      return { 
        ...booking, 
        scheduledAt: booking.scheduledAt.toISOString(),
        queuePosition: position, 
        totalInQueue: queue.length 
      };
    })
  );

  return (
    <StudentDashboardClient 
      user={session.user} 
      upcomingBookings={bookingsWithPosition} 
      lecturers={lecturers}
      stats={stats}
    />
  );
}
