import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentNumber, password } = body;

    // Find student
    const student = await prisma.student.findUnique({
      where: { studentNumber },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid student number or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid student number or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      { id: student.id, role: 'student' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({
      token,
      user: {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
