'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/auth';

// F-01 Registrasi akun penghuni
export async function register(prevState, formData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (!name || !email || !password) {
    return { error: 'Nama, email, dan password wajib diisi.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'Format email tidak valid.' };
  }
  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }
  if (password !== confirm) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: 'Email sudah terdaftar.' };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: await bcrypt.hash(password, 10),
      role: 'TENANT',
    },
  });

  await createSession(user);
  redirect('/tenant');
}

// F-02 Login
export async function login(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) return { error: 'Email atau password salah.' };

  await createSession(user);
  redirect(user.role === 'OWNER' ? '/owner' : '/tenant');
}

// F-02 Logout
export async function logout() {
  destroySession();
  redirect('/');
}
