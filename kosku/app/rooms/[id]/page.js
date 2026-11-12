import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import StatusBadge from '@/components/StatusBadge';
import RentalForm from '@/components/RentalForm';
import RoomGallery from '@/components/RoomGallery';
import { parseGallery } from '@/lib/gallery';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { syncExpiredRentals } from '@/lib/rentals';
import { todayUTC } from '@/lib/dates';
import { rupiah, toInputDate } from '@/lib/format';
import { KOS_RULES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// F-03 Detail kamar + F-05 Form ajukan sewa (mengikuti Wireframe 1B)
export default async function RoomDetailPage({ params }) {
  await syncExpiredRentals();

  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room || !room.isActive) notFound();

  const session = await getSession();

  // Menentukan apakah form bisa dipakai
  let formState = 'ok';
  if (!session) {
    formState = 'guest';
  } else if (session.role === 'OWNER') {
    formState = 'owner';
  } else if (room.status !== 'AVAILABLE') {
    formState = 'occupied';
  } else {
    const busy = await prisma.rental.findFirst({
      where: { userId: session.id, status: { in: ['PENDING', 'ACTIVE'] } },
    });
    if (busy) formState = 'busy';
  }

  const facilities = room.facilities.split('\n').map((f) => f.trim()).filter(Boolean);

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/" className="text-sm text-slate-600 hover:text-teal-700">
          &lt; Kembali ke daftar kamar
        </Link>

        <div className="mt-4 grid gap-8 md:grid-cols-5">
          {/* Kolom kiri: foto + deskripsi */}
          <div className="md:col-span-3">
            <RoomGallery
              main={room.imageUrl}
              thumbs={parseGallery(room.galleryUrls)}
              alt={`Kamar ${room.roomNumber}`}
            />

            <div className="mt-6">
              <h2 className="mb-2 font-semibold text-slate-900">Deskripsi dan aturan kos</h2>
              {room.description && <p className="mb-2 text-sm text-slate-600">{room.description}</p>}
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
                {KOS_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kolom kanan: info kamar + form ajukan sewa */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-slate-900">Kamar {room.roomNumber}</h1>
            <div className="mt-2">
              <StatusBadge status={room.status} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Tipe: {room.type}
              {room.size ? ` · Ukuran ${room.size}` : ''}
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{rupiah(room.price)} / bulan</p>

            <hr className="my-4 border-slate-200" />

            <h2 className="mb-2 font-semibold text-slate-900">Fasilitas</h2>
            {facilities.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
                {facilities.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Belum ada data fasilitas.</p>
            )}

            <hr className="my-4 border-slate-200" />

            <RentalForm roomId={room.id} minDate={toInputDate(todayUTC())} state={formState} />
          </div>
        </div>
      </main>
    </>
  );
}
