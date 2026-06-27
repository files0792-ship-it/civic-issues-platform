import StatusBadge from './StatusBadge.jsx';
import { ISSUE_STATUSES } from '../constants/issueStatus.js';

export default function IssueCard({
  issue,
  onUpvote,
  compact,
  /** When true, show status dropdown (requires logged-in user). */
  canChangeStatus = false,
  onStatusChange,
  statusUpdating = false,
  upvoting = false,

}) {
  console.log(issue.imageUrl)
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md">
      {issue.imageUrl && (
  <div className="aspect-video w-full overflow-hidden bg-slate-100">
    <img
      src={issue.imageUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
    />
  </div>
)}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-slate-900">{issue.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} />
            {canChangeStatus && typeof onStatusChange === 'function' && (
              <select
                value={issue.status}
                onChange={(e) => onStatusChange(issue, e.target.value)}
                disabled={statusUpdating}
                aria-label={`Change status for ${issue.title}`}
                className="max-w-[11rem] rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 shadow-sm outline-none ring-civic-500 focus:ring-2 disabled:opacity-50"
              >
                {ISSUE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {!compact && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{issue.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {issue.location && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {issue.location}
            </span>
          )}
          {issue.predictedPriority != null && (
            <span
    className={`rounded px-2 py-0.5 font-medium ${
      issue.predictedPriority >= 70
        ? 'bg-red-100 text-red-700'
        : issue.predictedPriority >= 40
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-green-100 text-green-700'
    }`}
  >
    Priority: {issue.predictedPriority}{' '}
    {issue.predictedPriority >= 70
      ? '🔴 High'
      : issue.predictedPriority >= 40
      ? '🟡 Medium'
      : '🟢 Low'}
  </span>
          )}
          {issue.createdBy?.name && <span>by {issue.createdBy.name}</span>}
        </div>
        {onUpvote && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onUpvote(issue)}
              disabled={statusUpdating || upvoting}
              className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                issue.hasUpvoted
                  ? 'bg-civic-600 text-white shadow-sm shadow-civic-600/25 hover:bg-civic-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`${issue.hasUpvoted ? 'Remove upvote from' : 'Upvote'}: ${issue.title}`}
            >
              <span 
                className={`transition-transform duration-200 ${issue.hasUpvoted ? 'rotate-180' : 'group-hover:scale-110'}`}
                aria-hidden="true"
              >
                {issue.hasUpvoted ? '▼' : '▲'}
              </span>
              <span>{issue.hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                issue.hasUpvoted 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 text-slate-700 group-hover:bg-slate-300'
              }`}>
                {issue.upvoteCount || 0}
              </span>
            </button>
            
            {issue.upvoteCount > 0 && (
              <div className="text-xs text-slate-500">
                {issue.upvoteCount === 1 ? '1 person upvoted' : `${issue.upvoteCount} people upvoted`}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
