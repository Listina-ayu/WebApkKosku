import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import { formatDateTime, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-11 Riwayat pembayaran (owner)
export default async function OwnerHistoryPage() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { rental: { include: { user: true, room: true } } } } },
    orderBy: { paidAt: 'desc' },
  });
  const total = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.invoice.amount, 0);

  return (
    <>
      <h1 className="page-title">Riwayat Pembayaran</h1>
      <p className="page-sub">
        Total pembayaran diterima: <b className="text-teal-700">{rupiah(total)}</b>
      </p>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Waktu</th><th>Penghuni</th><th>Kamar</th><th>Periode</th><th>Nominal</th><th>Status</th><th>Bukti</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-500">Belum ada pembayaran.</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap">{formatDateTime(p.paidAt)}</td>
                <td>{p.invoice.rental.user.name}</td>
                <td>{p.invoice.rental.room.roomNumber}</td>
                <td>{periodLabel(p.invoice.period)}</td>
                <td>{rupiah(p.invoice.amount)}</td>
                <td>
                  <StatusBadge status={p.status} />
                  {p.note && <p className="mt-1 text-xs text-red-600">{p.note}</p>}
                </td>
                <td>
                  <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">Lihat</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
