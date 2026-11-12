'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { login, register } from '@/actions/auth';
import SubmitButton from '@/components/SubmitButton';
import FormError from '@/components/FormError';

export function LoginForm() {
  const [state, formAction] = useFormState(login, null);

  return (
    <form action={formAction} className="card w-full max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Masuk ke KosKu</h1>
      <FormError message={state?.error} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" placeholder="nama@email.com" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="input" />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Masuk...">
        Masuk
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link href="/register" className="font-medium text-teal-700 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(register, null);

  return (
    <form action={formAction} className="card w-full max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Daftar Akun Penghuni</h1>
      <FormError message={state?.error} />
      <div>
        <label className="label" htmlFor="name">Nama lengkap</label>
        <input id="name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">No. telepon</label>
        <input id="phone" name="phone" type="tel" className="input" placeholder="08xxxxxxxxxx" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={6} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Konfirmasi password</label>
        <input id="confirm" name="confirm" type="password" required className="input" />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Mendaftar...">
        Daftar
      </SubmitButton>
      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
