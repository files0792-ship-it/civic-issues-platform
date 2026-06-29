import { ISSUE_STATUSES } from '../constants/issueStatus.js';

const styles = {
  Pending: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300 ring-warning-500/30 dark:ring-warning-500/50',
  'In Progress': 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 ring-primary-500/30 dark:ring-primary-500/50',
  Resolved: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300 ring-success-500/30 dark:ring-success-500/50',
  Rejected: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300 ring-danger-500/30 dark:ring-danger-500/50',
};

const icons = {
  Pending: '⏳',
  'In Progress': '🔄',
  Resolved: '✅',
  Rejected: '❌',
};

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 ring-slate-400/30 dark:ring-slate-500/50';
  const valid = ISSUE_STATUSES.includes(status) || status === 'Rejected';
  const icon = icons[status];
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all duration-200 ${cls}`}
      title={valid ? `Status: ${status}` : undefined}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {status}
    </span>
  );
}
