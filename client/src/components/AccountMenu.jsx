import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Generates initials (up to 2 chars) from a display name */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Hue derived from name for consistent avatar background colour */
function nameToHue(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % 360;
}

export default function AccountMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = getInitials(user.name);
  const hue = nameToHue(user.name);

  return (
    <button
      id="account-menu-btn"
      type="button"
      aria-label="Go to your profile"
      onClick={() => navigate('/profile')}
      className="relative flex items-center gap-2 rounded-full p-0.5 ring-2 ring-transparent hover:ring-civic-500 focus:outline-none focus:ring-civic-500 transition"
    >
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white select-none"
          style={{ background: `hsl(${hue} 60% 45%)` }}
        >
          {initials}
        </span>
      )}
    </button>
  );
}
