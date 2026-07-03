import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, Star, BarChart3 } from 'lucide-react';
import { fetchAnalytics } from '../features/dashboard/dashboardSlice';
import TrendChart from '../components/charts/TrendChart';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Analytics() {
  const dispatch = useDispatch();
  const analytics = useSelector((s) => s.dashboard.analytics);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (!analytics) return <Spinner full />;

  const { habits, mostConsistent, overallSuccessRate, weekComparison, weeklyTrend, categories } = analytics;
  const up = weekComparison.change >= 0;

  if (habits.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <EmptyState icon={BarChart3} title="No data yet" body="Create habits and complete them for a few days — your trends will appear here." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Success rates are measured over the last 30 days.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card animate-fade-up p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Overall success rate</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{overallSuccessRate}%</p>
        </div>
        <div className="card animate-fade-up p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">This week vs last</p>
          <p className={`mt-2 flex items-center gap-2 font-display text-3xl font-bold tabular-nums ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {up ? <TrendingUp size={24} aria-hidden /> : <TrendingDown size={24} aria-hidden />}
            {up ? '+' : ''}{weekComparison.change}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{weekComparison.thisWeek} vs {weekComparison.lastWeek} completions</p>
        </div>
        <div className="card animate-fade-up p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Star size={13} className="text-amber-500" aria-hidden /> Most consistent
          </p>
          {mostConsistent ? (
            <>
              <p className="mt-2 truncate font-display text-xl font-bold">{mostConsistent.name}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{mostConsistent.successRate}% success rate</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">—</p>
          )}
        </div>
      </div>

      <section className="card animate-fade-up p-5 sm:p-6" aria-label="12-week trend">
        <h2 className="mb-4 font-display text-lg font-semibold">Completion trend — last 12 weeks</h2>
        <TrendChart data={weeklyTrend} />
      </section>

      <section className="card animate-fade-up p-5 sm:p-6" aria-label="Habit success rates">
        <h2 className="mb-4 font-display text-lg font-semibold">Success rate by habit</h2>
        <ul className="space-y-4">
          {[...habits].sort((a, b) => b.successRate - a.successRate).map((h) => (
            <li key={h.habitId}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: h.color }} aria-hidden />
                  <span className="truncate font-medium">{h.name}</span>
                  <span className="hidden text-xs text-slate-400 sm:inline">{h.category}</span>
                </span>
                <span className="font-semibold tabular-nums">{h.successRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={h.successRate} aria-valuemin={0} aria-valuemax={100} aria-label={`${h.name} success rate`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${h.successRate}%`, backgroundColor: h.color }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {categories.length > 0 && (
        <section className="card animate-fade-up p-5 sm:p-6" aria-label="Completions by category">
          <h2 className="mb-4 font-display text-lg font-semibold">Completions by category</h2>
          <div className="flex flex-wrap gap-3">
            {[...categories].sort((a, b) => b.completed - a.completed).map((c) => (
              <div key={c.category} className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.category}</p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">{c.completed}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
