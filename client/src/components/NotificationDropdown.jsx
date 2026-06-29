import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'resolved', title: 'Issue Resolved', message: 'Road repair on Main St has been marked as Resolved.', time: '2 hours ago' },
  { id: 2, type: 'progress', title: 'Status Update', message: 'Streetlight issue on Park Ave is now In Progress.', time: '1 day ago' },
  { id: 3, type: 'upvote', title: 'New Upvote', message: 'Your report "Water logged drain" received an upvote.', time: '3 days ago' },
];

const typeStyles = {
  resolved: { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/20' },
  progress: { icon: Clock, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  upvote: { icon: AlertCircle, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/20' },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={20} />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => {
              const style = typeStyles[n.type] || typeStyles.upvote;
              const Icon = style.icon;
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 h-8 w-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 text-center">
            <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
