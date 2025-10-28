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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, semester, year } = await req.json();

    // Validate required fields
    if (!title || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!year || typeof year !== 'string' || year.trim() === '') {
      return NextResponse.json(
        { error: 'Year is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Parse the InstructorSubject ID from the route param
    const instructorSubjectId = parseInt(subjectId);
    const instructorId = parseInt(session.user.id);
    
    console.log('UPDATE: Looking for InstructorSubject with:', {
      id: instructorSubjectId,
      instructorId: instructorId
    });

    // Check if the InstructorSubject record exists and belongs to the instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        id: instructorSubjectId,
        instructorId: instructorId,
      },
    });

    console.log('UPDATE: Found InstructorSubject:', instructorSubject);

    if (!instructorSubject) {
      return NextResponse.json(
        { 
          error: 'Subject not found or access denied',
          debug: {
            instructorSubjectId,
            instructorId
          }
        },
        { status: 404 }
      );
    }

    // Update the instructor's subject assignment with semester and year
    const updatedInstructorSubject = await prisma.instructorSubject.update({
      where: {
        id: instructorSubject.id, // Use the primary key id instead of compound key
      },
      data: {
        semester,
        year: year,
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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the InstructorSubject ID from the route param
    const instructorSubjectId = parseInt(subjectId);
    const instructorId = parseInt(session.user.id);
    
    console.log('DELETE: Looking for InstructorSubject with:', {
      id: instructorSubjectId,
      instructorId: instructorId
    });

    // Check if the InstructorSubject record exists and belongs to the instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        id: instructorSubjectId,
        instructorId: instructorId,
      },
    });

    console.log('DELETE: Found InstructorSubject:', instructorSubject);

    if (!instructorSubject) {
      return NextResponse.json(
        { 
          error: 'Subject not found or access denied',
          debug: {
            instructorSubjectId,
            instructorId
          }
        },
        { status: 404 }
      );
    }

    // Delete the instructor-subject relationship
    await prisma.instructorSubject.delete({
      where: {
        id: instructorSubjectId,
      },
    });

    // Check if the subject is still used by any instructor
    const subjectUsage = await prisma.instructorSubject.count({
      where: { subjectId: instructorSubject.subjectId },
    });

    // If no one is using this subject, delete it
    if (subjectUsage === 0) {
      await prisma.subject.delete({
        where: { subjectID: instructorSubject.subjectId },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
