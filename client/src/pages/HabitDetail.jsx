import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Flame, Trophy, Hash } from 'lucide-react';
import api, { apiError } from '../api/axios';
import Heatmap from '../components/Heatmap';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import { prettyDate, todayKey } from '../utils/dates';

/** Builds a 365-day series from this habit's completion dates. */
const buildSeries = (dates) => {
  const set = new Set(dates);
  const out = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ date: key, count: set.has(key) ? 1 : 0 });
  }
  return out;
};

export default function HabitDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get(`/habits/${id}/history`)
      .then(({ data }) => active && setData(data))
      .catch((err) => {
        if (active) {
          setError(apiError(err));
          toast.error(apiError(err));
        }
      });
    return () => { active = false; };
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/habits" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          <ArrowLeft size={15} /> Back to habits
        </Link>
        <p className="text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }
  if (!data) return <Spinner full />;

  const { habit, history, stats } = data;
  const dates = history.map((h) => h.completedDate);

  return (
    <div className="space-y-6">
      <Link to="/habits" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
        <ArrowLeft size={15} /> Back to habits
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: habit.color }} aria-hidden />
        <h1 className="font-display text-2xl font-bold">{habit.name}</h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {habit.category} · {habit.frequency}
        </span>
      </div>
      {habit.description && <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">{habit.description}</p>}
      <p className="text-xs text-slate-400">Tracking since {prettyDate(habit.startDate)}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Flame} label="Current streak" value={stats.currentStreak} sub="days" accent="text-orange-500" />
        <StatCard icon={Trophy} label="Longest streak" value={stats.longestStreak} sub="days" accent="text-amber-500" />
        <StatCard icon={Hash} label="Total completions" value={stats.totalCompletions} />
      </div>

      <section className="card p-5 sm:p-6" aria-label="Habit activity heatmap">
        <h2 className="mb-4 font-display text-lg font-semibold">Last 365 days</h2>
        <Heatmap data={buildSeries(dates)} />
      </section>

      <section className="card p-5 sm:p-6" aria-label="Recent completions">
        <h2 className="mb-4 font-display text-lg font-semibold">Recent completions</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing yet — mark today done and it'll show up here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...history].reverse().slice(0, 14).map((c) => (
              <li key={c.completedDate} className="flex items-center justify-between py-2.5 text-sm">
                <span>{prettyDate(c.completedDate)}</span>
                {c.completedDate === todayKey() && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Today
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
