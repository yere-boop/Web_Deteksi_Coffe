import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const tursoUrl = process.env.TURSO_URL;
  
  // If we are building on Vercel, use a standard PrismaClient to avoid adapter errors
  // The adapter is only needed at runtime to connect to Turso.
  if (process.env.VERCEL === "1" && !process.env.TURSO_URL) {
     return new PrismaClient();
  }

  if (tursoUrl?.startsWith("libsql://")) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });
      // @ts-ignore
      const adapter = new PrismaLibSql(libsql as any);
      // @ts-ignore
      return new PrismaClient({ adapter });
    } catch (e) {
      console.error("Failed to initialize Turso adapter:", e);
      return new PrismaClient();
    }
  }

  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
