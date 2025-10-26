import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateDefaultPassword } from '@/lib/actions/password';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        extensionName: true,
        _count: { select: { uploads: true } },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
        { middleName: 'asc' },
        { extensionName: 'asc' }
      ],
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Students GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    console.log(data)
    // Validate required fields
    if (!data.studentNumber || !data.firstName || !data.lastName) {
      return NextResponse.json(
        { error: 'Student number, first name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if student number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentNumber: data.studentNumber },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this student number already exists' },
        { status: 400 }
      );
    }

    // Create new student
    const newStudent = await prisma.student.create({
      data: {
        studentNumber: data.studentNumber,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        extensionName: data.extensionName || null,
        password: await bcrypt.hash(data.studentNumber + data.lastName, 10) // Hash the default password
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
