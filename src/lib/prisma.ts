import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Ensure Prisma connection is established
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Test database connection on initialization (non-blocking)
prisma.$connect().catch((error) => {
  console.error("[prisma] Failed to connect to database:", error);
  // Don't throw - let individual queries handle connection errors
});
