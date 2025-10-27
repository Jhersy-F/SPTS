import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const instructor = await prisma.instructor.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!instructor) {
      return new NextResponse('Instructor not found', { status: 404 });
    }

    const subjects = instructor.subjects.map((item) => ({
      id: item.id,  // Include the InstructorSubject id
      subjectId: item.subject.subjectID, // Keep as number
      title: item.subject.title,
      semester: item.semester,
      year: item.year,
    }));

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching instructor subjects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to perform this action' },
        { status: 401 }
      );
    }

    const { subjectId, semester, year } = await req.json();
    if (!subjectId) {
      return NextResponse.json(
        { message: 'Subject ID is required' },
        { status: 400 }
      );
    }
    if (!semester) {
      return NextResponse.json(
        { message: 'Semester is required' },
        { status: 400 }
      );
    }
    if (!year || typeof year !== 'string' || year.trim() === '') {
      return NextResponse.json(
        { message: 'Year is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Link the subject to the instructor
    await prisma.instructorSubject.create({
      data: {
        instructor: {
          connect: { id: parseInt(session.user.id) }
        },
        subject: {
          connect: { subjectID: parseInt(subjectId) }
        },
        semester: semester,
        year: year
      }
    });

      return NextResponse.json({ 
        message: 'Subject assigned successfully',
        subjectId,
        semester,
        year 
      });
  } catch (error) {
    // Log the detailed error for debugging
    if (error instanceof Error) {
      console.error('Error adding subject:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Error adding subject:', error);
    }

    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      return NextResponse.json(
        { message: 'Invalid subject ID - subject does not exist' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'An error occurred while adding the subject', details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return new NextResponse('Subject ID is required', { status: 400 });
    }

    // Delete the instructor-subject relationship
    await prisma.instructorSubject.deleteMany({
      where: {
        instructorId: parseInt(session.user.id,10),
        subjectId: parseInt(subjectId, 10),
      },
    });

    // Check if the subject is still used by any instructor
    const subjectUsage = await prisma.instructorSubject.count({
      where: { subjectId: parseInt(subjectId, 10) },
    });

    // If no one is using this subject, delete it
    if (subjectUsage === 0) {
      await prisma.subject.delete({
        where: { subjectID: parseInt(subjectId, 10) },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
