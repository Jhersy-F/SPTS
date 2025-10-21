import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { sectionId: string } }
) {
  // Get sectionId from context.params
  const sectionId = parseInt(context.params.sectionId);
  if (isNaN(sectionId)) {
    return new NextResponse('Invalid section ID', { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the section exists and belongs to the instructor
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Return just the student data
    const students = section.students.map(s => s.student);
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching section students:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: { sectionId: string } }
) {
  // Get sectionId from context.params
  const sectionId = parseInt(context.params.sectionId);
  if (isNaN(sectionId)) {
    return new NextResponse('Invalid section ID', { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { studentId } = body;
    if (!studentId) {
      return new NextResponse('Student ID is required', { status: 400 });
    }

    // Verify the section exists and belongs to the instructor
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Check if student is already in this section
    const existingEnrollment = await prisma.studentSection.findUnique({
      where: {
        sectionId_studentId: {
          sectionId: sectionId,
          studentId: student.id,
        },
      },
    });

    if (existingEnrollment) {
      return new NextResponse('Student is already in this section', { status: 400 });
    }

    // Add student to section
    await prisma.studentSection.create({
      data: {
        sectionId: parseInt(sectionId),
        studentId: student.id,
      },
    });

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error('Error adding student to section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
