# KosKu — Aplikasi Web Manajemen Kos

Next.js (App Router) · JavaScript · Tailwind CSS · Prisma + SQLite · JWT (jose) + bcryptjs

## Cara menjalankan (MySQL, sudah dikonfigurasi)

Prasyarat: Node.js 18.18+, dan MySQL menyala (mis. XAMPP).

1. Import `database.sql` lewat phpMyAdmin (tab Import). Jika database `kosku` sudah ada dari import
   sebelumnya, cukup jalankan `tambah-kolom-foto.sql` (tab SQL) sekali.
2. Di terminal, di folder proyek:

```bash
npm install
npx prisma generate
npm run dev          # buka http://localhost:3000
```

`schema.prisma` dan `.env` sudah memakai MySQL (`mysql://root:@localhost:3306/kosku`).
Jika root punya password, ubah `DATABASE_URL` di `.env`. Jangan jalankan `npm run setup` / `db:reset`
pada MySQL (itu untuk SQLite).

*Memakai SQLite saja:* ubah `provider` menjadi `"sqlite"` dan `DATABASE_URL="file:./dev.db"`, lalu
`npm run setup`.

## Akun demo

| Peran    | Email            | Password  |
|----------|------------------|-----------|
| Owner    | owner@kosku.com  | owner123  |
| Penghuni | budi@kosku.com   | tenant123 |
| Penghuni | sari@kosku.com   | tenant123 |
| Penghuni | dewi@kosku.com   | tenant123 |
| Penghuni | rudi@kosku.com   | tenant123 |

## Skenario demo (mengikuti Bab VI laporan)

1. **Login benar/salah** (uji 1–2): coba `owner@kosku.com` dengan password salah, lalu benar.
2. **Proteksi role** (uji 3): login sebagai Budi lalu buka `/owner` → dialihkan keluar.
3. **Tambah kamar** (uji 4): Owner → Kamar → Tambah. Kamar baru berstatus Tersedia dan Aktif.
4. **Nonaktifkan kamar** (uji 8): klik Nonaktifkan, lalu cek beranda: kamar hilang.
5. **Ajukan sewa** (uji 5–6): daftar akun baru di `/register`, buka kamar yang Tersedia (mis. B02), isi tanggal mulai
   dan lama sewa 6 bulan → tanggal berakhir terhitung otomatis. Pengajuan berstatus Menunggu. Akun Dewi sudah punya
   pengajuan Menunggu, jadi bila ia mengajukan lagi akan ditolak (alur alternatif).
6. **Setujui sewa** (uji 7): Owner → Pengajuan → Setujui → sewa Aktif, kamar Terisi.
7. **Terbitkan tagihan** (uji 9): Owner → Tagihan → pilih penghuni → Terbitkan.
8. **Unggah bukti** (uji 10–11): login Budi → Tagihan → Bayar → unggah JPG/PNG. Coba file non-gambar atau > 2 MB → ditolak.
9. **Verifikasi** (uji 12–13): Owner → Tagihan → bagian "Menunggu verifikasi" (data Sari sudah ada) → Terima (Lunas)
   atau Tolak dengan alasan (kembali Belum Dibayar, penghuni bisa unggah ulang).
10. **Sewa berakhir otomatis** (uji 14): data Rudi (kamar B01) sudah lewat masa sewa. Saat beranda/dashboard pertama
    dibuka, sewanya menjadi Berakhir dan B01 kembali Tersedia; riwayat pembayarannya tetap ada.

## Pemetaan ke laporan

| Kode | Fitur | Lokasi |
|------|-------|--------|
| F-01, F-02 | Registrasi, login, logout | `actions/auth.js`, `app/login`, `app/register`, `middleware.js` |
| F-03 | Daftar & detail kamar | `app/page.js`, `app/rooms/[id]/page.js` |
| F-04 | CRUD kamar + aktif/nonaktif | `actions/rooms.js`, `app/owner/rooms/**` |
| F-05, F-06 | Ajukan sewa, setujui/tolak | `actions/rentals.js`, `components/RentalForm.js`, `app/owner/rentals` |
| F-07 | Terbitkan tagihan | `actions/invoices.js` (`createInvoice`), `app/owner/invoices` |
| F-08, F-09 | Lihat tagihan, unggah bukti | `app/tenant/invoices/**`, `components/PaymentForm.js` |
| F-10 | Verifikasi pembayaran | `actions/invoices.js` (`approvePayment`, `rejectPayment`) |
| F-11 | Riwayat pembayaran | `app/owner/history`, `app/tenant/history` |
| F-12 | Dashboard owner | `app/owner/page.js` |
| F-13 | Daftar penghuni aktif | `app/owner/rentals/page.js` |
| F-14 | Sewa berakhir otomatis | `lib/rentals.js` (`syncExpiredRentals`) |
| F-15 | Profil & password (Tambahan) | belum dibuat |

## Catatan teknis

- Kolom "ENUM" di laporan ditulis sebagai `String` di `prisma/schema.prisma` karena SQLite pada Prisma 5
  tidak mendukung enum. Nilainya tetap sama (OWNER/TENANT, AVAILABLE/OCCUPIED, dst).
- Foto kamar dan bukti transfer disimpan di database (tabel `files`, maks. 2 MB per gambar) dan disajikan lewat
  `/api/files/[name]`. Bukti hanya bisa dibuka Owner atau penghuni pemilik tagihan; foto kamar bersifat publik.
  Dengan begitu tidak ada file yang ditulis ke disk, sehingga aman untuk hosting serverless seperti Vercel.
- Ganti `AUTH_SECRET` di `.env` sebelum dipakai selain untuk demo.
- Ganti ke MySQL/PostgreSQL: ubah `provider` dan `DATABASE_URL`, lalu `npx prisma db push`.

## Memakai database MySQL (database.sql)

1. Import `database.sql` lewat phpMyAdmin (tab Import) atau `mysql -u root -p < database.sql`.
   Database `kosku` beserta semua tabel dan data demo akan terbentuk.
2. Di `prisma/schema.prisma`, ubah `provider = "sqlite"` menjadi `provider = "mysql"`.
3. Di `.env`, ubah `DATABASE_URL` menjadi, misalnya:
   `DATABASE_URL="mysql://root:@localhost:3306/kosku"` (sesuaikan user dan password).
4. Jalankan `npx prisma generate` lalu `npm run dev`.

Jangan jalankan `npm run setup` atau `prisma db push` setelah import SQL, karena itu akan mengubah ulang struktur tabel.

## Deploy online (mis. Vercel + MySQL cloud)

1. Siapkan database MySQL online, lalu import `database.sql` ke database tersebut
   (di `database.sql` ada baris `DROP DATABASE`/`CREATE DATABASE kosku`; jika hosting hanya memberi satu database
   siap pakai, hapus tiga baris itu beserta `USE kosku;` lalu import ke database yang diberikan).
2. Ubah `provider` di `prisma/schema.prisma` menjadi `"mysql"`, lalu push ke GitHub.
3. Di Vercel, import repository dan isi Environment Variables:
   - `DATABASE_URL` = `mysql://USER:PASSWORD@HOST:3306/NAMA_DB`
   - `AUTH_SECRET`  = string acak panjang
   - `COOKIE_SECURE` = `true`
4. Deploy. Script `build` sudah menjalankan `prisma generate`.

Catatan: pastikan `max_allowed_packet` di server MySQL minimal 4 MB agar upload gambar 2 MB tidak ditolak.
Jika memakai SQLite lokal setelah memperbarui kode, jalankan `npx prisma generate` lalu `npm run db:reset`.

## Menambah Owner baru

Halaman Daftar hanya membuat akun penghuni. Untuk Owner baru, jalankan di folder proyek:

```bash
npm run owner:create -- "Nama Owner" email@contoh.com passwordnya 08123456789
```

Jika email sudah terdaftar sebagai penghuni, perannya diubah menjadi Owner.

## Foto tambahan kamar (foto 2, 3, 4)

Di menu Kamar → Ubah/Tambah, Owner bisa mengunggah tiga foto tambahan. Kolom baru `gallery_urls` di tabel `rooms`.
Jika database MySQL sudah terlanjur diimport sebelum fitur ini, jalankan sekali di tab SQL phpMyAdmin:

```sql
ALTER TABLE rooms ADD COLUMN gallery_urls TEXT NULL;
```

Lalu `npx prisma generate` dan mulai ulang `npm run dev`. (Pengguna SQLite: `npm run db:reset`.)
