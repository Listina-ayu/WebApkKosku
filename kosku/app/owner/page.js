import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import { syncExpiredRentals } from '@/lib/rentals';
import { formatDate, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

function Stat({ label, value, href, tone = 'text-slate-900' }) {
  return (
    <Link href={href} className="card transition hover:shadow-md">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone}`}>{value}</p>
    </Link>
  );
}

// F-12 Dashboard ringkasan owner
export default async function OwnerDashboard() {
  await syncExpiredRentals(); // F-14

  const [available, occupied, pendingRentals, unpaid, waiting, activeTenants, income, openInvoices] =
    await Promise.all([
      prisma.room.count({ where: { isActive: true, status: 'AVAILABLE' } }),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.rental.count({ where: { status: 'PENDING' } }),
      prisma.invoice.count({ where: { status: 'UNPAID' } }),
      prisma.invoice.count({ where: { status: 'WAITING_VERIFICATION' } }),
      prisma.rental.count({ where: { status: 'ACTIVE' } }),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.invoice.findMany({
        where: { status: { in: ['UNPAID', 'WAITING_VERIFICATION'] } },
        include: { rental: { include: { user: true, room: true } } },
        orderBy: { dueDate: 'asc' },
        take: 6,
      }),
    ]);

  return (
    <>
      <h1 className="page-title">Dashboard Owner</h1>
      <p className="page-sub">Ringkasan kondisi kos Anda saat ini.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Kamar kosong" value={available} href="/owner/rooms" tone="text-green-600" />
        <Stat label="Kamar terisi" value={occupied} href="/owner/rooms" tone="text-orange-600" />
        <Stat label="Tagihan belum lunas" value={unpaid + waiting} href="/owner/invoices" tone="text-red-600" />
        <Stat label="Pengajuan menunggu" value={pendingRentals} href="/owner/rentals" />
        <Stat label="Pembayaran perlu verifikasi" value={waiting} href="/owner/invoices" />
        <Stat label="Penghuni aktif" value={activeTenants} href="/owner/rentals" />
      </div>

      <div className="card mt-4">
        <p className="text-sm text-slate-500">Total pemasukan (tagihan lunas)</p>
        <p className="mt-1 text-2xl font-bold text-teal-700">{rupiah(income._sum.amount || 0)}</p>
      </div>

      <h2 className="section-title">Tagihan belum lunas terdekat</h2>
      {openInvoices.length === 0 ? (
        <p className="text-sm text-slate-500">Semua tagihan sudah lunas. 🎉</p>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Penghuni</th><th>Kamar</th><th>Periode</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {openInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.rental.user.name}</td>
                  <td>{inv.rental.room.roomNumber}</td>
                  <td>{periodLabel(inv.period)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>{rupiah(inv.amount)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
