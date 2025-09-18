import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { instructorSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const instructors = await prisma.instructor.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        extensionName: true,
        username: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
        { middleName: 'asc' },
        { extensionName: 'asc' }
      ]
    });

    return NextResponse.json({ instructors });
  } catch (error) {
    console.error('List instructors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = instructorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { username, firstName, middleName, lastName, extensionName, password } = parsed.data;

    // Check if username already exists
    const existing = await prisma.instructor.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.instructor.create({
      data: {
        username,
        firstName,
        middleName,
        lastName,
        extensionName,
        password: hashed,
      },
      select: { 
        id: true, 
        username: true, 
        firstName: true, 
        middleName: true,
        lastName: true, 
        extensionName: true 
      },
    });

    return NextResponse.json({ instructor: created }, { status: 201 });
  } catch (error) {
    console.error('Create instructor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
