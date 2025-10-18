import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(params.sectionId) },
      include: {
        students: {
          include: {
            student: true
          }
        },
        instructorSubject: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    // Verify the requesting instructor owns this section
    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json({
      ...section,
      students: section.students.map(s => s.student)
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(params.sectionId) },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    // Verify the requesting instructor owns this section
    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.section.delete({
      where: { id: section.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(params.sectionId) },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    // Verify the requesting instructor owns this section
    if (section.instructorSubjectInstructorId !== parseInt(session.user.id)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if a section with this name already exists for this instructor and subject
    const existingSection = await prisma.section.findFirst({
      where: {
        name,
        instructorSubjectInstructorId: section.instructorSubjectInstructorId,
        instructorSubjectSubjectId: section.instructorSubjectSubjectId,
        id: { not: section.id }
      },
    });

    if (existingSection) {
      return new NextResponse('A section with this name already exists', { status: 400 });
    }

    const updatedSection = await prisma.section.update({
      where: { id: section.id },
      data: { name },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
