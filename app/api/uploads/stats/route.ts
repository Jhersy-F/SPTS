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

    // Allow both instructors and students to view upload statistics
    if (session.user.role !== 'instructor' && session.user.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get upload counts by type
    const uploadStats = await prisma.upload.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    // Transform the data to include all types (quiz, activity, exam) even if count is 0
    const types = ['quiz', 'activity', 'exam'];
    const stats = types.map(type => {
      const found = uploadStats.find(stat => stat.type.toLowerCase() === type);
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: found ? found._count.id : 0,
      };
    });

    // Also get total count
    const totalUploads = await prisma.upload.count();

    return NextResponse.json({ 
      stats,
      total: totalUploads
    });
  } catch (error) {
    console.error('Upload stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
