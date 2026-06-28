import { useState, useRef, useEffect } from 'react';

export default function SearchableDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-left outline-none ring-civic-500 focus:ring-2 bg-white flex items-center justify-between transition duration-200 ${
          disabled
            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
            : 'text-slate-900 hover:border-slate-300'
        }`}
      >
        <span className={!selectedOption ? 'text-slate-400 font-normal' : 'font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 max-h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col transition duration-200 scale-100 origin-top">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none ring-civic-500 focus:ring-2 bg-white text-slate-800 transition duration-150"
              />
            </div>
          </div>
          
          <ul className="overflow-y-auto flex-1 max-h-48 py-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500 text-center font-normal">
                No results found
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      opt.value === value
                        ? 'bg-civic-50 font-semibold text-civic-700'
                        : 'text-slate-700 font-normal'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && (
                      <svg className="h-4 w-4 text-civic-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
