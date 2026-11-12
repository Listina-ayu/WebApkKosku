import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { formatDateTime, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-11 Riwayat pembayaran (penghuni)
export default async function TenantHistoryPage() {
  const session = await requireRole('TENANT');
  const payments = await prisma.payment.findMany({
    where: { invoice: { rental: { userId: session.id } } },
    include: { invoice: { include: { rental: { include: { room: true } } } } },
    orderBy: { paidAt: 'desc' },
  });

  return (
    <>
      <h1 className="page-title">Riwayat Pembayaran</h1>
      <p className="page-sub">Semua bukti pembayaran yang pernah Anda kirim.</p>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Waktu</th><th>Periode</th><th>Kamar</th><th>Nominal</th><th>Status</th><th>Bukti</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500">Belum ada pembayaran.</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap">{formatDateTime(p.paidAt)}</td>
                <td>{periodLabel(p.invoice.period)}</td>
                <td>{p.invoice.rental.room.roomNumber}</td>
                <td>{rupiah(p.invoice.amount)}</td>
                <td>
                  <StatusBadge status={p.status} />
                  {p.note && <p className="mt-1 text-xs text-red-600">{p.note}</p>}
                </td>
                <td><a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">Lihat</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
