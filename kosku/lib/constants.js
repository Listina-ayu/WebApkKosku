// Rekening tujuan transfer yang ditampilkan di halaman bayar tagihan
export const BANK = {
  name: 'Bank BCA',
  number: '1234567890',
  holder: 'Pemilik KosKu',
};

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export const STATUS_LABEL = {
  // kamar
  AVAILABLE: 'Tersedia',
  OCCUPIED: 'Terisi',
  INACTIVE: 'Nonaktif',
  // sewa
  PENDING: 'Menunggu',
  ACTIVE: 'Aktif',
  REJECTED: 'Ditolak',
  ENDED: 'Berakhir',
  // tagihan
  UNPAID: 'Belum Dibayar',
  WAITING_VERIFICATION: 'Menunggu Verifikasi',
  PAID: 'Lunas',
  // pembayaran
  APPROVED: 'Diterima',
};

export const STATUS_STYLE = {
  AVAILABLE: 'bg-green-100 text-green-700',
  OCCUPIED: 'bg-orange-100 text-orange-700',
  INACTIVE: 'bg-slate-200 text-slate-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ENDED: 'bg-slate-200 text-slate-600',
  UNPAID: 'bg-red-100 text-red-700',
  WAITING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  APPROVED: 'bg-green-100 text-green-700',
};

export const OWNER_MENU = [
  { href: '/owner', label: 'Dashboard', exact: true },
  { href: '/owner/rooms', label: 'Kamar' },
  { href: '/owner/rentals', label: 'Pengajuan' },
  { href: '/owner/invoices', label: 'Tagihan' },
  { href: '/owner/history', label: 'Riwayat' },
];

export const TENANT_MENU = [
  { href: '/tenant', label: 'Dashboard', exact: true },
  { href: '/tenant/invoices', label: 'Tagihan' },
  { href: '/tenant/history', label: 'Riwayat' },
];

// Aturan kos yang tampil di halaman detail kamar
export const KOS_RULES = [
  'Pembayaran paling lambat tanggal 10 setiap bulan',
  'Satu kamar untuk satu penghuni',
];
