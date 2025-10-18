import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { sectionId: string; studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the section exists and belongs to the instructor
    const section = await prisma.section.findUnique({
      where: { id: parseInt(params.sectionId) },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(params.studentId) },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Remove student from section
    await prisma.studentSection.delete({
      where: {
        sectionId_studentId: {
          sectionId: section.id,
          studentId: student.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing student from section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
