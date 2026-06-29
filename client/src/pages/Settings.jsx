import { useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Bell, Moon, Sun, Globe } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your preferences.</p>

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
              <h2 className="font-display text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Moon size={16} />
                Appearance
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-slate-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
              <h2 className="font-display text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell size={16} />
                Notifications
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Email Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates about your reported issues</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    emailNotifs ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    emailNotifs ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
              <h2 className="font-display text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Globe size={16} />
                Region
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Globe size={20} className="text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">Country</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
