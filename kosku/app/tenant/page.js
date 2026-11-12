import Link from 'next/link';
import Flash from '@/components/Flash';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { syncExpiredRentals } from '@/lib/rentals';
import { todayUTC } from '@/lib/dates';
import { STATUS_LABEL } from '@/lib/constants';
import { formatDateShort, formatNumber, rupiah, toInputDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

// Dashboard penghuni (mengikuti Wireframe 7):
// kartu "Kamar Saya", kartu "Tagihan Bulan Ini", lalu tabel "Daftar Tagihan".
export default async function TenantDashboard({ searchParams }) {
  const session = await requireRole('TENANT');
  await syncExpiredRentals(); // F-14

  const [rentals, invoices] = await Promise.all([
    prisma.rental.findMany({
      where: { userId: session.id },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { rental: { userId: session.id } },
      orderBy: [{ period: 'desc' }, { id: 'desc' }],
      take: 12,
    }),
  ]);

  // Sewa yang ditampilkan: aktif, kalau tidak ada maka pengajuan menunggu, kalau tidak ada maka yang terbaru
  const rental =
    rentals.find((r) => r.status === 'ACTIVE') ||
    rentals.find((r) => r.status === 'PENDING') ||
    rentals[0];

  const period = toInputDate(todayUTC()).slice(0, 7); // periode bulan ini, mis. 2026-11
  const thisMonth = invoices.find((i) => i.period === period);

  return (
    <>
      <Flash ok={searchParams?.ok} error={searchParams?.error} />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Halo, {session.name}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Kamar Saya */}
        <div className="card">
          <h2 className="mb-3 font-semibold text-slate-900">Kamar Saya</h2>
          {rental ? (
            <div className="space-y-1 text-sm text-slate-700">
              <p>{rental.room.roomNumber} - {rental.room.type}</p>
              <p>Mulai: {formatDateShort(rental.startDate)}</p>
              <p>Selesai: {formatDateShort(rental.endDate)} ({rental.durationMonths} bulan)</p>
              <p>Status sewa: {STATUS_LABEL[rental.status]}</p>
              {(rental.status === 'REJECTED' || rental.status === 'ENDED') && (
                <p className="pt-1">
                  <Link href="/" className="font-medium text-teal-700 hover:underline">Cari kamar kosong</Link>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Anda belum memiliki sewa.{' '}
              <Link href="/" className="font-medium text-teal-700 hover:underline">Cari kamar kosong</Link>
            </p>
          )}
        </div>

        {/* Tagihan Bulan Ini */}
        <div className="card flex flex-col">
          <h2 className="mb-1 font-semibold text-slate-900">Tagihan Bulan Ini</h2>
          {thisMonth ? (
            <>
              <p className="text-sm text-slate-600">Periode {thisMonth.period}</p>
              <p className="my-1 text-3xl font-bold text-slate-900">{rupiah(thisMonth.amount)}</p>
              <p className="mb-3 text-sm text-slate-600">Status: {STATUS_LABEL[thisMonth.status]}</p>
              <Link
                href={`/tenant/invoices/${thisMonth.id}`}
                className={`mt-auto w-full ${thisMonth.status === 'UNPAID' ? 'btn-primary' : 'btn-outline'}`}
              >
                {thisMonth.status === 'UNPAID' ? 'Bayar Sekarang' : 'Lihat Tagihan'}
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">Belum ada tagihan untuk bulan ini.</p>
          )}
        </div>
      </div>

      {/* Daftar Tagihan */}
      <h2 className="mb-3 mt-8 font-semibold text-slate-900">Daftar Tagihan</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Periode</th>
              <th>Nominal</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-500">Belum ada tagihan.</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.period}</td>
                <td>{formatNumber(inv.amount)}</td>
                <td>{formatDateShort(inv.dueDate)}</td>
                <td>{inv.status === 'UNPAID' ? 'Belum Bayar' : STATUS_LABEL[inv.status]}</td>
                <td className="text-right">
                  <Link
                    href={`/tenant/invoices/${inv.id}`}
                    className={inv.status === 'UNPAID' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                  >
                    {inv.status === 'UNPAID' ? 'Bayar' : 'Lihat'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
