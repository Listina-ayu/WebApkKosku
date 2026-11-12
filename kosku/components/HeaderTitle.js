'use client';

import { usePathname } from 'next/navigation';

// Judul di header atas = nama menu yang sedang aktif (Dashboard, Tagihan, dst.)
export default function HeaderTitle({ items }) {
  const pathname = usePathname();
  const match = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)));

  return (
    <h2 className="text-lg font-semibold text-slate-900">
      {match?.label || 'Dashboard'}
    </h2>
  );
}
