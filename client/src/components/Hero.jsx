import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, CheckCircle } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300">
              <CheckCircle size={16} />
              <span>Community-Driven Solutions</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Fix Your City
              <span className="block bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Together
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Report civic issues in your neighborhood, track their progress, and collaborate with your community to make real change. From potholes to streetlights, every issue matters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-200 group"
              >
                Report an Issue
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                Browse Issues
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={10000} suffix="+" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Issues Reported</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={85} suffix="%" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Resolution Rate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={5000} suffix="+" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="absolute -top-4 -right-4 w-72 h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/30 transform rotate-6 opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-48 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl shadow-2xl shadow-success-500/30 transform -rotate-6 opacity-20"></div>
              
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                      <MapPin className="text-warning-600 dark:text-warning-400" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Pothole on Main Street</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Downtown, Mumbai</div>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                      <span className="text-slate-400 dark:text-slate-500 text-sm">Issue Image</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white dark:border-slate-800"></div>
                        <div className="w-8 h-8 rounded-full bg-success-500 border-2 border-white dark:border-slate-800"></div>
                        <div className="w-8 h-8 rounded-full bg-warning-500 border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">+24 upvotes</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-xs font-medium">
                      <CheckCircle size={12} />
                      In Progress
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 left-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 border border-slate-200 dark:border-slate-700 animate-bounce">
                <Users className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div className="absolute -bottom-8 right-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 border border-slate-200 dark:border-slate-700">
                <CheckCircle className="text-success-600 dark:text-success-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
