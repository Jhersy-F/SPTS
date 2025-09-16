import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { userId, userType, newPassword } = await request.json();

    // Validate input
    if (!userId || !userType || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (userType !== 'instructor' && userType !== 'student') {
      return NextResponse.json(
        { error: 'Invalid user type. Must be either "instructor" or "student"' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password based on user type
    if (userType === 'instructor') {
      await prisma.instructor.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword },
      });
    } else if (userType === 'student') {
      await prisma.student.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
