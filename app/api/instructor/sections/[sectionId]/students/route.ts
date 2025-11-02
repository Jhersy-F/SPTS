import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sectionId } = (await context.params) as { sectionId: string };
    
    const parsedSectionId = parseInt(sectionId);
    
    if (isNaN(parsedSectionId)) {
      return NextResponse.json(
        { error: 'Invalid section ID' },
        { status: 400 }
      );
    }

    // Verify the instructor has access to this section
    // First check if section exists and belongs to instructor
    const section = await prisma.section.findFirst({
      where: {
        id: parsedSectionId,
        instructorSubject: {
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

    // Then get all students in this section with their details
    const enrolledStudents = await prisma.studentSection.findMany({
      where: {
        sectionId: parsedSectionId
      },
      include: {
        student: true
      }
    });

    // Map to return only the student data
    const students = enrolledStudents.map(enrollment => ({
      id: enrollment.student.id,
      studentNumber: enrollment.student.studentNumber,
      firstName: enrollment.student.firstName,
      middleName: enrollment.student.middleName,
      lastName: enrollment.student.lastName,
      extensionName: enrollment.student.extensionName
    }));

    return NextResponse.json(students);
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
  context: { params: { sectionId: string } }
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
    const { sectionId } = context.params;

    if (!studentId || !sectionId) {
      return NextResponse.json(
        { error: 'Student ID and Section ID are required' },
        { status: 400 }
      );
    }

    const parsedStudentId = parseInt(studentId);
    const parsedSectionId = parseInt(sectionId);

    if (isNaN(parsedStudentId) || isNaN(parsedSectionId)) {
      return NextResponse.json(
        { error: 'Invalid student or section ID' },
        { status: 400 }
      );
    }

    // Verify the instructor has access to this section
    const section = await prisma.section.findFirst({
      where: {
        id: parsedSectionId,
        instructorSubject: {
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

    // Check if student is already enrolled in this section
    const existingEnrollment = await prisma.studentSection.findFirst({
      where: {
        studentId: parsedStudentId,
        sectionId: parsedSectionId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this section' },
        { status: 400 }
      );
    }

    // Create the enrollment
    const enrollment = await prisma.studentSection.create({
      data: {
        studentId: parsedStudentId,
        sectionId: parsedSectionId
      },
      include: {
        student: true
      }
    });

    return NextResponse.json({
      id: enrollment.student.id,
      studentNumber: enrollment.student.studentNumber,
      firstName: enrollment.student.firstName,
      middleName: enrollment.student.middleName,
      lastName: enrollment.student.lastName,
      extensionName: enrollment.student.extensionName
    });
  } catch (error) {
    console.error('Error adding student to section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}