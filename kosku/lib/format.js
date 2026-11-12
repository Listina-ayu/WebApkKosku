export function rupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

export function toInputDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

// "2026-11" -> "November 2026"
export function periodLabel(p) {
  const [y, m] = p.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// 2027-05-01 -> "01-05-2027"
export function formatDateShort(d) {
  if (!d) return '-';
  const [y, m, day] = new Date(d).toISOString().slice(0, 10).split('-');
  return `${day}-${m}-${y}`;
}

// 700000 -> "700.000" (tanpa "Rp", dipakai di tabel)
export function formatNumber(n) {
  return new Intl.NumberFormat('id-ID').format(n || 0);
}
