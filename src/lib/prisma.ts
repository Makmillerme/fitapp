import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    // Remote PgBouncer (6432): keep the client pool tiny in dev.
    max: process.env.NODE_ENV === "development" ? 1 : 8,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: true,
  });
}

function createPrismaClient(pool: Pool) {
  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function getPrismaClient() {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = createPool();
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(globalForPrisma.pool);
  }
  return globalForPrisma.prisma;
}

export async function resetPrismaPool() {
  const pool = globalForPrisma.pool;
  globalForPrisma.pool = undefined;
  globalForPrisma.prisma = undefined;
  if (pool) {
    await pool.end().catch(() => {});
  }
}

export const prisma = getPrismaClient();

function isPgBouncerTransientError(error: unknown): boolean {
  const err = error as {
    code?: string;
    message?: string;
    meta?: {
      driverAdapterError?: { message?: string; cause?: { originalCode?: string } };
    };
  };
  const message = [err.message, err.meta?.driverAdapterError?.message]
    .filter(Boolean)
    .join(" ");
  const driverCode = err.meta?.driverAdapterError?.cause?.originalCode;

  return (
    err.code === "P2039" ||
    driverCode === "08P01" ||
    message.includes("server_login_retry") ||
    message.includes("query_wait_timeout")
  );
}

function retryDelayMs(attempt: number) {
  return attempt * 1_000;
}

export async function withPgRetry<T>(
  operation: (client: PrismaClient) => Promise<T>,
  label: string,
): Promise<T> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = getPrismaClient();
    try {
      return await operation(client);
    } catch (error) {
      const retryable = isPgBouncerTransientError(error);
      if (!retryable || attempt === maxAttempts) {
        throw error;
      }
      await resetPrismaPool();
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelayMs(attempt));
      });
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[db] retry ${attempt}/${maxAttempts - 1} after transient PgBouncer error (${label})`,
        );
      }
    }
  }

  throw new Error(`withPgRetry exhausted attempts for ${label}`);
}
