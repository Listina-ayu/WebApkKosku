import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { logout } from '@/actions/auth';

// Menu atas untuk halaman publik (beranda, detail kamar, login, registrasi)
export default async function PublicNav() {
  const session = await getSession();
  const dashboard = session?.role === 'OWNER' ? '/owner' : '/tenant';

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-teal-700">
          🏠 KosKu
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="hidden px-3 py-2 text-sm text-slate-600 hover:text-teal-700 sm:block">
            Daftar Kamar
          </Link>
          {session ? (
            <>
              <Link href={dashboard} className="btn-outline">
                Dashboard
              </Link>
              <form action={logout}>
                <button type="submit" className="btn-primary">
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
