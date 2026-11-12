import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Jika belum login, arahkan ke /login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Ambil role dan ubah ke huruf besar untuk mencegah error perbedaan huruf (owner vs OWNER)
  const userRole = (session.role || session.type || '').toUpperCase();

  // Jika mengakses halaman owner tapi rolenya bukan OWNER
  if (pathname.startsWith('/owner') && userRole !== 'OWNER') {
    return NextResponse.redirect(new URL('/tenant', req.url));
  }

  // Jika mengakses halaman tenant tapi rolenya bukan TENANT
  if (pathname.startsWith('/tenant') && userRole !== 'TENANT') {
    return NextResponse.redirect(new URL('/owner', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/tenant/:path*'],
};