import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL ?? "";
const isSupabasePooler =
  databaseUrl.includes("pooler.supabase.com") || databaseUrl.includes(":6543");

const normalizedDatabaseUrl =
  isSupabasePooler && !databaseUrl.includes("pgbouncer=true")
    ? `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}pgbouncer=true`
    : databaseUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    ...(normalizedDatabaseUrl && {
      datasources: {
        db: {
          url: normalizedDatabaseUrl,
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
