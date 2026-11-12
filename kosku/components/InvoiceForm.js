'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createInvoice } from '@/actions/invoices';
import SubmitButton from '@/components/SubmitButton';
import FormError from '@/components/FormError';

// Form terbitkan tagihan. options: [{ id, label, price }] penghuni aktif.
export default function InvoiceForm({ options, defaultPeriod, defaultDue }) {
  const [state, formAction] = useFormState(createInvoice, null);
  const [amount, setAmount] = useState(options[0]?.price ?? '');

  if (options.length === 0) {
    return (
      <p className="card text-sm text-slate-500">
        Belum ada penghuni aktif. Setujui pengajuan sewa terlebih dahulu.
      </p>
    );
  }

  return (
    <form action={formAction} className="card grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormError message={state?.error} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="rentalId">Penghuni</label>
        <select
          id="rentalId"
          name="rentalId"
          className="input"
          onChange={(e) => {
            const opt = options.find((o) => o.id === Number(e.target.value));
            if (opt) setAmount(opt.price);
          }}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="period">Periode</label>
        <input id="period" name="period" type="month" required defaultValue={defaultPeriod} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="dueDate">Jatuh tempo</label>
        <input id="dueDate" name="dueDate" type="date" required defaultValue={defaultDue} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="amount">Nominal (Rp)</label>
        <input id="amount" name="amount" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Menerbitkan...">Terbitkan Tagihan</SubmitButton>
      </div>
    </form>
  );
}
