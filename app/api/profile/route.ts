import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can update their profile' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, studentNumber, currentPassword, newPassword } = body;

    // Validate required fields
    if (!firstName || !lastName || !studentNumber) {
      return NextResponse.json({ error: 'First name, last name, and student number are required' }, { status: 400 });
    }

    const studentId = parseInt(session.user.id);
    
    // Get current student data
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!currentStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if student number is already taken by another student
    if (studentNumber !== currentStudent.studentNumber) {
      const existingStudent = await prisma.student.findUnique({
        where: { studentNumber }
      });

      if (existingStudent && existingStudent.id !== studentId) {
        return NextResponse.json({ error: 'Student number is already taken' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: {
      firstName: string;
      lastName: string;
      studentNumber: string;
      password?: string;
    } = {
      firstName,
      lastName,
      studentNumber
    };

    // Handle password update if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentStudent.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Validate new password strength
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Update student in database
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can access this endpoint' }, { status: 403 });
    }

    const studentId = parseInt(session.user.id);
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
