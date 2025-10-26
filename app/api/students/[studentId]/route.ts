import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const rawStudentId = (await context.params).studentId;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const studentId = parseInt(rawStudentId);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        // Don't include sensitive information like password hashes
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const rawStudentId = (await context.params).studentId;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const studentId = parseInt(rawStudentId);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.studentNumber || !data.firstName || !data.lastName) {
      return NextResponse.json(
        { error: 'Student number, first name and last name are required' },
        { status: 400 }
      );
    }

    // Check if student number is already taken by another student
    const existingStudent = await prisma.student.findUnique({
      where: { studentNumber: data.studentNumber }
    });

    if (existingStudent && existingStudent.id !== studentId) {
      return NextResponse.json(
        { error: 'Student number is already taken' },
        { status: 400 }
      );
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        studentNumber: data.studentNumber,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        extensionName: data.extensionName || null,
      },
    });

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const rawStudentId = (await context.params).studentId;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const studentId = parseInt(rawStudentId);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // First check if the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student and all related records
    await prisma.$transaction([
      // Delete all student's sections
      prisma.studentSection.deleteMany({
        where: { studentId }
      }),
      // Delete student's uploads
      prisma.upload.deleteMany({
        where: { studentId }
      }),
      // Finally delete the student
      prisma.student.delete({
        where: { id: studentId }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
