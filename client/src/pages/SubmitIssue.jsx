import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import SearchableDropdown from '../components/SearchableDropdown.jsx';
import { getIndianStates, getIndianCities, getIndianStateName } from '../utils/indianLocations.js';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';


export default function SubmitIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const states = useMemo(() => getIndianStates(), []);
  const cities = useMemo(() => getIndianCities(selectedStateCode), [selectedStateCode]);

  // Handle image preview
  useMemo(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!selectedStateCode) {
      toast.error('Please select a state');
      return;
    }
    if (!selectedCity) {
      toast.error('Please select a city');
      return;
    }
    
    setSubmitting(true);
    try {
      const stateName = getIndianStateName(selectedStateCode);
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('state', stateName);
      form.append('city', selectedCity);
      form.append('location', `${selectedCity}, ${stateName}`);
      if (image) form.append('image', image);

      const { data } = await api.post('/api/issues', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.duplicateWarning) {
        toast.success(`Submitted. Note: ${data.duplicateWarning.message}`);
      } else {
        toast.success('Issue submitted successfully');
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Report an issue</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Add a photo, describe the problem, and choose the city where it occurred.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none ring-primary-500 focus:ring-2 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Short summary of the issue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none ring-primary-500 focus:ring-2 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
            placeholder="What happened? Where in the city? Provide as much detail as possible."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <SearchableDropdown
            label="State"
            required
            options={states}
            value={selectedStateCode}
            onChange={(val) => {
              setSelectedStateCode(val);
              setSelectedCity('');
            }}
            placeholder="Select State"
          />

          <SearchableDropdown
            label="City"
            required
            disabled={!selectedStateCode}
            options={cities}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder={selectedStateCode ? "Select City" : "Select State First"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photo (optional)</label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                      Upload a file
                    </span>
                    <span className="text-slate-500 dark:text-slate-400"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Submit report
            </>
          )}
        </button>
      </form>
    </div>
  );
}