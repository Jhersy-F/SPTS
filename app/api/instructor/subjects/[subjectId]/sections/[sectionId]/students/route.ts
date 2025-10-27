import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { subjectId: string, sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find section and verify ownership
    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(params.sectionId),
        instructorSubject: {
          subjectId: parseInt(params.subjectId),
          instructorId: parseInt(session.user.id)
        }
      },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found or access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      section.students.map(enrollment => ({
        studentId: enrollment.studentId,
        ...enrollment.student
      }))
    );

  } catch (error) {
    console.error('Error fetching section students:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { subjectId: string, sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
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

    // Check if student is already enrolled
    const existingEnrollment = await prisma.studentSection.findFirst({
      where: {
        studentId: parseInt(studentId),
        sectionId: parseInt(params.sectionId)
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this section' },
        { status: 400 }
      );
    }

    // Add student to section
    const enrollment = await prisma.studentSection.create({
      data: {
        studentId: parseInt(studentId),
        sectionId: parseInt(params.sectionId)
      },
      include: {
        student: true
      }
    });

    return NextResponse.json(enrollment.student, { status: 201 });

  } catch (error) {
    console.error('Error adding student to section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}