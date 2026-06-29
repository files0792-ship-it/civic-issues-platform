import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ALL_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export default function ProgressTimeline({ currentStatus }) {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 w-full">
      {ALL_STATUSES.map((status, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === ALL_STATUSES.length - 1;

        return (
          <div key={status} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                } ${isCurrent ? 'ring-4 ring-primary-600/20' : ''}`}
              >
                {isCompleted && i === 2 ? (
                  <CheckCircle size={16} />
                ) : isCompleted ? (
                  <CheckCircle size={16} />
                ) : (
                  <Clock size={16} />
                )}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                  isCompleted
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {status}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  i < currentIndex
                    ? 'bg-primary-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
