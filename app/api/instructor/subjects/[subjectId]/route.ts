import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  context: { params: { subjectId: string } }
) {
  try {
    const { subjectId } = await Promise.resolve(context.params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, semester, year } = await req.json();

    // Validate required fields
    if (!title || !semester || !year) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if the subject exists and belongs to the instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        instructorId: parseInt(session.user.id),
        subjectId: parseInt(subjectId),
      },
    });

    if (!instructorSubject) {
      return new NextResponse('Subject not found or access denied', { status: 404 });
    }

    // Update the instructor's subject assignment with semester and year
    const updatedInstructorSubject = await prisma.instructorSubject.update({
      where: {
        instructorId_subjectId: {
          instructorId: parseInt(session.user.id),
          subjectId: parseInt(subjectId),
        },
      },
      data: {
        semester,
        year: parseInt(year),
        subject: {
          update: {
            title,
          },
        },
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json({
      subjectId: updatedInstructorSubject.subjectId,
      title: updatedInstructorSubject.subject.title,
      semester: updatedInstructorSubject.semester,
      year: updatedInstructorSubject.year,
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { subjectId: string } }
) {
  try {
    const { subjectId } = await Promise.resolve(context.params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the subject exists and belongs to the instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        instructorId: parseInt(session.user.id),
        subjectId: parseInt(subjectId),
      },
    });

    if (!instructorSubject) {
      return new NextResponse('Subject not found or access denied', { status: 404 });
    }

    // Delete the instructor-subject relationship
    await prisma.instructorSubject.deleteMany({
      where: {
        instructorId: parseInt(session.user.id),
        subjectId: parseInt(subjectId),
      },
    });

    // Check if the subject is still used by any instructor
    const subjectUsage = await prisma.instructorSubject.count({
      where: { subjectId: parseInt(subjectId) },
    });

    // If no one is using this subject, delete it
    if (subjectUsage === 0) {
      await prisma.subject.delete({
        where: { subjectID: parseInt(subjectId) },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
