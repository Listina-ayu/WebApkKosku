'use client';

import { useState } from 'react';

// Foto utama + foto 2, 3, 4. Klik foto kecil untuk menampilkannya di foto besar;
// klik lagi untuk kembali ke foto utama.
export default function RoomGallery({ main, thumbs, alt }) {
  const [active, setActive] = useState(0); // 0 = foto utama, 1..3 = foto 2..4
  const all = [main, ...thumbs];
  const shown = all[active] || main;

  return (
    <>
      <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-6xl">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={alt} className="h-full w-full object-cover" />
        ) : (
          '🛏️'
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {thumbs.map((url, i) => {
          const idx = i + 1;
          if (!url) {
            return (
              <div
                key={idx}
                className="flex aspect-[3/2] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
              >
                foto {idx + 1}
              </div>
            );
          }
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(active === idx ? 0 : idx)}
              className={`aspect-[3/2] overflow-hidden rounded-lg border-2 ${
                active === idx ? 'border-teal-600' : 'border-slate-200'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${alt} foto ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
    </>
  );
}
