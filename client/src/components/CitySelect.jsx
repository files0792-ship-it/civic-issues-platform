import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * Combobox: type to filter cities, pick from list or blur with exact match.
 * Options come from GET /api/cities (same whitelist as the server).
 */
export default function CitySelect({
  id = 'city',
  label = 'City',
  value,
  onChange,
  required = false,
  allowEmpty = false,
  emptyLabel = 'All cities',
  disabled = false,
}) {
  const [cities, setCities] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || '');
  const wrapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/cities');
        if (!cancelled) setCities(data.cities || []);
      } catch {
        if (!cancelled) setLoadError('Could not load cities');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const suggestions = useMemo(() => {
    const t = input.trim().toLowerCase();
    const list = cities.filter((c) => !t || c.toLowerCase().includes(t));
    if (allowEmpty && (!t || emptyLabel.toLowerCase().includes(t))) {
      return [{ key: '', label: emptyLabel, isEmpty: true }, ...list.map((c) => ({ key: c, label: c }))];
    }
    return list.map((c) => ({ key: c, label: c }));
  }, [cities, input, allowEmpty, emptyLabel]);

  function pick(item) {
    if (item.isEmpty) {
      onChange('');
      setInput('');
    } else {
      onChange(item.key);
      setInput(item.label);
    }
    setOpen(false);
  }

  function commitInput() {
    const t = input.trim();
    if (allowEmpty && !t) {
      onChange('');
      setInput('');
      setOpen(false);
      return;
    }
    const exact = cities.find((c) => c.toLowerCase() === t.toLowerCase());
    if (exact) {
      onChange(exact);
      setInput(exact);
    }
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled || (!!loadError && cities.length === 0)}
        required={required}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          if (allowEmpty && !e.target.value.trim()) onChange('');
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(commitInput, 120);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter') {
            e.preventDefault();
            const first = suggestions.find((s) => !s.isEmpty || allowEmpty);
            if (first) pick(first);
            else commitInput();
          }
        }}
        placeholder={allowEmpty ? 'Type to filter…' : 'Start typing a city…'}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-civic-500 focus:ring-2"
      />
      {loadError && <p className="mt-1 text-xs text-amber-700">{loadError}</p>}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((item) => (
            <li key={item.key || '__all'} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
