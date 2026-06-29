import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { Sun, Moon, Menu, X } from 'lucide-react';

const navCls = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
    isActive 
      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;

export default function Layout({ children }) {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
            Civic Issues
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navCls} end>
              Feed
            </NavLink>

            {user && (
              <NavLink to="/submit" className={navCls}>
                Report
              </NavLink>
            )}

            {user && isAdmin && (
              <NavLink to="/admin" className={navCls}>
                Admin
              </NavLink>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            {user && <NotificationDropdown />}

            {!user ? (
              <>
                <NavLink to="/login" className={navCls}>
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all duration-200"
                >
                  Sign up
                </NavLink>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                    </div>
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Profile
                    </NavLink>
                    <button
                      onClick={() => { navigate('/settings'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => { navigate('/contact'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Help
                    </button>
                    <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('role');
                          window.location.href = '/login';
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <NavLink to="/" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" end onClick={() => setMobileMenuOpen(false)}>
              Feed
            </NavLink>
            {user && (
              <NavLink to="/submit" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
                Report
              </NavLink>
            )}
            {user && isAdmin && (
              <NavLink to="/admin" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {!user ? (
              <>
                <NavLink to="/login" className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/register" className="block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </NavLink>
              </>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  window.location.href = '/login';
                }}
                className="w-full text-left rounded-lg px-4 py-2 text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <Link to="/" className="font-display text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Civic Issues
              </Link>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Empowering communities to report and resolve civic issues together.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                About
              </Link>
              <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacy
              </Link>
              <Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contact
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Civic Issues Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
