import Link from 'next/link';
import Flash from '@/components/Flash';
import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { formatDate, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-08 Daftar tagihan penghuni
export default async function TenantInvoicesPage({ searchParams }) {
  const session = await requireRole('TENANT');
  const invoices = await prisma.invoice.findMany({
    where: { rental: { userId: session.id } },
    include: { rental: { include: { room: true } } },
    orderBy: [{ period: 'desc' }, { id: 'desc' }],
  });

  return (
    <>
      <h1 className="page-title">Tagihan Saya</h1>
      <p className="page-sub">Daftar tagihan bulanan beserta status pembayarannya.</p>
      <Flash ok={searchParams?.ok} error={searchParams?.error} />

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Periode</th><th>Kamar</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500">Belum ada tagihan.</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{periodLabel(inv.period)}</td>
                <td>{inv.rental.room.roomNumber}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>{rupiah(inv.amount)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td>
                  <Link
                    href={`/tenant/invoices/${inv.id}`}
                    className={inv.status === 'UNPAID' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
                  >
                    {inv.status === 'UNPAID' ? 'Bayar' : 'Detail'}
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
