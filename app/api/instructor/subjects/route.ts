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
      subjectId: item.subject.subjectID,
      title: item.subject.title,
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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { subjectId } = await req.json();
    if (!subjectId) {
      return new NextResponse('Subject is required', { statusText:"Title is required",status: 403 });
    }


    // Check if the instructor already has this subject
    const existingLink = await prisma.instructorSubject.findFirst({
      where: {
        instructor: { id: parseInt(session.user.id) },
        subjectId: subjectId,
      },
    });

    if (existingLink) {
      return new NextResponse('Subject already assigned to instructor', {statusText:"Subject already assigned to instructor", status: 400 });
    }

    // Link the subject to the instructor
    await prisma.instructor.update({
      where: { id: parseInt(session.user.id) },
      data: {
        subjects: {
          create: {
            subject: {
              connect: { subjectID: subjectId },
            },
          },
        },
      },
    });

    return NextResponse.json({ subjectId: subjectId});
  } catch (error) {
    console.error('Error adding subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
