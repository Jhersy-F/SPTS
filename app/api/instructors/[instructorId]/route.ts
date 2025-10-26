import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(
  request: Request,
  context: { params: { instructorId: string } }
) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { instructorId } = context.params;
    const body = await request.json();

    const { username, firstName, middleName, lastName, extensionName } = body;

    if (!username || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if username is taken by another instructor
    const existingInstructor = await prisma.instructor.findFirst({
      where: {
        username,
        NOT: {
          id: parseInt(instructorId)
        }
      }
    });

    if (existingInstructor) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Update instructor
    const updated = await prisma.instructor.update({
      where: { id: parseInt(instructorId) },
      data: {
        username,
        firstName,
        middleName,
        lastName,
        extensionName
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        middleName: true,
        lastName: true,
        extensionName: true
      }
    });

    return NextResponse.json({ instructor: updated });
  } catch (error) {
    console.error('Update instructor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { instructorId: string } }
) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { instructorId } = context.params;
    const instructorIdNum = parseInt(instructorId);

    // Start a transaction to handle deletion of related records
    await prisma.$transaction(async (tx) => {
      // Delete instructor-subject relationships
      await tx.instructorSubject.deleteMany({
        where: { instructorId: instructorIdNum }
      });

      // Delete instructor-section relationships (if they exist)
      await tx.section.deleteMany({
        where: { instructorSubjectInstructorId: instructorIdNum }
      });

      // Finally, delete the instructor
      await tx.instructor.delete({
        where: { id: instructorIdNum }
      });
    });

    return NextResponse.json(
      { message: 'Instructor deleted successfully' }
    );
  } catch (error) {
    console.error('Delete instructor error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Instructor not found' },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}