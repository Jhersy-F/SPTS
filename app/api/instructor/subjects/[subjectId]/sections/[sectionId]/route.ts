import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: { subjectId: string, sectionId: string } }
) {
  try {
    const { subjectId, sectionId } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the section and verify ownership in one query
    const section = await prisma.section.findFirst({
      where: { 
        id: parseInt(sectionId),
        instructorSubject: {
          subjectId: parseInt(subjectId),
          instructorId: parseInt(session.user.id)
        }
      },
      include: {
        students: {
          include: {
            student: true
          }
        },
        instructorSubject: {
          include: {
            subject: true,
            instructor: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found or access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(section);

  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { subjectId: string, sectionId: string } }
) {
  try {
    const { subjectId, sectionId } = await Promise.resolve(context.params);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First verify the section belongs to this instructor
    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(sectionId),
        instructorSubject: {
          subjectId: parseInt(subjectId),
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

    // If verified, delete the section
    await prisma.section.delete({
      where: {
        id: parseInt(sectionId)
      }
    });

    return NextResponse.json({
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { subjectId: string, sectionId: string } }
) {
  try {
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

    // Find and verify section ownership
    const section = await prisma.section.findFirst({
      where: {
        id: parseInt(params.sectionId),
        instructorSubject: {
          subjectId: parseInt(params.subjectId),
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

    // Check if a section with this name already exists
    const existingSection = await prisma.section.findFirst({
      where: {
        name: name.trim(),
        id: { not: section.id },
        instructorSubject: {
          subjectId: parseInt(params.subjectId),
          instructorId: parseInt(session.user.id)
        }
      }
    });

    if (existingSection) {
      return NextResponse.json(
        { error: 'A section with this name already exists' },
        { status: 400 }
      );
    }

    const updatedSection = await prisma.section.update({
      where: { id: section.id },
      data: { name: name.trim() },
      include: {
        instructorSubject: {
          include: {
            subject: true
          }
        }
      }
    });

    return NextResponse.json(updatedSection);

  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}