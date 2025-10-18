import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the section exists and belongs to the instructor
    const section = await prisma.section.findUnique({
      where: { id: parseInt(params.sectionId) },
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
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return new NextResponse('Student ID is required', { status: 400 });
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
      where: { id: studentId },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Check if student is already in this section
    const existingEnrollment = await prisma.studentSection.findUnique({
      where: {
        sectionId_studentId: {
          sectionId: section.id,
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
        sectionId: section.id,
        studentId: student.id,
      },
    });

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error('Error adding student to section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
