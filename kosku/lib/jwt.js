// Fungsi JWT murni (tanpa next/headers) agar bisa dipakai di middleware (Edge).
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'kosku_session';

function secretKey() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || 'dev-secret-ganti-di-env'
  );
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}
