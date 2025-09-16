import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentNumber, firstName, middleName, lastName, extensionName, password } = body;

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentNumber },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        studentNumber,
        firstName,
        middleName: middleName || null,
        lastName,
        extensionName: extensionName || null,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Registration successful',
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        extensionName: student.extensionName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
