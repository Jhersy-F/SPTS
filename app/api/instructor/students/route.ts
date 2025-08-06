import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    // Get all students with their uploads
    const students = await prisma.student.findMany({
      include: {
        uploads: true,
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
