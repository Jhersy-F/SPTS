import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sections = await prisma.Section.findMany({
      where: {
        instructorSubjectInstructorId: parseInt(session.user.id),
        instructorSubjectSubjectId: parseInt(params.subjectId),
      },
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(sections, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return new NextResponse('Section name is required', { status: 400 });
    }

    // Check if section already exists for this instructor and subject
    const existingSection = await prisma.Section.findFirst({
      where: {
        name,
        instructorSubjectInstructorId: parseInt(session.user.id),
        instructorSubjectSubjectId: parseInt(params.subjectId),
      },
    });

    if (existingSection) {
      return new NextResponse('Section with this name already exists', { status: 400 });
    }

    const section = await prisma.Section.create({
      data: {
        name,
        instructorSubjectInstructorId: parseInt(session.user.id),
        instructorSubjectSubjectId: parseInt(params.subjectId),
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
