import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import IssueCard from '../components/IssueCard.jsx';
import SearchableDropdown from '../components/SearchableDropdown.jsx';
import MapView from '../components/MapView.jsx';
import Hero from '../components/Hero.jsx';
import {
  getIndianStates,
  getIndianCities,
  getAllIndianCities,
  getIndianStateName,
  getGeocodeQuery,
} from '../utils/indianLocations.js';

const STATUSES = ['', 'Pending', 'In Progress', 'Resolved'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'upvotes', label: 'Most upvotes' },
  { value: 'priority', label: 'Priority' },
];

const geoCache = {};

async function getCoordinates(query) {
  if (!query) return null;
  const trimmed = query.trim();
  if (geoCache[trimmed] !== undefined) {
    return geoCache[trimmed];
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}`
    );
    const data = await res.json();

    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geoCache[trimmed] = coords;
      return coords;
    }
  } catch (err) {
    console.error(`Failed to get coordinates for ${trimmed}:`, err);
  }

  geoCache[trimmed] = null;
  return null;
}

export default function Home() {
  const { user, token, isAdmin } = useAuth();
  const [view, setView] = useState('list');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('priority');
  const [q, setQ] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [upvotingId, setUpvotingId] = useState(null);
  const fetchSeq = useRef(0);

  const stateOptions = useMemo(
    () => [{ value: '', label: 'All States' }, ...getIndianStates()],
    []
  );

  const cityOptions = useMemo(() => {
    const cities = stateCode ? getIndianCities(stateCode) : getAllIndianCities();
    return [{ value: '', label: 'All Cities' }, ...cities];
  }, [stateCode]);

  const fetchIssues = useCallback(async () => {
    const seq = ++fetchSeq.current;
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (status) params.status = status;
      if (q.trim()) params.q = q.trim();
      if (stateCode) {
        const stateName = getIndianStateName(stateCode).trim();
        if (stateName) params.state = stateName;
      }
      if (city.trim()) params.city = city.trim();

      const { data } = await api.get('/api/issues', { params });
      if (seq !== fetchSeq.current) return;

      const issuesData = data.issues || [];

      const updatedIssues = await Promise.all(
        issuesData.map(async (issue) => {
          const coordinates = await getCoordinates(getGeocodeQuery(issue));
          return { ...issue, coordinates };
        })
      );

      setIssues(updatedIssues);
    } catch (err) {
      if (seq !== fetchSeq.current) return;
      setError(err.response?.data?.message || 'Could not load issues. Is the API running?');
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, [sort, status, q, stateCode, city]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  async function handleUpvote(issue) {
    if (!token) {
      alert('Please log in to upvote issues.');
      return;
    }

    setUpvotingId(issue.id);
    setError('');

    const originalIssue = { ...issue };
    const newUpvoteCount = issue.hasUpvoted ? Math.max(0, issue.upvoteCount - 1) : issue.upvoteCount + 1;
    const newPriority = Math.min(100, newUpvoteCount * 10);

    const optimisticUpdate = {
      ...issue,
      hasUpvoted: !issue.hasUpvoted,
      upvoteCount: newUpvoteCount,
      predictedPriority: newPriority,
    };

    setIssues((prevIssues) =>
      prevIssues.map((i) => (i.id === issue.id ? optimisticUpdate : i))
    );

    try {
      const { data } = await api.post(`/api/issues/${issue.id}/upvote`);
      setIssues((prevIssues) =>
        prevIssues.map((i) => (i.id === data.id ? { ...data } : i))
      );
    } catch (err) {
      setIssues((prevIssues) =>
        prevIssues.map((i) => (i.id === issue.id ? originalIssue : i))
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

    const originalIssue = { ...issue };
    const optimisticUpdate = {
      ...issue,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setIssues((prevIssues) =>
      prevIssues.map((i) => (i.id === issue.id ? optimisticUpdate : i))
    );

    try {
      const { data } = await api.patch(`/api/issues/${issue.id}/status`, { status: newStatus });
      if (data.issue) {
        setIssues((prevIssues) =>
          prevIssues.map((i) => (i.id === data.issue.id ? { ...data.issue } : i))
        );
      }
    } catch (err) {
      setIssues((prevIssues) =>
        prevIssues.map((i) => (i.id === issue.id ? originalIssue : i))
      );
      setError(err.response?.data?.message || 'Could not update status. You may need to log in again.');
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div>
      <Hero />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Community feed</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Civic issues by city — upvote to prioritize.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['list', 'compact', 'map'].map((v) => (
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
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-3xl lg:flex-1">
          <input
            type="search"
            placeholder="Search issues…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-civic-500 focus:ring-2 sm:col-span-2"
          />
          <SearchableDropdown
            label="State"
            options={stateOptions}
            value={stateCode}
            onChange={(val) => {
              setStateCode(val);
              setCity('');
            }}
            placeholder="All States"
          />
          <SearchableDropdown
            label="City"
            options={cityOptions}
            value={city}
            onChange={setCity}
            placeholder="All Cities"
          />
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
      ) : view === 'map' ? (
        <MapView issues={issues} />
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
                canChangeStatus={isAdmin}
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
