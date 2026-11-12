'use client';

// Tombol submit dengan dialog konfirmasi (mis. hapus kamar)
export default function ConfirmButton({ children, message, className = 'btn-danger btn-sm' }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
