'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { addMonthsUTC, parseDateInput, todayUTC } from '@/lib/dates';
import { syncExpiredRentals } from '@/lib/rentals';

function flash(path, key, msg) {
  redirect(`${path}?${key}=${encodeURIComponent(msg)}`);
}

// F-05 Penghuni mengajukan sewa
export async function requestRental(prevState, formData) {
  const session = await requireRole('TENANT');
  await syncExpiredRentals();

  const roomId = Number(formData.get('roomId'));
  const startDate = parseDateInput(String(formData.get('startDate') || ''));
  const months = parseInt(formData.get('duration'), 10);

  if (!startDate) return { error: 'Tanggal mulai tidak valid.' };
  if (startDate < todayUTC()) {
    return { error: 'Tanggal mulai tidak boleh sebelum hari ini.' };
  }
  if (!Number.isInteger(months) || months < 1 || months > 36) {
    return { error: 'Lama sewa harus 1 sampai 36 bulan.' };
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || !room.isActive) return { error: 'Kamar tidak tersedia.' };
  if (room.status !== 'AVAILABLE') return { error: 'Kamar sedang terisi.' };

  // Alur alternatif: penghuni sudah punya sewa aktif / pengajuan menunggu
  const existing = await prisma.rental.findFirst({
    where: { userId: session.id, status: { in: ['PENDING', 'ACTIVE'] } },
  });
  if (existing) {
    return {
      error: 'Anda sudah memiliki sewa aktif atau pengajuan yang sedang menunggu.',
    };
  }

  await prisma.rental.create({
    data: {
      userId: session.id,
      roomId,
      startDate,
      durationMonths: months,
      endDate: addMonthsUTC(startDate, months), // dihitung otomatis
      status: 'PENDING',
    },
  });

  revalidatePath('/owner/rentals');
  flash('/tenant', 'ok', 'Pengajuan sewa terkirim. Menunggu persetujuan owner.');
}

// F-06 Owner menyetujui pengajuan: sewa ACTIVE + kamar OCCUPIED
export async function approveRental(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: { room: true },
  });
  if (!rental || rental.status !== 'PENDING') {
    flash('/owner/rentals', 'error', 'Pengajuan tidak ditemukan atau sudah diproses.');
  }
  if (rental.room.status !== 'AVAILABLE' || !rental.room.isActive) {
    flash('/owner/rentals', 'error', 'Kamar sudah terisi atau tidak aktif.');
  }
  if (rental.endDate < todayUTC()) {
    flash('/owner/rentals', 'error', 'Periode sewa pengajuan ini sudah lewat.');
  }

  await prisma.$transaction([
    prisma.rental.update({ where: { id }, data: { status: 'ACTIVE' } }),
    prisma.room.update({
      where: { id: rental.roomId },
      data: { status: 'OCCUPIED' },
    }),
    // pengajuan lain untuk kamar yang sama otomatis ditolak
    prisma.rental.updateMany({
      where: { roomId: rental.roomId, status: 'PENDING', id: { not: id } },
      data: { status: 'REJECTED' },
    }),
  ]);

  revalidatePath('/');
  revalidatePath('/owner', 'layout');
  flash('/owner/rentals', 'ok', 'Pengajuan disetujui. Kamar kini berstatus Terisi.');
}

// F-06 Owner menolak pengajuan
export async function rejectRental(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));

  const rental = await prisma.rental.findUnique({ where: { id } });
  if (!rental || rental.status !== 'PENDING') {
    flash('/owner/rentals', 'error', 'Pengajuan tidak ditemukan atau sudah diproses.');
  }

  await prisma.rental.update({ where: { id }, data: { status: 'REJECTED' } });
  revalidatePath('/owner/rentals');
  flash('/owner/rentals', 'ok', 'Pengajuan ditolak.');
}
