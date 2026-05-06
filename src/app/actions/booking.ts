"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { priorityScore } from "@/lib/priority";
import {
  createBookingSchema,
  updateBookingSchema,
  createSessionSchema,
  availabilitySchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { UrgencyLevel } from "@/lib/types";
import { z } from "zod";

async function getBookingsInLast7Days(studentId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return prisma.booking.count({
    where: {
      studentId,
      createdAt: { gte: sevenDaysAgo },
      status: { not: "CANCELLED" },
    },
  });
}

async function recalculateScore(
  studentId: string,
  scheduledAt: string,
  urgencyLevel: UrgencyLevel,
  examDate: string | null
): Promise<number> {
  const bookingsInLast7Days = await getBookingsInLast7Days(studentId);

  return priorityScore({
    examDate,
    scheduledAt,
    urgencyLevel,
    bookingsInLast7Days,
    lecturerFlagged: false,
  });
}

export async function createBooking(input: z.infer<typeof createBookingSchema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized: Only students can create bookings");
  }

  const validated = createBookingSchema.parse(input);

  const score = await recalculateScore(
    session.user.id,
    validated.scheduledAt,
    validated.urgencyLevel,
    validated.examDate ?? null
  );

  const booking = await prisma.booking.create({
    data: {
      studentId: session.user.id,
      lecturerId: validated.lecturerId,
      topicCategory: validated.topicCategory,
      urgencyLevel: validated.urgencyLevel,
      priorityScore: score,
      scheduledAt: new Date(validated.scheduledAt),
      description: validated.description,
      consultationMode: validated.consultationMode,
      location: validated.location,
    },
    include: {
      student: { select: { id: true, name: true, email: true, department: true } },
      lecturer: { select: { id: true, name: true, email: true, department: true } },
    },
  });

  revalidatePath("/dashboard");
  return booking;
}

export async function updateBooking(input: z.infer<typeof updateBookingSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = updateBookingSchema.parse(input);

  const existing = await prisma.booking.findUnique({
    where: { id: validated.id },
  });

  if (!existing) throw new Error("Booking not found");

  if (
    session.user.role === "STUDENT" &&
    existing.studentId !== session.user.id
  ) {
    throw new Error("Forbidden");
  }

  if (
    session.user.role === "LECTURER" &&
    existing.lecturerId !== session.user.id
  ) {
    throw new Error("Forbidden");
  }

  const urgency = validated.urgencyLevel ?? (existing.urgencyLevel as UrgencyLevel);
  const scheduledAt = validated.scheduledAt
    ? new Date(validated.scheduledAt).toISOString()
    : existing.scheduledAt.toISOString();

  const score = await recalculateScore(
    existing.studentId,
    scheduledAt,
    urgency,
    null
  );

  const booking = await prisma.booking.update({
    where: { id: validated.id },
    data: {
      ...(validated.status && { status: validated.status }),
      ...(validated.scheduledAt && { scheduledAt: new Date(validated.scheduledAt) }),
      ...(validated.urgencyLevel && { urgencyLevel: validated.urgencyLevel }),
      priorityScore: score,
    },
    include: {
      student: { select: { id: true, name: true, email: true, department: true } },
      lecturer: { select: { id: true, name: true, email: true, department: true } },
    },
  });

  // Auto-create a Session record when marked as COMPLETED
  if (validated.status === "COMPLETED") {
    const existingSession = await prisma.session.findUnique({
      where: { bookingId: validated.id },
    });

    if (!existingSession) {
      await prisma.session.create({
        data: {
          bookingId: validated.id,
          durationMin: 30,
          outcome: "RESOLVED",
          lecturerNotes: null,
          followUpFlag: false,
        },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/lecturer");
  return booking;
}

export async function deleteBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!existing) throw new Error("Booking not found");

  if (
    session.user.role === "STUDENT" &&
    existing.studentId !== session.user.id
  ) {
    throw new Error("Forbidden");
  }

  if (session.user.role === "LECTURER") {
    throw new Error("Forbidden: Only students and admins can delete bookings");
  }

  await prisma.booking.delete({ where: { id: bookingId } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createSession(input: z.infer<typeof createSessionSchema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LECTURER") {
    throw new Error("Unauthorized: Only lecturers can create sessions");
  }

  const validated = createSessionSchema.parse(input);

  const booking = await prisma.booking.findUnique({
    where: { id: validated.bookingId },
  });

  if (!booking || booking.lecturerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const [consultSession] = await prisma.$transaction([
    prisma.session.create({
      data: {
        bookingId: validated.bookingId,
        durationMin: validated.durationMin,
        lecturerNotes: validated.lecturerNotes,
        followUpFlag: validated.followUpFlag,
        outcome: validated.outcome,
      },
    }),
    prisma.booking.update({
      where: { id: validated.bookingId },
      data: { status: "COMPLETED" },
    }),
  ]);

  revalidatePath("/dashboard");
  return consultSession;
}

export async function saveAvailability(
  input: z.infer<typeof availabilitySchema>
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LECTURER") {
    throw new Error("Unauthorized: Only lecturers can set availability");
  }

  const validated = availabilitySchema.parse(input);

  const availability = await prisma.availability.create({
    data: {
      lecturerId: session.user.id,
      dayOfWeek: validated.dayOfWeek,
      startTime: validated.startTime,
      endTime: validated.endTime,
      isRecurring: validated.isRecurring,
    },
  });

  revalidatePath("/dashboard/lecturer");
  return availability;
}

export async function deleteAvailability(availabilityId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LECTURER") {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!existing || existing.lecturerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.availability.delete({ where: { id: availabilityId } });

  revalidatePath("/dashboard/lecturer");
  return { success: true };
}

export async function recalculateQueueScores(lecturerId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (
    session.user.role === "LECTURER" &&
    session.user.id !== lecturerId
  ) {
    throw new Error("Forbidden");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      lecturerId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  const updates = await Promise.all(
    bookings.map(async (booking) => {
      const bookingsInLast7Days = await getBookingsInLast7Days(
        booking.studentId
      );
      const score = priorityScore({
        examDate: null,
        scheduledAt: booking.scheduledAt.toISOString(),
        urgencyLevel: booking.urgencyLevel as UrgencyLevel,
        bookingsInLast7Days,
        lecturerFlagged: false,
      });
      return prisma.booking.update({
        where: { id: booking.id },
        data: { priorityScore: score },
      });
    })
  );

  revalidatePath("/dashboard");
  return updates.length;
}
