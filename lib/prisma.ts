import { PrismaClient } from '@prisma/client';

// Create Prisma client and attach a global error-logging middleware
export const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    console.error('Prisma error:', error);
    throw error;
  }
});
