import { PrismaClient, Prisma } from '@prisma/client';

// Extend Prisma Client with custom methods if needed
export const prisma = new PrismaClient();

// Add error handling middleware
prisma.$use((params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<Prisma.PrismaPromise<unknown>>) => {
  try {
    return next(params);
  } catch (error) {
    console.error('Prisma error:', error);
    throw error;
  }
});
