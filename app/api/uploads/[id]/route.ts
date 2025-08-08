import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

// Helper to ensure numeric id
function parseId(id: string | string[]): number {
  const parsed = Array.isArray(id) ? Number(id[0]) : Number(id);
  if (Number.isNaN(parsed)) throw new Error('Invalid id');
  return parsed;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    if (session.user.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = parseId(params.id);
    const body = await request.json();
    const { title, description } = body as { title?: string; description?: string };

    // Ensure ownership
    const existing = await prisma.upload.findUnique({ where: { id } });
    if (!existing || existing.studentId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.upload.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return NextResponse.json({ upload: updated });
  } catch (error) {
    console.error('Update upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    if (session.user.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = parseId(params.id);

    const existing = await prisma.upload.findUnique({ where: { id } });
    if (!existing || existing.studentId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete file from disk if exists
    if (existing.link) {
      const publicPath = existing.link.startsWith('/') ? existing.link.slice(1) : existing.link;
      const filePath = path.join(process.cwd(), 'public', publicPath.replace(/^uploads\//, 'uploads/'));
      try {
        await fs.unlink(filePath);
      } catch {
        // ignore if file missing
      }
    }

    await prisma.upload.delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
