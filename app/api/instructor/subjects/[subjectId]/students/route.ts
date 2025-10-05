import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  context:{ params:Promise<{subjectId:string }> }
) {
  const subjectIDRaw = (await context.params).subjectId
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'instructor') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const subjectId = parseInt(subjectIDRaw);
    if (isNaN(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Get all students who have uploaded documents for this subject
    const students = await prisma.student.findMany({
      where: {
        uploads: {
          some: {
            subjectID: subjectId
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        uploads: {
          where: {
            subjectID: subjectId
          },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            link: true,
     
          },
      
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students for subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
