import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import IssueCard from '../components/IssueCard.jsx';
import CitySelect from '../components/CitySelect.jsx';
import MapView from '../components/MapView.jsx';


const STATUSES = ['', 'Pending', 'In Progress', 'Resolved'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'upvotes', label: 'Most upvotes' },
  { value: 'priority', label: 'Priority' },
];

async function getCoordinates(city) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
  );
  const data = await res.json();

  if (data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }

  return null;
}
export default function Home() {
  const { user, token } = useAuth();
  const [view, setView] = useState('list'); // list | compact
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('priority');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [upvotingId, setUpvotingId] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (status) params.status = status;
      if (q.trim()) params.q = q.trim();
      if (city) params.location = city;
      const { data } = await api.get('/api/issues', { params });
      const issuesData = data.issues || [];
      

      const updated = await Promise.all(
  issuesData.map(async (issue) => {
    const coords = await getCoordinates(issue.location);
    return { ...issue, coordinates: coords };
  })
);

setIssues(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load issues. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [sort, status, q, city]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  async function handleUpvote(issue) {
    
    if (!token) {
      setError('Log in to upvote.');
      return;
    }
    
    setUpvotingId(issue.id);
    setError('');
    
    // Create a copy of the original issue for potential revert
    const originalIssue = { ...issue };
    
    // Calculate new upvote count and priority
    const newUpvoteCount = issue.hasUpvoted ? Math.max(0, issue.upvoteCount - 1) : issue.upvoteCount + 1;
    const newPriority = Math.min(100, newUpvoteCount * 10);
    
    // Optimistic update - update UI immediately with proper immutability
    const optimisticUpdate = {
      ...issue,
      hasUpvoted: !issue.hasUpvoted,
      upvoteCount: newUpvoteCount,
      predictedPriority: newPriority
    };
    
    // Update state using functional form to ensure proper re-rendering
    setIssues(prevIssues => 
      prevIssues.map(i => i.id === issue.id ? optimisticUpdate : i)
    );
    
    try {
      const { data } = await api.post(`/api/issues/${issue.id}/upvote`);
      // Update with server response, ensuring we use the latest data
      setIssues(prevIssues => 
        prevIssues.map(i => i.id === data.id ? { ...data } : i)
      );
    } catch (err) {
      // Revert optimistic update on error
      setIssues(prevIssues => 
        prevIssues.map(i => i.id === issue.id ? originalIssue : i)
      );
      setError(err.response?.data?.message || 'Upvote failed. Please try again.');
    } finally {
      setUpvotingId(null);
    }
  }

  async function handleStatusChange(issue, newStatus) {
    if (!user || !token || newStatus === issue.status) return;
    
    setStatusUpdatingId(issue.id);
    setError('');
    
    // Create a copy of the original issue for potential revert
    const originalIssue = { ...issue };
    
    // Optimistic update - update UI immediately
    const optimisticUpdate = {
      ...issue,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Update state using functional form to ensure proper re-rendering
    setIssues(prevIssues => 
      prevIssues.map(i => i.id === issue.id ? optimisticUpdate : i)
    );
    
    try {
      const { data } = await api.patch(`/api/issues/${issue.id}/status`, { status: newStatus });
      if (data.issue) {
        // Update with server response, ensuring we use the latest data
        setIssues(prevIssues => 
          prevIssues.map(i => i.id === data.issue.id ? { ...data.issue } : i)
        );
      }
    } catch (err) {
      // Revert optimistic update on error
      setIssues(prevIssues => 
        prevIssues.map(i => i.id === issue.id ? originalIssue : i)
      );
      setError(err.response?.data?.message || 'Could not update status. You may need to log in again.');
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Community feed</h1>
          <p className="mt-1 text-slate-600">Civic issues by city — upvote to prioritize.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['list', 'compact','map'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
                view === v ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl lg:flex-1">
          <input
            type="search"
            placeholder="Search issues…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-civic-500 focus:ring-2"
          />
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <CitySelect
              id="feed-city"
              label="City"
              value={city}
              onChange={setCity}
              allowEmpty
              emptyLabel="All cities"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-civic-500 focus:ring-2"
          >
            {STATUSES.map((s) => (
              <option key={s || 'all'} value={s}>
                {s ? `Status: ${s}` : 'All statuses'}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-civic-500 focus:ring-2"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchIssues}
            className="rounded-xl bg-civic-600 px-4 py-2 text-sm font-medium text-white hover:bg-civic-700"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900" role="alert">
          {error}
        </p>
      )}

      {loading ? (
  <p className="mt-10 text-center text-slate-500">Loading issues…</p>
) : view === "map" ? (
  <MapView
    issues={issues}
  />
) : (
  <div className="mt-8 space-y-4">
          {!user && (
            <p className="text-sm text-slate-500">
              Log in to upvote, change issue status, and submit new reports.
            </p>
          )}
          {issues.length === 0 ? (
            <p className="text-slate-500">No issues match your filters.</p>
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={`${issue.id}-${issue.status}-${issue.upvoteCount}-${issue.hasUpvoted}`}
                issue={issue}
                onUpvote={handleUpvote}
                compact={view === 'compact'}
                canChangeStatus={localStorage.getItem('role') === 'admin'}
                onStatusChange={handleStatusChange}
                statusUpdating={statusUpdatingId === issue.id}
                upvoting={upvotingId === issue.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
