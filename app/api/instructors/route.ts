import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const instructors = await prisma.instructor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    return NextResponse.json({ instructors });
  } catch (error) {
    console.error('List instructors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
