import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// For connection poolers (like Supabase pgbouncer), ensure proper configuration
const databaseUrl = process.env.DATABASE_URL || "";
const isPooler = databaseUrl.includes("pooler.supabase.com") || databaseUrl.includes("pgbouncer=true");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // For connection poolers, add connection_limit to prevent prepared statement conflicts
    ...(isPooler && {
      datasources: {
        db: {
          url: databaseUrl.includes("?") 
            ? `${databaseUrl}&connection_limit=1&pool_timeout=20`
            : `${databaseUrl}?connection_limit=1&pool_timeout=20`,
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
