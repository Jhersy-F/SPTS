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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    if (session.user.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const uploadsRaw = await prisma.upload.findMany({
      where: { studentId: Number(session.user.id) },
      orderBy: { id: 'desc' },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
      },
    });

    // Flatten response to keep existing client expectations
    const responseUploads = uploadsRaw.map(u => ({
      id: u.id,
      title: u.title,
      description: u.description,
      type: u.type,
      link: u.link,
      subject: u.subject,
      instructor: u.instructor ? `${u.instructor.firstName} ${u.instructor.lastName}` : '-',
    }));

    return NextResponse.json({ uploads: responseUploads });
  } catch (error) {
    console.error('List uploads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const instructorID = formData.get('instructorID') as string; // expecting numeric string
    const subject = formData.get('subject') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type/extension (some browsers/OS may not set MIME correctly)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const lowerName = file.name.toLowerCase();
    const extAllowed = lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx');
    const typeAllowed = allowedTypes.includes(file.type);
    if (!(typeAllowed || extAllowed)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
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

    // Validate instructorID
    if (!instructorID || isNaN(Number(instructorID))) {
      return NextResponse.json(
        { error: 'Invalid instructorID. It must be a number.' },
        { status: 400 }
      );
    }

    // Create upload record in database
    const upload = await prisma.upload.create({
      data: {
        title,
        description,
        type: type.toLowerCase(),
        link: `/uploads/${uniqueFileName}`,
        instructorID: Number(instructorID),
        subject,
        studentId: Number(session.user.id),
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
