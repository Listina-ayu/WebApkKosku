import PublicNav from '@/components/PublicNav';
import RoomCard from '@/components/RoomCard';
import { prisma } from '@/lib/prisma';
import { syncExpiredRentals } from '@/lib/rentals';

export const dynamic = 'force-dynamic';

// F-03 Beranda + daftar kamar (publik)
export default async function HomePage() {
  await syncExpiredRentals(); // F-14

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { roomNumber: 'asc' },
  });
  const available = rooms.filter((r) => r.status === 'AVAILABLE').length;

  return (
    <>
      <PublicNav />
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="text-3xl font-bold md:text-4xl">Cari kamar kos yang nyaman</h1>
          <p className="mt-2 max-w-xl text-teal-50">
            Lihat kamar kosong, ajukan sewa, dan bayar tagihan bulanan secara online
            dengan bukti transfer yang tercatat rapi.
          </p>
          <p className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm">
            {available} kamar tersedia dari {rooms.length} kamar
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold">Daftar Kamar</h2>
        {rooms.length === 0 ? (
          <p className="text-slate-500">Belum ada kamar yang ditampilkan.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
