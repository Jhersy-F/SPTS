import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: { sectionId: string } }
) {
  try {
    const { sectionId } = await Promise.resolve(context.params);
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsedSectionId = parseInt(sectionId);
    
    if (isNaN(parsedSectionId)) {
      return NextResponse.json(
        { error: 'Invalid section ID' },
        { status: 400 }
      );
    }

    // Verify the instructor has access to this section and get subject details
    const section = await prisma.section.findFirst({
      where: {
        id: parsedSectionId,
        instructorSubject: {
          instructorId: parseInt(session.user.id)
        }
      },
      include: {
        instructorSubject: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found or access denied' },
        { status: 404 }
      );
    }
    console.log('Fetched section:', section); 
    return NextResponse.json({
      id: section.id,
      name: section.name,
      instructorSubjectId: section.instructorSubjectId,
      subjectTitle: section.instructorSubject.subject.title,
      subjectId: section.instructorSubject.subject.subjectID
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}