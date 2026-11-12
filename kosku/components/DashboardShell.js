import Link from 'next/link';
import NavLinks from '@/components/NavLinks';
import HeaderTitle from '@/components/HeaderTitle';
import { logout } from '@/actions/auth';

// Layout bersama untuk halaman setelah login (owner & penghuni):
// menu di sisi kiri, header (judul halaman, nama, tombol Keluar), lalu isi.
export default function DashboardShell({ session, items, children }) {
  const roleLabel = session.role === 'OWNER' ? 'Owner' : 'Penghuni';

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-teal-800 text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            🏠 KosKu
          </Link>
          <p className="text-xs text-teal-200">Panel {roleLabel}</p>
        </div>
        <NavLinks items={items} />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <HeaderTitle items={items} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{session.name}</span>
            <form action={logout}>
              <button type="submit" className="btn-outline btn-sm">
                Keluar
              </button>
            </form>
          </div>
        </div>
        <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
