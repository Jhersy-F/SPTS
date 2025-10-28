import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching subjects for student:', session.user.id);

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

    console.log('Found student:', student ? 'yes' : 'no');
    console.log('Student sections count:', student?.sections?.length || 0);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    // Filter out any sections that are null (orphaned records)
    const subjects = student.sections
      .filter(({ section }) => section !== null && section.instructorSubject !== null)
      .map(({ section }) => ({
        sectionId: section.id,
        subjectId: section.instructorSubject.id.toString(),
        title: section.instructorSubject.subject.title,
        semester: section.instructorSubject.semester,
        year: section.instructorSubject.year,
      }));

    console.log('Subjects found:', subjects.length);
    console.log('section data:', student.sections[0].section.instructorSubject);
     console.log('section data:', student.sections[1].section.instructorSubject);
    // Remove duplicates in case student is enrolled in multiple sections of the same subject
    /*const uniqueSubjects = Array.from(
      new Map(subjects.map(item => [item.subjectId, item])).values()
    );*/

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
