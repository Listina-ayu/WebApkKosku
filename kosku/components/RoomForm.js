'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { saveRoom } from '@/actions/rooms';
import SubmitButton from '@/components/SubmitButton';
import FormError from '@/components/FormError';
import { parseGallery } from '@/lib/gallery';

// Form tambah / ubah kamar. Status Tersedia/Terisi sengaja TIDAK ada di form
// ini: diatur otomatis oleh proses sewa.
export default function RoomForm({ room }) {
  const [state, formAction] = useFormState(saveRoom, null);
  const gallery = parseGallery(room?.galleryUrls);

  return (
    <form action={formAction} className="card max-w-2xl space-y-4">
      {room && <input type="hidden" name="id" value={room.id} />}
      <FormError message={state?.error} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="roomNumber">Nomor kamar</label>
          <input id="roomNumber" name="roomNumber" required maxLength={10} defaultValue={room?.roomNumber} className="input" placeholder="A01" />
        </div>
        <div>
          <label className="label" htmlFor="type">Tipe</label>
          <input id="type" name="type" required defaultValue={room?.type} className="input" placeholder="Standar / AC / Premium" />
        </div>
        <div>
          <label className="label" htmlFor="price">Harga per bulan (Rp)</label>
          <input id="price" name="price" type="number" min="1" required defaultValue={room?.price} className="input" placeholder="750000" />
        </div>
        <div>
          <label className="label" htmlFor="size">Ukuran</label>
          <input id="size" name="size" defaultValue={room?.size || ''} className="input" placeholder="3 x 4 m" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="facilities">Fasilitas (satu per baris)</label>
        <textarea id="facilities" name="facilities" rows={4} defaultValue={room?.facilities} className="input" placeholder={'Kasur\nLemari\nKamar mandi dalam'} />
      </div>

      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea id="description" name="description" rows={3} defaultValue={room?.description} className="input" />
      </div>

      <div>
        <label className="label" htmlFor="image">Foto utama (opsional, JPG/PNG maks. 2 MB)</label>
        {room?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.imageUrl} alt="Foto kamar" className="mb-2 h-28 rounded-lg object-cover" />
        )}
        <input id="image" name="image" type="file" accept="image/png,image/jpeg" className="input" />
      </div>

      <div>
        <p className="label">Foto tambahan (opsional, tampil sebagai foto 2, 3, dan 4)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[2, 3, 4].map((n) => (
            <div key={n} className="rounded-lg border border-slate-200 p-3">
              <label className="label" htmlFor={`photo${n}`}>Foto {n}</label>
              {gallery[n - 2] && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gallery[n - 2]} alt={`Foto ${n}`} className="mb-2 h-20 w-full rounded object-cover" />
                  <label className="mb-2 flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" name={`remove${n}`} /> Hapus foto ini
                  </label>
                </>
              )}
              <input id={`photo${n}`} name={`photo${n}`} type="file" accept="image/png,image/jpeg" className="w-full text-xs" />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={room ? room.isActive : true} className="h-4 w-4" />
        Kamar aktif (tampil di halaman depan dan bisa diajukan)
      </label>

      <div className="flex gap-2">
        <SubmitButton>{room ? 'Simpan Perubahan' : 'Tambah Kamar'}</SubmitButton>
        <Link href="/owner/rooms" className="btn-outline">Batal</Link>
      </div>
    </form>
  );
}
