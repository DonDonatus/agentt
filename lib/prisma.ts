import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export { prisma };
