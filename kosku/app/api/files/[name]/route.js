import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function notFound() {
  return new NextResponse('Not found', { status: 404 });
}

// Menyajikan gambar yang tersimpan di tabel "files".
// - room-*  : foto kamar, publik
// - proof-* : bukti transfer, hanya untuk Owner atau penghuni pemilik tagihan
export async function GET(req, { params }) {
  const name = params.name;
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes('..')) return notFound();

  const isRoom = name.startsWith('room-');
  if (name.startsWith('proof-')) {
    const session = await getSession();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    if (session.role === 'TENANT') {
      const own = await prisma.payment.findFirst({
        where: {
          proofUrl: `/api/files/${name}`,
          invoice: { rental: { userId: session.id } },
        },
        select: { id: true },
      });
      if (!own) return new NextResponse('Forbidden', { status: 403 });
    }
  } else if (!isRoom) {
    return notFound();
  }

  const file = await prisma.file.findUnique({
    where: { name },
    select: { data: true, mime: true },
  });
  if (!file) return notFound();

  return new NextResponse(file.data, {
    headers: {
      'Content-Type': file.mime,
      'Cache-Control': isRoom ? 'public, max-age=3600' : 'private, max-age=3600',
    },
  });
}
