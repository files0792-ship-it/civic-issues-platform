import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
