'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { requestRental } from '@/actions/rentals';
import SubmitButton from '@/components/SubmitButton';
import FormError from '@/components/FormError';
import { addMonthsUTC, parseDateInput } from '@/lib/dates';
import { formatDateShort } from '@/lib/format';

const DURATIONS = [1, 2, 3, 4, 5, 6, 9, 12, 18, 24, 36];

// Keterangan tambahan bila form tidak bisa dipakai
const NOTES = {
  owner: 'Anda login sebagai Owner. Form ini hanya untuk penghuni.',
  occupied: 'Kamar ini sedang terisi dan belum dapat diajukan.',
  busy: 'Anda sudah memiliki sewa aktif atau pengajuan yang menunggu.',
};

// Form "Ajukan Sewa" (wireframe 1B).
// state: 'ok' (penghuni boleh mengajukan) | 'guest' (belum login) |
//        'owner' | 'occupied' | 'busy' (form tampil tapi dinonaktifkan)
export default function RentalForm({ roomId, minDate, state = 'ok' }) {
  const [result, formAction] = useFormState(requestRental, null);
  const [start, setStart] = useState(minDate);
  const [months, setMonths] = useState('6');

  const disabled = state !== 'ok';
  const startDate = parseDateInput(start);
  const end = startDate ? addMonthsUTC(startDate, Number(months)) : null;

  return (
    <form action={formAction} className="space-y-3">
      <h2 className="font-semibold text-slate-900">Form Ajukan Sewa</h2>
      <input type="hidden" name="roomId" value={roomId} />
      <FormError message={result?.error} />

      <div>
        <label className="mb-1 block text-sm text-slate-600" htmlFor="startDate">Tanggal mulai sewa</label>
        <input id="startDate" name="startDate" type="date" min={minDate} required disabled={disabled} value={start} onChange={(e) => setStart(e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-600" htmlFor="duration">Lama sewa (bulan)</label>
        <select id="duration" name="duration" disabled={disabled} value={months} onChange={(e) => setMonths(e.target.value)} className="input">
          {DURATIONS.map((n) => (
            <option key={n} value={n}>{n} bulan</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500">Selesai (otomatis): {end ? formatDateShort(end) : '-'}</p>

      {state === 'ok' && (
        <SubmitButton className="btn-primary w-full" pendingText="Mengirim...">Ajukan Sewa</SubmitButton>
      )}
      {state === 'guest' && (
        <Link href="/login" className="btn-primary w-full">Ajukan Sewa</Link>
      )}
      {state !== 'ok' && state !== 'guest' && (
        <button type="button" disabled className="btn-primary w-full">Ajukan Sewa</button>
      )}

      <div className="space-y-0.5 text-center text-xs text-slate-500">
        {NOTES[state] && <p className="font-medium text-red-600">{NOTES[state]}</p>}
        <p>Perlu login sebagai penghuni.</p>
        <p>Kamar Terisi setelah disetujui owner.</p>
      </div>
    </form>
  );
}
