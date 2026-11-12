// Data demo KosKu. Jalankan ulang kapan saja: semua data lama dihapus dulu.
//   npm run db:seed
//
// Akun demo:
//   Owner    : owner@kosku.com / owner123
//   Penghuni : budi@kosku.com, sari@kosku.com, dewi@kosku.com, rudi@kosku.com
//              (password semua penghuni: tenant123)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ---- helper tanggal (UTC tengah malam) ----
function utc(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}
function addMonths(date, n) {
  const day = date.getUTCDate();
  const t = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(day, last));
  return t;
}
const now = new Date();
const Y = now.getUTCFullYear();
const M = now.getUTCMonth();
// tanggal 1 pada bulan (bulan ini + k)
const firstOfMonth = (k) => utc(Y, M + k, 1);
const periodOf = (k) => firstOfMonth(k).toISOString().slice(0, 7);
const dueOf = (k) => utc(Y, M + k, 10);

async function main() {
  // hapus data lama (urutan: anak dulu)
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.file.deleteMany();

  // gambar demo (foto kamar & contoh bukti transfer) disimpan di tabel files
  for (const name of ['room-standar.png', 'room-ac.png', 'room-premium.png', 'proof-demo.png']) {
    await prisma.file.create({
      data: { name, mime: 'image/png', data: fs.readFileSync(path.join(__dirname, 'demo-images', name)) },
    });
  }

  const hash = (p) => bcrypt.hashSync(p, 10);

  // ---- users ----
  await prisma.user.create({
    data: { name: 'Pak Hendra (Owner)', email: 'owner@kosku.com', password: hash('owner123'), phone: '081234567890', role: 'OWNER' },
  });
  const mk = (name, email, phone) =>
    prisma.user.create({ data: { name, email, phone, password: hash('tenant123'), role: 'TENANT' } });
  const budi = await mk('Budi Santoso', 'budi@kosku.com', '081111111111');
  const sari = await mk('Sari Wulandari', 'sari@kosku.com', '082222222222');
  const dewi = await mk('Dewi Lestari', 'dewi@kosku.com', '083333333333');
  const rudi = await mk('Rudi Hartono', 'rudi@kosku.com', '084444444444');

  // ---- rooms ----
  const std = 'Kasur\nLemari\nMeja belajar\nKipas angin\nKamar mandi luar';
  const ac = 'Kasur\nLemari\nMeja belajar\nAC\nWiFi\nKamar mandi dalam';
  const prem = 'Kasur queen\nLemari besar\nMeja kerja\nAC\nWiFi\nWater heater\nKamar mandi dalam';
  const room = (roomNumber, type, price, size, facilities, description, extra = {}) =>
    prisma.room.create({
      data: {
        roomNumber, type, price, size, facilities, description,
        imageUrl: `/api/files/room-${type.toLowerCase()}.png`,
        ...extra,
      },
    });

  const A01 = await room('A01', 'Standar', 750000, '3 x 3 m', std, 'Kamar standar bersih, dekat kampus.', { status: 'OCCUPIED' });
  const A02 = await room('A02', 'Standar', 750000, '3 x 3 m', std, 'Kamar standar, sirkulasi udara baik.', { status: 'OCCUPIED' });
  const A03 = await room('A03', 'Standar', 750000, '3 x 3 m', std, 'Kamar standar lantai 1.');
  await room('A04', 'Standar', 750000, '3 x 3 m', std, 'Sedang diperbaiki (plafon).', { isActive: false });
  // B01: sewanya sudah lewat tanggal berakhir -> akan otomatis jadi ENDED saat halaman dimuat (F-14)
  const B01 = await room('B01', 'AC', 1200000, '3 x 4 m', ac, 'Kamar ber-AC dengan kamar mandi dalam.', { status: 'OCCUPIED' });
  await room('B02', 'AC', 1200000, '3 x 4 m', ac, 'Kamar ber-AC, lantai 2.');
  await room('B03', 'AC', 1200000, '3 x 4 m', ac, 'Kamar ber-AC, view taman.');
  await room('C01', 'Premium', 1800000, '4 x 4 m', prem, 'Kamar premium paling luas dengan water heater.');

  // ---- rentals ----
  // Budi: aktif sejak 2 bulan lalu, 6 bulan
  const sBudi = firstOfMonth(-2);
  const rBudi = await prisma.rental.create({
    data: { userId: budi.id, roomId: A01.id, startDate: sBudi, durationMonths: 6, endDate: addMonths(sBudi, 6), status: 'ACTIVE' },
  });
  // Sari: aktif sejak bulan lalu, 3 bulan
  const sSari = firstOfMonth(-1);
  const rSari = await prisma.rental.create({
    data: { userId: sari.id, roomId: A02.id, startDate: sSari, durationMonths: 3, endDate: addMonths(sSari, 3), status: 'ACTIVE' },
  });
  // Rudi: sewa 3 bulan yang sudah lewat (masih ACTIVE di database, diakhiri otomatis oleh sistem)
  const sRudi = firstOfMonth(-5);
  const rRudi = await prisma.rental.create({
    data: { userId: rudi.id, roomId: B01.id, startDate: sRudi, durationMonths: 3, endDate: addMonths(sRudi, 3), status: 'ACTIVE' },
  });
  // Dewi: mengajukan A03, menunggu persetujuan
  const sDewi = firstOfMonth(1);
  await prisma.rental.create({
    data: { userId: dewi.id, roomId: A03.id, startDate: sDewi, durationMonths: 6, endDate: addMonths(sDewi, 6), status: 'PENDING' },
  });

  // ---- invoices & payments ----
  const proof = '/api/files/proof-demo.png';
  const paid = async (rentalId, k, amount, daysAgo) => {
    const inv = await prisma.invoice.create({
      data: { rentalId, period: periodOf(k), amount, dueDate: dueOf(k), status: 'PAID' },
    });
    await prisma.payment.create({
      data: { invoiceId: inv.id, proofUrl: proof, status: 'APPROVED', paidAt: new Date(Date.now() - daysAgo * 86400000) },
    });
    return inv;
  };

  // Budi: 2 bulan lalu lunas, bulan lalu lunas, bulan ini BELUM DIBAYAR (demo: upload bukti)
  await paid(rBudi.id, -2, 750000, 62);
  await paid(rBudi.id, -1, 750000, 32);
  await prisma.invoice.create({
    data: { rentalId: rBudi.id, period: periodOf(0), amount: 750000, dueDate: dueOf(0), status: 'UNPAID' },
  });

  // Sari: bulan lalu lunas, bulan ini MENUNGGU VERIFIKASI (demo: owner terima/tolak)
  await paid(rSari.id, -1, 750000, 30);
  const invSari = await prisma.invoice.create({
    data: { rentalId: rSari.id, period: periodOf(0), amount: 750000, dueDate: dueOf(0), status: 'WAITING_VERIFICATION' },
  });
  await prisma.payment.create({
    data: { invoiceId: invSari.id, proofUrl: proof, status: 'PENDING' },
  });

  // Rudi: satu tagihan lama yang lunas (riwayat tetap tersimpan setelah sewa berakhir)
  await paid(rRudi.id, -5, 1200000, 150);

  console.log('Seed selesai.');
  console.log('Owner    : owner@kosku.com / owner123');
  console.log('Penghuni : budi@kosku.com | sari@kosku.com | dewi@kosku.com | rudi@kosku.com  / tenant123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
