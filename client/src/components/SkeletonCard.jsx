export default function SkeletonCard({ compact }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm ${compact ? 'p-4' : ''}`}>
      {!compact && (
        <div className="aspect-[16/9] sm:aspect-[16/8] lg:aspect-[16/7] w-full bg-slate-200 dark:bg-slate-700 rounded-t-2xl" />
      )}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
        {!compact && (
          <>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-5/6" />
          </>
        )}
        <div className="flex gap-3">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}
