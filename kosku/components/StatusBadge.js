import { STATUS_LABEL, STATUS_STYLE } from '@/lib/constants';

export default function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLE[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {label || STATUS_LABEL[status] || status}
    </span>
  );
}
