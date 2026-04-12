import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';


export default function SubmitIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!location.trim()) {
      setError('Please select a city.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('location', location);
      if (image) form.append('image', image);

      const { data } = await api.post('/api/issues', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.duplicateWarning) {
        setSuccess(`Submitted. Note: ${data.duplicateWarning.message}.`);
      } else {
        setSuccess('Issue submitted successfully.');
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-slate-900">Report an issue</h1>
      <p className="mt-2 text-slate-600">
        Add a photo, describe the problem, and choose the city where it occurred.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{success}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
            placeholder="Short summary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
            placeholder="What happened? Where in the city?"
          />
        </div>

        <div>
  <label className="block text-sm font-medium text-slate-700">
    City
  </label>
  <input
    type="text"
    placeholder="Enter city (e.g. Delhi, Jaipur, New York)"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 ring-civic-500"
  />
</div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-civic-600 py-3 font-semibold text-white hover:bg-civic-700 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
