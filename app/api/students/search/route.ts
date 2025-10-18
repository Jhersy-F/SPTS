import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    console.log('Search query:', query);

    if (!query) {
      console.log('No query provided, returning empty array');
      return NextResponse.json([]);
    }

    // Split the query into parts for name searches
    const queryParts = query.split(' ').filter(Boolean);
    const firstName = queryParts[0] || '';
    const lastName = queryParts[1] || queryParts[0] || '';

    // Using raw SQL for MariaDB/MySQL
    const searchPattern = `%${query}%`;
    const firstNamePattern = `%${firstName}%`;
    const lastNamePattern = `%${lastName}%`;

    const students = await prisma.$queryRaw`
      SELECT 
        id, 
        firstName, 
        middleName, 
        lastName, 
        extensionName, 
        studentNumber
      FROM Student
      WHERE 
        LOWER(firstName) LIKE LOWER(${searchPattern}) OR
        LOWER(lastName) LIKE LOWER(${searchPattern}) OR
        LOWER(studentNumber) LIKE LOWER(${searchPattern}) OR
        (LOWER(firstName) LIKE LOWER(${firstNamePattern}) AND 
         LOWER(lastName) LIKE LOWER(${lastNamePattern}))
      LIMIT 10
    `;

    console.log('Found students:', students);
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error in search endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to search students', 
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
