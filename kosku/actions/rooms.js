'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { saveImage } from '@/lib/upload';
import { parseGallery } from '@/lib/gallery';

function flash(path, key, msg) {
  redirect(`${path}?${key}=${encodeURIComponent(msg)}`);
}

// F-04 Tambah / ubah kamar.
// Status (Tersedia/Terisi) TIDAK diisi dari form: kamar baru selalu AVAILABLE,
// dan seterusnya diatur otomatis oleh proses sewa.
export async function saveRoom(prevState, formData) {
  await requireRole('OWNER');

  const id = Number(formData.get('id')) || null;
  const roomNumber = String(formData.get('roomNumber') || '').trim().toUpperCase();
  const type = String(formData.get('type') || '').trim();
  const price = parseInt(formData.get('price'), 10);
  const size = String(formData.get('size') || '').trim();
  const facilities = String(formData.get('facilities') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const isActive = formData.get('isActive') === 'on';

  if (!roomNumber || !type) return { error: 'Nomor kamar dan tipe wajib diisi.' };
  if (!Number.isInteger(price) || price <= 0) {
    return { error: 'Harga harus berupa angka lebih dari 0.' };
  }

  const dup = await prisma.room.findUnique({ where: { roomNumber } });
  if (dup && dup.id !== id) {
    return { error: `Nomor kamar ${roomNumber} sudah dipakai.` };
  }

  const data = {
    roomNumber,
    type,
    price,
    size: size || null,
    facilities,
    description,
    isActive,
  };

  const file = formData.get('image');
  if (file && typeof file !== 'string' && file.size > 0) {
    const res = await saveImage(file, 'room');
    if (res.error) return { error: res.error };
    data.imageUrl = res.url;
  }

  // Foto 2, 3, 4 (opsional). Slot lama dipertahankan kecuali diganti/dihapus.
  let gallery = ['', '', ''];
  if (id) {
    const current = await prisma.room.findUnique({
      where: { id },
      select: { galleryUrls: true },
    });
    gallery = parseGallery(current?.galleryUrls);
  }
  for (let i = 0; i < 3; i++) {
    const n = i + 2;
    const extra = formData.get(`photo${n}`);
    if (extra && typeof extra !== 'string' && extra.size > 0) {
      const res = await saveImage(extra, 'room');
      if (res.error) return { error: `Foto ${n}: ${res.error}` };
      gallery[i] = res.url;
    } else if (formData.get(`remove${n}`) === 'on') {
      gallery[i] = '';
    }
  }
  data.galleryUrls = JSON.stringify(gallery);

  if (id) {
    await prisma.room.update({ where: { id }, data });
  } else {
    await prisma.room.create({ data: { ...data, status: 'AVAILABLE' } });
  }

  revalidatePath('/');
  revalidatePath('/owner/rooms');
  flash(
    '/owner/rooms',
    'ok',
    id ? 'Kamar berhasil diperbarui.' : 'Kamar berhasil ditambahkan.'
  );
}

// F-04 Aktif / nonaktifkan kamar
export async function toggleRoomActive(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) flash('/owner/rooms', 'error', 'Kamar tidak ditemukan.');

  await prisma.room.update({
    where: { id },
    data: { isActive: !room.isActive },
  });
  revalidatePath('/');
  revalidatePath('/owner/rooms');
  flash(
    '/owner/rooms',
    'ok',
    `Kamar ${room.roomNumber} ${room.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`
  );
}

// F-04 Hapus kamar (hanya jika belum pernah dipakai sewa)
export async function deleteRoom(formData) {
  await requireRole('OWNER');
  const id = Number(formData.get('id'));
  const room = await prisma.room.findUnique({
    where: { id },
    include: { _count: { select: { rentals: true } } },
  });
  if (!room) flash('/owner/rooms', 'error', 'Kamar tidak ditemukan.');
  if (room._count.rentals > 0) {
    flash(
      '/owner/rooms',
      'error',
      `Kamar ${room.roomNumber} punya riwayat sewa dan tidak bisa dihapus. Nonaktifkan saja.`
    );
  }

  await prisma.room.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/owner/rooms');
  flash('/owner/rooms', 'ok', `Kamar ${room.roomNumber} dihapus.`);
}
