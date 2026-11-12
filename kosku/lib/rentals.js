import { prisma } from '@/lib/prisma';
import { todayUTC } from '@/lib/dates';

// F-14: Sewa berakhir otomatis.
// Dipanggil setiap kali halaman daftar kamar, dashboard, atau daftar penghuni
// dimuat (tanpa cron job). Sewa ACTIVE yang end_date-nya sudah lewat diubah
// menjadi ENDED dan kamarnya kembali AVAILABLE.
export async function syncExpiredRentals() {
  const expired = await prisma.rental.findMany({
    where: { status: 'ACTIVE', endDate: { lt: todayUTC() } },
    select: { id: true, roomId: true },
  });
  if (expired.length === 0) return 0;

  await prisma.$transaction([
    prisma.rental.updateMany({
      where: { id: { in: expired.map((r) => r.id) } },
      data: { status: 'ENDED' },
    }),
    prisma.room.updateMany({
      where: { id: { in: expired.map((r) => r.roomId) } },
      data: { status: 'AVAILABLE' },
    }),
  ]);
  return expired.length;
}
