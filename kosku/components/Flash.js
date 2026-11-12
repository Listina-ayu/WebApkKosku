// Pesan sukses / error dari query string (?ok=... atau ?error=...)
export default function Flash({ ok, error }) {
  if (!ok && !error) return null;
  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
        error
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-green-200 bg-green-50 text-green-700'
      }`}
    >
      {error || ok}
    </div>
  );
}
