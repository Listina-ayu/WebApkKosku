'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks({ items }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-white text-teal-800'
                : 'text-teal-50 hover:bg-teal-700'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
