import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import PaymentForm from '@/components/PaymentForm';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { BANK } from '@/lib/constants';
import { formatDate, formatDateTime, periodLabel, rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-09 Bayar tagihan: info rekening + unggah bukti
export default async function TenantInvoiceDetailPage({ params }) {
  const session = await requireRole('TENANT');
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      rental: { include: { room: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  });
  // Penghuni hanya boleh melihat tagihannya sendiri
  if (!invoice || invoice.rental.userId !== session.id) notFound();

  const lastPayment = invoice.payments[0];

  return (
    <>
      <Link href="/tenant/invoices" className="text-sm text-teal-700 hover:underline">← Kembali ke tagihan</Link>
      <h1 className="page-title mt-2">Tagihan {periodLabel(invoice.period)}</h1>
      <p className="page-sub">Kamar {invoice.rental.room.roomNumber}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="flex justify-between"><span className="text-slate-500">Jatuh tempo</span><b>{formatDate(invoice.dueDate)}</b></div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-500">Total tagihan</span>
            <b className="text-xl text-teal-700">{rupiah(invoice.amount)}</b>
          </div>
        </div>

        <div className="card space-y-1 text-sm">
          <h2 className="mb-1 font-semibold">Transfer ke rekening owner</h2>
          <p>{BANK.name}</p>
          <p className="text-xl font-bold tracking-wider">{BANK.number}</p>
          <p className="text-slate-500">a.n. {BANK.holder}</p>
        </div>
      </div>

      {invoice.status === 'UNPAID' && (
        <div className="card mt-4">
          {lastPayment?.status === 'REJECTED' && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Bukti sebelumnya ditolak: <b>{lastPayment.note}</b>. Silakan unggah ulang bukti yang valid.
            </p>
          )}
          <h2 className="mb-3 text-lg font-semibold">Unggah bukti pembayaran</h2>
          <PaymentForm invoiceId={invoice.id} />
        </div>
      )}
      {invoice.status === 'WAITING_VERIFICATION' && (
        <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Bukti pembayaran sudah dikirim dan sedang menunggu verifikasi owner.
        </p>
      )}
      {invoice.status === 'PAID' && (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Tagihan ini sudah lunas. Terima kasih!
        </p>
      )}

      <h2 className="section-title">Riwayat pengiriman bukti</h2>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Waktu</th><th>Status</th><th>Catatan</th><th>Bukti</th></tr>
          </thead>
          <tbody>
            {invoice.payments.length === 0 && (
              <tr><td colSpan={4} className="text-center text-slate-500">Belum ada bukti yang dikirim.</td></tr>
            )}
            {invoice.payments.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap">{formatDateTime(p.paidAt)}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>{p.note || '-'}</td>
                <td><a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">Lihat</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
