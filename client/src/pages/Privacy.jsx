import PageTransition from '../components/PageTransition.jsx';

export default function Privacy() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Last updated: June 2026</p>

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Information We Collect</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              We collect your name and email address when you register. Issue reports include the location and photo you provide. We do not sell or share your personal data with third parties.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">How We Use Your Data</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Your account information is used to authenticate you and associate issues with your profile. Issue locations help group reports by neighborhood so officials can respond efficiently.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">Contact</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              If you have questions about this policy, please reach out via our Contact page.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
