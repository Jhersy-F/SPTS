import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get student's sections with subjects through StudentSection
    const student = await prisma.student.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        sections: {
          include: {
            section: {
              include: {
                instructorSubject: {
                  include: {
                    subject: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Transform the data to match the expected format
    const subjects = student.sections.map(({ section }) => ({
      subjectId: section.instructorSubject.subject.subjectID.toString(),
      title: section.instructorSubject.subject.title,
      semester: section.instructorSubject.semester,
      year: section.instructorSubject.year,
    }));

    // Remove duplicates in case student is enrolled in multiple sections of the same subject
    const uniqueSubjects = Array.from(
      new Map(subjects.map(item => [item.subjectId, item])).values()
    );

    return NextResponse.json(uniqueSubjects);
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
