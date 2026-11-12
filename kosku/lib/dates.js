// Utilitas tanggal. Semua tanggal disimpan sebagai UTC tengah malam.

// "2026-11-10" -> Date (UTC) atau null jika tidak valid
export function parseDateInput(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Tambah n bulan (tanggal 31 + 1 bulan -> akhir bulan berikutnya, bukan loncat)
export function addMonthsUTC(date, n) {
  const day = date.getUTCDate();
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1)
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

// Hari ini (zona waktu WIB) sebagai tanggal UTC tengah malam
export function todayUTC() {
  const s = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Jakarta',
  }); // format YYYY-MM-DD
  return parseDateInput(s);
}
