'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { submitPayment } from '@/actions/invoices';
import SubmitButton from '@/components/SubmitButton';
import FormError from '@/components/FormError';

// Form unggah bukti pembayaran (JPG/PNG, maks. 2 MB).
// Validasi akhir tetap dilakukan di server (lib/upload.js).
export default function PaymentForm({ invoiceId }) {
  const [state, formAction] = useFormState(submitPayment, null);
  const [localError, setLocalError] = useState('');

  function onChange(e) {
    const file = e.target.files?.[0];
    setLocalError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setLocalError('Format file harus JPG atau PNG.');
      e.target.value = '';
    } else if (file.size > 2 * 1024 * 1024) {
      setLocalError('Ukuran file maksimal 2 MB.');
      e.target.value = '';
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <FormError message={localError || state?.error} />
      <div>
        <label className="label" htmlFor="proof">Foto bukti transfer (JPG/PNG, maks. 2 MB)</label>
        <input id="proof" name="proof" type="file" accept="image/png,image/jpeg" required onChange={onChange} className="input" />
      </div>
      <SubmitButton pendingText="Mengirim...">Kirim</SubmitButton>
    </form>
  );
}
