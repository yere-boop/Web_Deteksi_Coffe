"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional().nullable(),
});

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = updateProfileSchema.parse(rawData);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        department: validated.department || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/lecturer");
    
    return { success: true };
  } catch (err: any) {
    console.error("Update profile error:", err);
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message || "Validation error" };
    }
    return { error: "Failed to update profile" };
  }
}
