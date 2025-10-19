import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get instructor's sections with student and upload counts
    const instructorSections = await prisma.instructorSubject.findMany({
      where: {
        instructorId: parseInt(session.user.id as string),
      },
      include: {
        sections: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    _count: {
                      select: { uploads: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Process the data for the charts
    const studentsPerSection: { name: string; value: number }[] = [];
    const uploadsPerSection: { name: string; value: number }[] = [];

    instructorSections.forEach((instructorSubject) => {
      instructorSubject.sections.forEach((section) => {
        const studentCount = section.students.length;
        const uploadCount = section.students.reduce((sum, { student }) => {
          return sum + student._count.uploads;
        }, 0);

        studentsPerSection.push({
          name: section.name,
          value: studentCount,
        });

        uploadsPerSection.push({
          name: section.name,
          value: uploadCount,
        });
      });
    });

    return NextResponse.json({
      studentsPerSection,
      uploadsPerSection,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch dashboard stats' }),
      { status: 500 }
    );
  }
}
