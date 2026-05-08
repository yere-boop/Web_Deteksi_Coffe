import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lecturerId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lecturerId } = await params;

  const queue = await prisma.booking.findMany({
    where: {
      lecturerId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      student: { select: { id: true, name: true, email: true, department: true } },
    },
    orderBy: { priorityScore: "desc" },
  });

  return Response.json({ data: queue });
}
