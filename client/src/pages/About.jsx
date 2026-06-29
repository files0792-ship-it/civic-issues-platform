import { Shield, Users, Target, Heart } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';

const values = [
  { icon: Shield, title: 'Transparency', desc: 'Every issue is tracked publicly from report to resolution.' },
  { icon: Users, title: 'Community-Driven', desc: 'Citizens vote on priorities — the loudest issues get heard first.' },
  { icon: Target, title: 'Accountability', desc: 'Public officials see real-time data on unresolved problems.' },
  { icon: Heart, title: 'Impact', desc: 'Small fixes add up to safer, cleaner neighborhoods for everyone.' },
];

export default function About() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">About Civic Issues</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Bridging the gap between citizens and local government.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Civic Issues is an open platform that empowers citizens to report, track, and resolve municipal problems in their neighborhoods. From potholes and broken streetlights to garbage dumping and water logging — every report creates a transparent record that demands action.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                  <v.icon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-white">{v.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
