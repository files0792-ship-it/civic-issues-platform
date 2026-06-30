import StatusBadge from './StatusBadge.jsx';
import { ISSUE_STATUSES } from '../constants/issueStatus.js';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import ImageViewer from './ImageViewer.jsx';

// Helper function to format location display
function formatLocation(issue) {
  if (issue.city && issue.state) {
    return `${issue.city}, ${issue.state}`;
  }
  return issue.location;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
  const displayLocation = formatLocation(issue);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1">
      {issue.imageUrl && (
        <div className="relative aspect-[16/9] sm:aspect-[16/8] lg:aspect-[16/7] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
          )}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label="View full size image"
          />
          <img
            src={issue.imageUrl}
            alt=""
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {lightboxOpen && (
            <ImageViewer
              src={issue.imageUrl}
              alt={issue.title}
              onClose={() => setLightboxOpen(false)}
            />
          )}
          <div className="absolute top-3 right-3">
            <StatusBadge status={issue.status} />
          </div>
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {issue.title}
          </h3>
          {canChangeStatus && typeof onStatusChange === 'function' && (
            <select
              value={issue.status}
              onChange={(e) => onStatusChange(issue, e.target.value)}
              disabled={statusUpdating}
              aria-label={`Change status for ${issue.title}`}
              className="max-w-[11rem] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none ring-primary-500 focus:ring-2 disabled:opacity-50"
            >
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {!compact && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {issue.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          {displayLocation && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300">
              <MapPin size={14} />
              {displayLocation}
            </span>
          )}
          
          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar size={14} />
            {formatDate(issue.createdAt)}
          </span>
          
          {issue.predictedPriority != null && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium ${
              issue.predictedPriority >= 70
                ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300'
                : issue.predictedPriority >= 40
                ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                : 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
            }`}>
              <Clock size={14} />
              {issue.predictedPriority >= 70 ? 'High' : issue.predictedPriority >= 40 ? 'Medium' : 'Low'}
            </span>
          )}
        </div>
        
        {onUpvote && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={() => onUpvote(issue)}
              disabled={statusUpdating || upvoting}
              className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                issue.hasUpvoted
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-500'
              }`}>
                {issue.upvoteCount || 0}
              </span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
