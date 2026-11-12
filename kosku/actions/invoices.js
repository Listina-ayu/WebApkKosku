'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { parseDateInput } from '@/lib/dates';
import { saveImage } from '@/lib/upload';

function flash(path, key, msg) {
  redirect(`${path}?${key}=${encodeURIComponent(msg)}`);
}

// F-07 Owner menerbitkan tagihan bulanan untuk penghuni aktif
export async function createInvoice(prevState, formData) {
  await requireRole('OWNER');

  const rentalId = Number(formData.get('rentalId'));
  const period = String(formData.get('period') || '');
  const amount = parseInt(formData.get('amount'), 10);
  const dueDate = parseDateInput(String(formData.get('dueDate') || ''));

  if (!rentalId) return { error: 'Pilih penghuni terlebih dahulu.' };
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return { error: 'Periode tidak valid.' };
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: 'Nominal harus lebih dari 0.' };
  }
  if (!dueDate) return { error: 'Tanggal jatuh tempo tidak valid.' };

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental || rental.status !== 'ACTIVE') {
    return { error: 'Tagihan hanya bisa diterbitkan untuk penghuni aktif.' };
  }

  const dup = await prisma.invoice.findUnique({
    where: { rentalId_period: { rentalId, period } },
  });
  if (dup) return { error: 'Tagihan untuk periode tersebut sudah pernah diterbitkan.' };

  await prisma.invoice.create({
    data: { rentalId, period, amount, dueDate, status: 'UNPAID' },
  });

  revalidatePath('/owner/invoices');
  revalidatePath('/tenant', 'layout');
  flash('/owner/invoices', 'ok', 'Tagihan berhasil diterbitkan.');
}

// F-09 Penghuni mengunggah bukti pembayaran
export async function submitPayment(prevState, formData) {
  const session = await requireRole('TENANT');
  const invoiceId = Number(formData.get('invoiceId'));

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { rental: true },
  });
  if (!invoice || invoice.rental.userId !== session.id) {
    return { error: 'Tagihan tidak ditemukan.' };
  }
  if (invoice.status !== 'UNPAID') {
    return { error: 'Tagihan ini tidak sedang menunggu pembayaran.' };
  }

  const res = await saveImage(formData.get('proof'), 'proof');
  if (res.error) return { error: res.error };

  await prisma.$transaction([
    prisma.payment.create({
      data: { invoiceId, proofUrl: res.url, status: 'PENDING' },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'WAITING_VERIFICATION' },
    }),
  ]);

  revalidatePath('/owner/invoices');
  flash(
    '/tenant/invoices',
    'ok',
    'Bukti pembayaran terkirim. Menunggu verifikasi owner.'
  );
}

// F-10 Owner menerima pembayaran: payment APPROVED, tagihan PAID (Lunas)
export async function approvePayment(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.status !== 'PENDING') {
    flash('/owner/invoices', 'error', 'Pembayaran tidak ditemukan atau sudah diverifikasi.');
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id }, data: { status: 'APPROVED' } }),
    prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' },
    }),
  ]);

  revalidatePath('/owner', 'layout');
  revalidatePath('/tenant', 'layout');
  flash('/owner/invoices', 'ok', 'Pembayaran diterima. Tagihan berstatus Lunas.');
}

// F-10 Owner menolak pembayaran (wajib alasan): tagihan kembali UNPAID
export async function rejectPayment(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));
  const note = String(formData.get('note') || '').trim();

  if (!note) {
    flash('/owner/invoices', 'error', 'Alasan penolakan wajib diisi.');
  }

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.status !== 'PENDING') {
    flash('/owner/invoices', 'error', 'Pembayaran tidak ditemukan atau sudah diverifikasi.');
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id },
      data: { status: 'REJECTED', note: note.slice(0, 255) },
    }),
    prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'UNPAID' },
    }),
  ]);

  revalidatePath('/owner', 'layout');
  revalidatePath('/tenant', 'layout');
  flash('/owner/invoices', 'ok', 'Pembayaran ditolak. Penghuni dapat mengunggah ulang.');
}
