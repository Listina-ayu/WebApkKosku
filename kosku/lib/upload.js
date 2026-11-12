import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { MAX_UPLOAD_BYTES } from '@/lib/constants';

const TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png' };

// Cek "magic bytes" supaya file palsu (mis. .exe diganti nama jadi .jpg) ditolak
function looksLikeImage(buf, mime) {
  if (mime === 'image/png') {
    return buf.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }
  return buf.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
}

// Menyimpan gambar ke tabel "files" di database.
// Mengembalikan { url } atau { error }.
// prefix: "proof" (bukti bayar) atau "room" (foto kamar)
export async function saveImage(file, prefix) {
  if (!file || typeof file === 'string' || file.size === 0) {
    return { error: 'File belum dipilih.' };
  }
  const ext = TYPES[file.type];
  if (!ext) return { error: 'Format file harus JPG atau PNG.' };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: 'Ukuran file maksimal 2 MB.' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buffer, file.type)) {
    return { error: 'Isi file bukan gambar yang valid.' };
  }

  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  await prisma.file.create({
    data: { name, mime: file.type, data: buffer },
  });

  // Disajikan lewat route handler /api/files/[name]
  return { url: `/api/files/${name}` };
}
