import Link from 'next/link';
import Flash from '@/components/Flash';
import StatusBadge from '@/components/StatusBadge';
import ConfirmButton from '@/components/ConfirmButton';
import { prisma } from '@/lib/prisma';
import { syncExpiredRentals } from '@/lib/rentals';
import { deleteRoom, toggleRoomActive } from '@/actions/rooms';
import { rupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';

// F-04 Kelola kamar
export default async function OwnerRoomsPage({ searchParams }) {
  await syncExpiredRentals();
  const rooms = await prisma.room.findMany({ orderBy: { roomNumber: 'asc' } });

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Kelola Kamar</h1>
          <p className="page-sub">Status Tersedia/Terisi berubah otomatis mengikuti proses sewa.</p>
        </div>
        <Link href="/owner/rooms/new" className="btn-primary whitespace-nowrap">+ Tambah Kamar</Link>
      </div>

      <Flash ok={searchParams?.ok} error={searchParams?.error} />

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>No.</th><th>Tipe</th><th>Harga / bulan</th><th>Status</th><th>Aktif</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-500">Belum ada kamar.</td></tr>
            )}
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="font-semibold">{room.roomNumber}</td>
                <td>{room.type}{room.size ? ` · ${room.size}` : ''}</td>
                <td>{rupiah(room.price)}</td>
                <td><StatusBadge status={room.status} /></td>
                <td>{room.isActive ? <StatusBadge status="ACTIVE" /> : <StatusBadge status="INACTIVE" />}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/owner/rooms/${room.id}/edit`} className="btn-outline btn-sm">Ubah</Link>
                    <form action={toggleRoomActive}>
                      <input type="hidden" name="id" value={room.id} />
                      <button type="submit" className="btn-outline btn-sm">
                        {room.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                    <form action={deleteRoom}>
                      <input type="hidden" name="id" value={room.id} />
                      <ConfirmButton message={`Hapus kamar ${room.roomNumber}?`}>Hapus</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
