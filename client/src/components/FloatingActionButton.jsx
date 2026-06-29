import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus } from 'lucide-react';

export default function FloatingActionButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/submit')}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-110 active:scale-95 transition-all duration-200 group"
      aria-label="Report an issue"
    >
      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
}
