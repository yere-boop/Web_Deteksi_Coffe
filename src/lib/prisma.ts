import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  // Use TURSO_URL for cloud deployment, fallback to DATABASE_URL or local sqlite
  const tursoUrl = process.env.TURSO_URL;
  
  if (tursoUrl?.startsWith("libsql://")) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }

  // Fallback for local development
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
