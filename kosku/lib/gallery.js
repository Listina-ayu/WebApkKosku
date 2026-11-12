// Foto tambahan kamar disimpan sebagai JSON: ["url foto 2", "url foto 3", "url foto 4"]
// Slot kosong berisi string kosong "".
export function parseGallery(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    return [0, 1, 2].map((i) => (typeof arr[i] === 'string' ? arr[i] : ''));
  } catch {
    return ['', '', ''];
  }
}
