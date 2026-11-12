'use client';

import { usePathname } from 'next/navigation';

// Judul halaman di bilah atas, diambil dari menu yang sedang aktif
export default function PageTitle({ items }) {
  const pathname = usePathname();
  const match = items
    .filter((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return <h2 className="text-lg font-semibold text-slate-900">{match ? match.label : ''}</h2>;
}
