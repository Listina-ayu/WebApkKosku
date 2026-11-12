import RoomForm from '@/components/RoomForm';

export default function NewRoomPage() {
  return (
    <>
      <h1 className="page-title">Tambah Kamar</h1>
      <p className="page-sub">Kamar baru otomatis berstatus Tersedia.</p>
      <RoomForm />
    </>
  );
}
