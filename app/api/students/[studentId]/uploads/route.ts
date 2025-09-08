import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const studentId = parseInt(params.studentId);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Get subjectId from query params if provided
    const { searchParams } = new URL(request.url);
    const subjectIdParam = searchParams.get('subjectId');
    const subjectId = subjectIdParam ? parseInt(subjectIdParam) : undefined;

    // Build the where clause
    const where: {
      studentId: number;
      subjectID?: number;
    } = { studentId };
    
    if (subjectId) {
      if (isNaN(subjectId)) {
        return NextResponse.json(
          { error: 'Invalid subject ID' },
          { status: 400 }
        );
      }
      where.subjectID = subjectId;
    }

    // Get uploads for this student (and optionally filtered by subject)
    const uploads = await prisma.upload.findMany({
      where,
      select: {
        id: true,
        title: true,
        link: true,
        type: true,
        subject: {
          select: {
        
            title: true,
          },
        },
      },
      orderBy: {
        title: 'desc',
      },
    });

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching student uploads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
