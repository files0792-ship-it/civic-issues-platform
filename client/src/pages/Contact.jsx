import { useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-md text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-success-600 dark:text-success-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Message Sent!</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">We'll get back to you as soon as possible.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Have a question or feedback? We'd love to hear from you.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white"
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea
              required
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none ring-primary-500 focus:ring-2 text-slate-900 dark:text-white resize-none"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Send Message
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
