import { z } from "zod";

export const createBookingSchema = z.object({
  lecturerId: z.string().cuid(),
  topicCategory: z.enum([
    "THESIS",
    "COURSEWORK",
    "EXAM_PREP",
    "PROJECT",
    "CAREER_GUIDANCE",
    "ACADEMIC_ADVISING",
    "RESEARCH",
    "OTHER",
  ]),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  scheduledAt: z.string().datetime(),
  description: z.string().max(2000).optional(),
  examDate: z.string().datetime().nullable().optional(),
  consultationMode: z.enum(["ONLINE", "OFFLINE"]).default("OFFLINE"),
  location: z.string().max(255).optional(),
});

export const updateBookingSchema = z.object({
  id: z.string().cuid(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  scheduledAt: z.string().datetime().optional(),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export const createSessionSchema = z.object({
  bookingId: z.string().cuid(),
  durationMin: z.number().int().min(1).max(480),
  lecturerNotes: z.string().max(5000).optional(),
  followUpFlag: z.boolean(),
  outcome: z.enum(["RESOLVED", "FOLLOW_UP_NEEDED", "REFERRED", "CANCELLED"]),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  isRecurring: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
