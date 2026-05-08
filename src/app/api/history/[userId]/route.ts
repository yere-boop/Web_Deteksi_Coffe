import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  // Security check: Students/Lecturers can only view their own history.
  if (session.user.id !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where = {
    OR: [
      { studentId: userId },
      { lecturerId: userId }
    ],
    status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] },
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, department: true } },
        lecturer: { select: { id: true, name: true, email: true, department: true } },
        session: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  const formattedData = bookings.map((b) => ({
    id: b.id,
    durationMin: b.session?.durationMin ?? 0,
    lecturerNotes: b.session?.lecturerNotes ?? (b.status === "CONFIRMED" ? "Waiting for session to start" : null),
    followUpFlag: b.session?.followUpFlag ?? false,
    outcome: b.status === "CONFIRMED" ? "SCHEDULED" : (b.session?.outcome ?? "RESOLVED"),
    createdAt: b.updatedAt,
    booking: {
      scheduledAt: b.scheduledAt,
      topicCategory: b.topicCategory,
      urgencyLevel: b.urgencyLevel,
      lecturer: b.lecturer,
      student: b.student,
    },
  }));

  return Response.json({
    data: formattedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
