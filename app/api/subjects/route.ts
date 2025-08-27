import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { subjectID: 'asc' },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Subjects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const title = (body?.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const created = await prisma.subject.create({ data: { title } });
    return NextResponse.json({ subject: created });
  } catch (error) {
    console.error('Subjects POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const subjectID = Number(body?.subjectID);
    const title = (body?.title || '').trim();
    if (!subjectID || !Number.isInteger(subjectID)) {
      return NextResponse.json({ error: 'Valid subjectID is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const updated = await prisma.subject.update({
      where: { subjectID },
      data: { title },
    });
    return NextResponse.json({ subject: updated });
  } catch (error) {
    console.error('Subjects PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectID = Number(searchParams.get('subjectID'));
    if (!subjectID || !Number.isInteger(subjectID)) {
      return NextResponse.json({ error: 'Valid subjectID is required' }, { status: 400 });
    }

    await prisma.subject.delete({ where: { subjectID } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subjects DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
