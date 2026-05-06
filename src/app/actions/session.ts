"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { SessionOutcome } from "@/lib/types";

const completeSessionSchema = z.object({
  bookingId: z.string(),
  durationMin: z.number().min(1, "Duration must be at least 1 minute"),
  lecturerNotes: z.string().optional(),
  followUpFlag: z.boolean().default(false),
  outcome: z.string(),
});

export async function completeSession(data: {
  bookingId: string;
  durationMin: number;
  lecturerNotes?: string;
  followUpFlag: boolean;
  outcome: SessionOutcome;
}) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "LECTURER") {
      return { error: "Unauthorized" };
    }

    const validated = completeSessionSchema.parse(data);

    // Verify booking belongs to this lecturer
    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
    });

    if (!booking || booking.lecturerId !== session.user.id) {
      return { error: "Booking not found or access denied" };
    }

    // Use transaction to create session and update booking status
    await prisma.$transaction([
      prisma.session.create({
        data: {
          bookingId: validated.bookingId,
          durationMin: validated.durationMin,
          lecturerNotes: validated.lecturerNotes || null,
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
    revalidatePath("/dashboard/lecturer");
    
    return { success: true };
  } catch (err: any) {
    console.error("Complete session error:", err);
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message || "Validation error" };
    }
    return { error: "Failed to complete session" };
  }
}
