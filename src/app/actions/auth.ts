"use server";

import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "LECTURER"]).default("STUDENT"),
  department: z.string().optional(),
});

export async function registerUser(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validated = registerSchema.parse(rawData);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return { error: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        department: validated.department || null,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Registration error:", err);
    if (err?.name === "ZodError" || err instanceof z.ZodError) {
      const message = err.errors?.[0]?.message || err.issues?.[0]?.message || "Validation failed";
      return { error: message };
    }
    return { error: err.message || "An error occurred during registration" };
  }
}
