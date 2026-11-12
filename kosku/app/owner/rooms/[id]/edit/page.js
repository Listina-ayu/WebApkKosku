import { notFound } from 'next/navigation';
import RoomForm from '@/components/RoomForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EditRoomPage({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) notFound();

  return (
    <>
      <h1 className="page-title">Ubah Kamar {room.roomNumber}</h1>
      <p className="page-sub">Status kamar tidak dapat diubah manual.</p>
      <RoomForm room={room} />
    </>
  );
}
