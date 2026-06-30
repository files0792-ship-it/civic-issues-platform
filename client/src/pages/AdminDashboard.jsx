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
import { FileText, Clock, CheckCircle, Users, Search, Trash2, TrendingUp } from 'lucide-react';

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

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Manage civic issues, update status, and monitor community reports.</p>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Issues</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{issues.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FileText className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
              <p className="mt-2 text-3xl font-bold text-warning-600 dark:text-warning-400">
                {issues.filter(i => i.status === 'Pending').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <Clock className="text-warning-600 dark:text-warning-400" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved</p>
              <p className="mt-2 text-3xl font-bold text-success-600 dark:text-success-400">
                {issues.filter(i => i.status === 'Resolved').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <CheckCircle className="text-success-600 dark:text-success-400" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">High Priority</p>
              <p className="mt-2 text-3xl font-bold text-danger-600 dark:text-danger-400">
                {issues.filter(i => i.predictedPriority >= 70).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <TrendingUp className="text-danger-600 dark:text-danger-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Search size={16} />
            Search & Filters
          </h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Search issues..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-w-[12rem] flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
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
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority:</span>
              <input
                type="number"
                placeholder="Min"
                value={pMin}
                onChange={(e) => setPMin(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
                min="0"
                max="100"
              />
              <span className="text-slate-400 dark:text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={pMax}
                onChange={(e) => setPMax(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
                min="0"
                max="100"
              />
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-danger-600 dark:text-danger-400">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="text-slate-500 dark:text-slate-400">Loading issues...</div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Issue Details</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Location</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Upvotes</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Priority</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {issues.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white mb-1">{row.title}</p>
                      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{row.description}</p>
                      {row.createdBy?.name && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">by {row.createdBy.name}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {row.location ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{row.upvoteCount}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">votes</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          row.predictedPriority >= 70 ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300' :
                          row.predictedPriority >= 40 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' :
                          'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                        }`}>
                          {row.predictedPriority ?? '0'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">priority</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={row.status}
                          disabled={statusUpdatingId === row.id}
                          onChange={(e) => updateStatus(row.id, e.target.value, row.status)}
                          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm outline-none ring-primary-500 focus:ring-2 disabled:opacity-50 text-slate-800 dark:text-slate-200"
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
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600 dark:hover:text-danger-400 hover:border-danger-200 dark:hover:border-danger-800 transition-colors"
                          title="Delete issue"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 && (
              <p className="p-8 text-center text-slate-500 dark:text-slate-400">No issues match filters.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
