import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge.jsx';
import SearchableDropdown from '../components/SearchableDropdown.jsx';
import { ISSUE_STATUSES } from '../constants/issueStatus.js';
import {
  getIndianStates,
  getIndianCities,
  getAllIndianCities,
  getIndianStateName,
} from '../utils/indianLocations.js';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [q, setQ] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [pMin, setPMin] = useState('');
  const [pMax, setPMax] = useState('');

  const stateOptions = useMemo(
    () => [{ value: '', label: 'All States' }, ...getIndianStates()],
    []
  );

  const cityOptions = useMemo(() => {
    const cities = stateCode ? getIndianCities(stateCode) : getAllIndianCities();
    return [{ value: '', label: 'All Cities' }, ...cities];
  }, [stateCode]);

  const load = useCallback(async () => {
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
      if (pMin !== '') params.priorityMin = pMin;
      if (pMax !== '') params.priorityMax = pMax;
      const { data } = await api.get('/api/admin/issues', { params });
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [status, sort, q, stateCode, city, pMin, pMax]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id, newStatus, previousStatus) {
    setError('');
    setStatusUpdatingId(id);
    setIssues((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
    );
    try {
      const { data } = await api.patch(`/api/issues/${id}/status`, { status: newStatus });
      if (data.issue) {
        setIssues((prev) => prev.map((row) => (row.id === id ? { ...row, ...data.issue } : row)));
      }
    } catch {
      setError('Status update failed');
      setIssues((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: previousStatus } : row))
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this issue permanently?')) return;
    try {
      await api.delete(`/api/admin/issues/${id}`);
      await load();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">Manage civic issues, update status, and monitor community reports.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Search & Filters</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Search issues..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-w-[12rem] flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2"
            >
              <option value="">All statuses</option>
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-civic-500 focus:ring-2"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="upvotes">Most upvotes</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 max-w-xl">
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
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Priority:</span>
              <input
                type="number"
                placeholder="Min"
                value={pMin}
                onChange={(e) => setPMin(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none ring-civic-500 focus:ring-2"
                min="0"
                max="100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={pMax}
                onChange={(e) => setPMax(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none ring-civic-500 focus:ring-2"
                min="0"
                max="100"
              />
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-civic-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-civic-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="text-slate-500">Loading issues...</div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Issue Details</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Location</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Upvotes</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Priority</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-medium text-slate-900 mb-1">{row.title}</p>
                      <p className="line-clamp-2 text-sm text-slate-600">{row.description}</p>
                      {row.createdBy?.name && (
                        <p className="text-xs text-slate-500 mt-1">by {row.createdBy.name}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {row.location ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-900">{row.upvoteCount}</span>
                        <span className="text-xs text-slate-500">votes</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          row.predictedPriority >= 70 ? 'bg-red-100 text-red-700' :
                          row.predictedPriority >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {row.predictedPriority ?? '0'}
                        </span>
                        <span className="text-xs text-slate-500">priority</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={row.status}
                          disabled={statusUpdatingId === row.id}
                          onChange={(e) => updateStatus(row.id, e.target.value, row.status)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none ring-civic-500 focus:ring-2 disabled:opacity-50"
                        >
                          {ISSUE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => remove(row.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 && (
              <p className="p-8 text-center text-slate-500">No issues match filters.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
