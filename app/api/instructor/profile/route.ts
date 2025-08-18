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

    if (session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Only instructors can update this profile' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, username, currentPassword, newPassword } = body as {
      firstName: string;
      lastName: string;
      username: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (!firstName || !lastName || !username) {
      return NextResponse.json({ error: 'First name, last name, and username are required' }, { status: 400 });
    }

    const instructorId = parseInt(session.user.id);

    const currentInstructor = await prisma.instructor.findUnique({ where: { id: instructorId } });
    if (!currentInstructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Check if username is already taken by another instructor
    if (username !== currentInstructor.username) {
      const existing = await prisma.instructor.findUnique({ where: { username } });
      if (existing && existing.id !== instructorId) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
    }

    const updateData: {
      firstName: string;
      lastName: string;
      username: string;
      password?: string;
    } = {
      firstName,
      lastName,
      username,
    };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, currentInstructor.password);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.instructor.update({
      where: { id: instructorId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', instructor: updated });
  } catch (error) {
    console.error('Instructor profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Only instructors can access this endpoint' }, { status: 403 });
    }

    const instructorId = parseInt(session.user.id);

    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    return NextResponse.json({ instructor });
  } catch (error) {
    console.error('Instructor profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
