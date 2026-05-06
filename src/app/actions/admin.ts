"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/types";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    await ensureAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Update user role error:", err);
    return { error: err.message || "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await ensureAdmin();

    // Prevent self-deletion
    const session = await auth();
    if (userId === session?.user.id) {
      return { error: "You cannot delete your own admin account" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Delete user error:", err);
    return { error: err.message || "Failed to delete user" };
  }
}

export async function getGlobalStats() {
  try {
    await ensureAdmin();

    const [totalUsers, totalBookings, completedBookings, lecturersCount] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "LECTURER" } }),
    ]);

    return {
      totalUsers,
      totalBookings,
      completedBookings,
      lecturersCount,
    };
  } catch (err) {
    return null;
  }
}
