import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { subjectId: string, sectionId: string, studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify section ownership
    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(params.sectionId),
        instructorSubject: {
          subjectId: parseInt(params.subjectId),
          instructorId: parseInt(session.user.id)
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found or access denied' },
        { status: 403 }
      );
    }

    // Remove student from section
    await prisma.studentSection.deleteMany({
      where: {
        studentId: parseInt(params.studentId),
        sectionId: parseInt(params.sectionId)
      }
    });

    return NextResponse.json({
      message: 'Student removed from section successfully'
    });

  } catch (error) {
    console.error('Error removing student from section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}