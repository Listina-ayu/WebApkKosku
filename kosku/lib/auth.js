import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, signToken, verifyToken } from '@/lib/jwt';

export async function createSession(user) {
  const token = await signToken({ id: user.id, role: user.role });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

// Mengembalikan { id, name, role } atau null bila belum login / akun sudah tidak ada.
export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.id) },
    select: { id: true, name: true, role: true },
  });
  return user || null;
}

// Dipakai di setiap halaman/aksi yang dilindungi (lapisan kedua setelah middleware).
export async function requireRole(role) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== role) redirect('/');
  return session;
}
