import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const studentId = searchParams.get('studentId');
    
  // Build the where clause
  // Use a generic record type to avoid overly broad `any` while allowing flexible filters
  const whereClause: Record<string, unknown> = {};
    
    // If studentId is provided (instructor viewing student's uploads)
    if (studentId && !isNaN(Number(studentId))) {
      // Only allow instructors to view other students' uploads
      if (session.user.role === 'instructor') {
        whereClause.studentId = Number(studentId);
      } else if (session.user.role === 'student' && session.user.id !== studentId) {
        // Students can only view their own uploads
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // If no studentId is provided, default to the current user's uploads
      if (session.user.role !== 'student') {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
      }
      whereClause.studentId = Number(session.user.id);
    }
    
    // Add subject filter if provided
    if (subjectId && !isNaN(Number(subjectId))) {
      whereClause.subjectID = Number(subjectId);
    }

    const uploadsRaw = await prisma.upload.findMany({
      where: whereClause,
      // Prisma model `Upload` does not have a `createdAt` field in schema.prisma.
      // Order by `id` (autoincrement) as a stable fallback (newer uploads have larger ids).
      orderBy: { id: 'desc' },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
        subject: { select: { title: true, subjectID: true } },
      },
    });

    const responseUploads = uploadsRaw.map(upload => ({
      id: upload.id,
      title: upload.title,
      description: upload.description,
      type: upload.type,
      link: upload.link,
      subject: upload.subject?.title ?? '-',
      subjectID: upload.subject?.subjectID ?? null,
      instructor: upload.instructor ? 
        `${upload.instructor.firstName} ${upload.instructor.lastName}` : '-',
  // The Prisma `Upload` model currently has no `createdAt` timestamp.
  // Return null for `createdAt` so the frontend receives a consistent shape.
  createdAt: (upload as { createdAt?: string | Date }).createdAt ?? null,
    }));

  // Return an object with `uploads` so client code that expects `data.uploads` works
  return NextResponse.json({ uploads: responseUploads });
  } catch (error) {
    console.error('List uploads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students are allowed to upload files' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const instructorID = formData.get('instructorID') as string | null; // can be null if not provided
    const subjectIDRaw = formData.get('subjectID') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type/extension (some browsers/OS may not set MIME correctly)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ];
    const lowerName = file.name.toLowerCase();
    const extAllowed =
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.doc') ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg');
    const typeAllowed = allowedTypes.includes(file.type);
    if (!(typeAllowed || extAllowed)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, Word (.doc/.docx), PNG, JPG/JPEG.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save file
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Validate the type field
    if (!type || !['quiz', 'activity', 'exam'].includes(type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid type. Must be quiz, activity, or exam.' },
        { status: 400 }
      );
    }

    // Validate instructorID if provided
    if (instructorID && isNaN(Number(instructorID))) {
      return NextResponse.json(
        { error: 'Invalid instructorID. It must be a number.' },
        { status: 400 }
      );
    }

    // Validate subjectID
    const subjectID = Number(subjectIDRaw);
    if (!subjectID || isNaN(subjectID)) {
      return NextResponse.json(
        { error: 'Invalid subjectID. It must be a number.' },
        { status: 400 }
      );
    }
    
    // Verify the subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { subjectID: subjectID }
    });
    
    if (!subjectExists) {
      return NextResponse.json(
        { error: 'Invalid subject. The specified subject does not exist.' },
        { status: 404 }
      );
    }

    // Get a default instructor if none provided
    // First, try to find an instructor assigned to this subject
    const subjectInstructor = await prisma.instructorSubject.findFirst({
      where: { subjectId: subjectID },
      orderBy: { assignedAt: 'desc' },
      select: { instructorId: true }
    });
    
    let instructorId = instructorID ? Number(instructorID) : subjectInstructor?.instructorId || null;
    
    if (!instructorId) {
      // Try to get the first available instructor for the subject
      const subjectInstructors = await prisma.instructorSubject.findMany({
        where: { subjectId: subjectID },
        take: 1,
        orderBy: { assignedAt: 'desc' }
      });
      
      if (subjectInstructors.length > 0) {
        instructorId = subjectInstructors[0].instructorId;
      } else {
        // If no instructors found for the subject, get the first available instructor
        const firstInstructor = await prisma.instructor.findFirst();
        if (firstInstructor) {
          instructorId = firstInstructor.id;
        } else {
          throw new Error('No instructors available. Please add an instructor first.');
        }
      }
    }

    // Create upload record in database
    const upload = await prisma.upload.create({
      data: {
        // Use the first 100 characters of the description as the title if not provided
        title: (title && title.trim() !== '') 
          ? title.substring(0, 100) 
          : description.substring(0, 100),
        description,
        type: type.toLowerCase(),
        link: `/uploads/${uniqueFileName}`,
        subject: { connect: { subjectID: subjectID } },
        student: { connect: { id: Number(session.user.id) } },
        instructor: { connect: { id: instructorId } }
      },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
        subject: { select: { title: true } },
      },
    });

    return NextResponse.json({
      message: 'Document uploaded successfully',
      upload,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
