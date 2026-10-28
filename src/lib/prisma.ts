import 'server-only';
import { PrismaClient } from '@prisma/client';

// The only Prisma client in the app. `server-only` makes `next build` fail if a client component ever imports
// this module (directly or through src/lib). Reused across hot reloads in dev to avoid connection exhaustion.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
