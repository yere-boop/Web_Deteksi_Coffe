import { UrgencyLevel } from "@/lib/types";

interface PriorityInput {
  examDate: string | null;
  scheduledAt: string;
  urgencyLevel: UrgencyLevel;
  bookingsInLast7Days: number;
  lecturerFlagged: boolean;
}

const URGENCY_WEIGHTS: Record<UrgencyLevel, number> = {
  LOW: 0.1,
  MEDIUM: 0.4,
  HIGH: 0.7,
  CRITICAL: 1.0,
};

const WEIGHTS = {
  examProximity: 0.4,
  urgency: 0.3,
  repeatPenalty: 0.15,
  lecturerFlag: 0.15,
} as const;

function computeExamProximity(
  examDate: string | null,
  scheduledAt: string
): number {
  if (!examDate) return 0;
  const diffMs =
    new Date(examDate).getTime() - new Date(scheduledAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 0) return 1.0;
  if (diffDays <= 3) return 0.9;
  if (diffDays <= 7) return 0.7;
  if (diffDays <= 14) return 0.4;
  if (diffDays <= 30) return 0.2;
  return 0.05;
}

function computeRepeatPenalty(bookingsInLast7Days: number): number {
  if (bookingsInLast7Days <= 3) return 0;
  const excess = bookingsInLast7Days - 3;
  return Math.min(excess * 0.25, 1.0);
}

export function priorityScore(input: PriorityInput): number {
  const examProximity = computeExamProximity(input.examDate, input.scheduledAt);
  const urgency = URGENCY_WEIGHTS[input.urgencyLevel];
  const repeatPenalty = computeRepeatPenalty(input.bookingsInLast7Days);
  const lecturerFlag = input.lecturerFlagged ? 1.0 : 0;

  const score =
    examProximity * WEIGHTS.examProximity +
    urgency * WEIGHTS.urgency -
    repeatPenalty * WEIGHTS.repeatPenalty +
    lecturerFlag * WEIGHTS.lecturerFlag;

  return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 1000;
}
