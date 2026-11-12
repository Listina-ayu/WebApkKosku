import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Jika mencoba akses /login tapi sudah punya session (sudah login), lempar ke beranda/dashboard
  if (pathname === '/login' && session) {
    if (session.role === 'OWNER') {
      return NextResponse.redirect(new URL('/owner', req.url));
    } else if (session.role === 'TENANT') {
      return NextResponse.redirect(new URL('/tenant', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Jika bukan halaman login, lakukan proteksi normal
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/owner') && session.role !== 'OWNER') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  if (pathname.startsWith('/tenant') && session.role !== 'TENANT') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Perbarui matcher agar ikut mendeteksi /login dan halaman dashboard utama
export const config = {
  matcher: ['/login', '/owner/:path*', '/tenant/:path*'],
};