import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { rupiah } from '@/lib/format';

export default function RoomCard({ room }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-slate-100 text-4xl">
        {room.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.imageUrl} alt={`Kamar ${room.roomNumber}`} className="h-full w-full object-cover" />
        ) : (
          '🛏️'
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Kamar {room.roomNumber}</h3>
          <StatusBadge status={room.status} />
        </div>
        <p className="text-sm text-slate-500">
          {room.type}
          {room.size ? ` · ${room.size}` : ''}
        </p>
        <p className="mt-2 text-lg font-bold text-teal-700">
          {rupiah(room.price)} <span className="text-xs font-normal text-slate-500">/ bulan</span>
        </p>
        <Link href={`/rooms/${room.id}`} className="btn-outline mt-3 w-full">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
