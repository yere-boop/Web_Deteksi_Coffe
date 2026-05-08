import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { getGlobalStats } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, allUsers] = await Promise.all([
    getGlobalStats(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      }
    }),
  ]);

  return (
    <AdminDashboardClient 
      user={session.user} 
      stats={stats || { totalUsers: 0, totalBookings: 0, completedBookings: 0, lecturersCount: 0 }} 
      initialUsers={allUsers.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
    />
  );
}
