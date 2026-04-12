import { ISSUE_STATUSES } from '../constants/issueStatus.js';

const styles = {
  Pending: 'bg-amber-100 text-amber-900 ring-amber-500/30',
  'In Progress': 'bg-sky-100 text-sky-900 ring-sky-500/30',
  Resolved: 'bg-emerald-100 text-emerald-900 ring-emerald-500/30',
};

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-slate-100 text-slate-800 ring-slate-400/30';
  const valid = ISSUE_STATUSES.includes(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
      title={valid ? `Status: ${status}` : undefined}
    >
      {status}
    </span>
  );
}
