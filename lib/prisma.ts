import { PrismaClient } from '@prisma/client';

// Create Prisma client and attach a global error-logging extension
export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          console.error('Prisma error:', error);
          throw error;
        }
      },
    },
  },
});
