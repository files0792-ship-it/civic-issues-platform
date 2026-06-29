import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageViewer({ src, alt, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      <img
        src={src}
        alt={alt || 'Full size image'}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
      />
    </div>
  );
}
