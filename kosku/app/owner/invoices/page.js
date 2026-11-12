import Flash from '@/components/Flash';
import StatusBadge from '@/components/StatusBadge';
import SubmitButton from '@/components/SubmitButton';
import InvoiceForm from '@/components/InvoiceForm';
import { prisma } from '@/lib/prisma';
import { syncExpiredRentals } from '@/lib/rentals';
import { approvePayment, rejectPayment } from '@/actions/invoices';
import { formatDate, formatDateTime, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-07 Terbitkan tagihan + F-10 Verifikasi pembayaran
export default async function OwnerInvoicesPage({ searchParams }) {
  await syncExpiredRentals();

  const now = new Date();
  const defaultPeriod = now.toISOString().slice(0, 7);
  const defaultDue = `${defaultPeriod}-10`;

  const [activeRentals, pendingPayments, invoices] = await Promise.all([
    prisma.rental.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true, room: true },
      orderBy: { id: 'asc' },
    }),
    prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { invoice: { include: { rental: { include: { user: true, room: true } } } } },
      orderBy: { paidAt: 'asc' },
    }),
    prisma.invoice.findMany({
      include: { rental: { include: { user: true, room: true } } },
      orderBy: [{ period: 'desc' }, { id: 'desc' }],
    }),
  ]);

  const options = activeRentals.map((r) => ({
    id: r.id,
    price: r.room.price,
    label: `${r.user.name} — Kamar ${r.room.roomNumber}`,
  }));

  return (
    <>
      <h1 className="page-title">Tagihan & Verifikasi Pembayaran</h1>
      <p className="page-sub">Terbitkan tagihan bulanan dan periksa bukti transfer dari penghuni.</p>
      <Flash ok={searchParams?.ok} error={searchParams?.error} />

      <h2 className="section-title !mt-2">Menunggu verifikasi ({pendingPayments.length})</h2>
      {pendingPayments.length === 0 ? (
        <p className="text-sm text-slate-500">Tidak ada bukti pembayaran yang perlu diverifikasi.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingPayments.map((p) => {
            const inv = p.invoice;
            return (
              <div key={p.id} className="card space-y-3">
                <div className="flex gap-4">
                  <a href={p.proofUrl} target="_blank" rel="noreferrer" className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.proofUrl} alt="Bukti transfer" className="h-28 w-24 rounded-lg border object-cover" />
                  </a>
                  <div className="text-sm">
                    <p className="font-semibold">{inv.rental.user.name}</p>
                    <p className="text-slate-500">Kamar {inv.rental.room.roomNumber} · {periodLabel(inv.period)}</p>
                    <p className="mt-1 text-lg font-bold text-teal-700">{rupiah(inv.amount)}</p>
                    <p className="text-xs text-slate-500">Diunggah {formatDateTime(p.paidAt)}</p>
                    <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-700 hover:underline">
                      Buka gambar penuh
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2 border-t pt-3">
                  <form action={approvePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <SubmitButton className="btn-primary btn-sm">Terima</SubmitButton>
                  </form>
                  <form action={rejectPayment} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="note" required maxLength={255} placeholder="Alasan penolakan" className="input !py-1 text-xs" />
                    <SubmitButton className="btn-danger btn-sm">Tolak</SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="section-title">Terbitkan tagihan baru</h2>
      <InvoiceForm options={options} defaultPeriod={defaultPeriod} defaultDue={defaultDue} />

      <h2 className="section-title">Semua tagihan</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Periode</th><th>Penghuni</th><th>Kamar</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th></tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500">Belum ada tagihan.</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{periodLabel(inv.period)}</td>
                <td>{inv.rental.user.name}</td>
                <td>{inv.rental.room.roomNumber}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>{rupiah(inv.amount)}</td>
                <td><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
