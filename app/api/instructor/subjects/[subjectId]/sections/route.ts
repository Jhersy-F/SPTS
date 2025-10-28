import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    // The subjectId param is actually the InstructorSubject.id
    const instructorSubjectId = Number(subjectId);
    const instructorId = Number(session.user.id);

    if (!Number.isInteger(instructorSubjectId) || instructorSubjectId <= 0) {
      return NextResponse.json(
        { error: 'Invalid instructor subject ID format' },
        { status: 400 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: 'Invalid session: missing instructor ID' },
        { status: 401 }
      );
    }

    console.log('GET Sections: Looking for InstructorSubject with:', {
      id: instructorSubjectId,
      instructorId: instructorId
    });

    // Verify the InstructorSubject record exists and belongs to this instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        id: instructorSubjectId,
        instructorId: instructorId
      }
    });

    console.log('GET Sections: Found InstructorSubject:', instructorSubject);

    if (!instructorSubject) {
      return NextResponse.json(
        { error: 'Subject not found or not assigned to instructor' },
        { status: 404 }
      );
    }

    // Get all sections for this InstructorSubject
    const sections = await prisma.section.findMany({
      where: {
        instructorSubjectId: instructorSubject.id
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
  context: { params: { subjectId: string } }
) {
  try {
    // First await the params
    const { subjectId } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Section name is required' },
        { status: 400 }
      );
    }

    // The subjectId param is actually the InstructorSubject.id
    const instructorSubjectId = parseInt(subjectId);
    const instructorId = parseInt(session.user.id);

    if (isNaN(instructorSubjectId) || isNaN(instructorId)) {
      return NextResponse.json(
        { error: 'Invalid instructor subject ID or instructor ID' },
        { status: 400 }
      );
    }

    console.log('POST Section: Looking for InstructorSubject with:', {
      id: instructorSubjectId,
      instructorId: instructorId
    });

    // Verify the InstructorSubject record exists and belongs to this instructor
    const instructorSubject = await prisma.instructorSubject.findFirst({
      where: {
        id: instructorSubjectId,
        instructorId: instructorId
      }
    });

    console.log('POST Section: Found InstructorSubject:', instructorSubject);

    if (!instructorSubject) {
      return NextResponse.json(
        { error: 'Subject not found or not assigned to instructor' },
        { status: 404 }
      );
    }

    // Check if section already exists
    const existingSection = await prisma.section.findFirst({
      where: {
        name,
        instructorSubjectId: instructorSubject.id
      },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: 'Section with this name already exists' },
        { status: 400 }
      );
    }

    const section = await prisma.section.create({
      data: {
        name,
        instructorSubjectId: instructorSubject.id
      },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
