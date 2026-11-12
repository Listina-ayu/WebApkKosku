'use client';

import { useFormStatus } from 'react-dom';

// Tombol submit yang otomatis nonaktif selama form diproses
export default function SubmitButton({
  children,
  className = 'btn-primary',
  pendingText = 'Memproses...',
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
