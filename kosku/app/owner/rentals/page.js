import Flash from '@/components/Flash';
import StatusBadge from '@/components/StatusBadge';
import SubmitButton from '@/components/SubmitButton';
import { prisma } from '@/lib/prisma';
import { syncExpiredRentals } from '@/lib/rentals';
import { approveRental, rejectRental } from '@/actions/rentals';
import { formatDate, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-06 Pengajuan sewa + F-13 Penghuni aktif
export default async function OwnerRentalsPage({ searchParams }) {
  await syncExpiredRentals(); // F-14

  const include = { user: true, room: true };
  const [pending, active, past] = await Promise.all([
    prisma.rental.findMany({ where: { status: 'PENDING' }, include, orderBy: { createdAt: 'asc' } }),
    prisma.rental.findMany({ where: { status: 'ACTIVE' }, include, orderBy: { startDate: 'asc' } }),
    prisma.rental.findMany({
      where: { status: { in: ['REJECTED', 'ENDED'] } },
      include,
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <>
      <h1 className="page-title">Pengajuan Sewa & Penghuni</h1>
      <p className="page-sub">Kamar menjadi Terisi hanya setelah pengajuan disetujui.</p>
      <Flash ok={searchParams?.ok} error={searchParams?.error} />

      <h2 className="section-title !mt-2">Pengajuan menunggu ({pending.length})</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Penghuni</th><th>Kamar</th><th>Mulai</th><th>Lama</th><th>Berakhir</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {pending.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500">Tidak ada pengajuan menunggu.</td></tr>
            )}
            {pending.map((r) => (
              <tr key={r.id}>
                <td>
                  <p className="font-medium">{r.user.name}</p>
                  <p className="text-xs text-slate-500">{r.user.phone || r.user.email}</p>
                </td>
                <td>{r.room.roomNumber} <span className="text-xs text-slate-500">({rupiah(r.room.price)})</span></td>
                <td>{formatDate(r.startDate)}</td>
                <td>{r.durationMonths} bulan</td>
                <td>{formatDate(r.endDate)}</td>
                <td>
                  <div className="flex gap-2">
                    <form action={approveRental}>
                      <input type="hidden" name="id" value={r.id} />
                      <SubmitButton className="btn-primary btn-sm">Setujui</SubmitButton>
                    </form>
                    <form action={rejectRental}>
                      <input type="hidden" name="id" value={r.id} />
                      <SubmitButton className="btn-danger btn-sm">Tolak</SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Penghuni aktif ({active.length})</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Penghuni</th><th>Telepon</th><th>Kamar</th><th>Mulai</th><th>Berakhir</th></tr>
          </thead>
          <tbody>
            {active.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-500">Belum ada penghuni aktif.</td></tr>
            )}
            {active.map((r) => (
              <tr key={r.id}>
                <td>
                  <p className="font-medium">{r.user.name}</p>
                  <p className="text-xs text-slate-500">{r.user.email}</p>
                </td>
                <td>{r.user.phone || '-'}</td>
                <td>{r.room.roomNumber}</td>
                <td>{formatDate(r.startDate)}</td>
                <td>{formatDate(r.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Riwayat sewa (ditolak / berakhir)</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Penghuni</th><th>Kamar</th><th>Periode</th><th>Status</th></tr>
          </thead>
          <tbody>
            {past.length === 0 && (
              <tr><td colSpan={4} className="text-center text-slate-500">Belum ada riwayat.</td></tr>
            )}
            {past.map((r) => (
              <tr key={r.id}>
                <td>{r.user.name}</td>
                <td>{r.room.roomNumber}</td>
                <td>{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
