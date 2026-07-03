import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ListChecks, CheckCircle2, Flame, Trophy, Percent, Plus, Check } from 'lucide-react';
import { fetchDashboard } from '../features/dashboard/dashboardSlice';
import { fetchHabits, toggleToday } from '../features/habits/habitsSlice';
import Heatmap from '../components/Heatmap';
import StatCard from '../components/ui/StatCard';
import StreakBadge from '../components/ui/StreakBadge';
import WeeklyChart from '../components/charts/WeeklyChart';
import MonthlyChart from '../components/charts/MonthlyChart';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { stats, heatmap, weeklyProgress, monthlyProgress, status } = useSelector((s) => s.dashboard);
  const habits = useSelector((s) => s.habits.items);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleToggle = async (habit) => {
    setTogglingId(habit._id);
    const result = await dispatch(toggleToday({ id: habit._id, completedToday: habit.completedToday }));
    setTogglingId(null);
    if (toggleToday.fulfilled.match(result)) {
      toast.success(result.payload.completedToday ? `${habit.name} — done for today!` : 'Completion removed');
      dispatch(fetchDashboard());
    } else {
      toast.error(result.payload?.message || 'Could not update');
    }
  };

  if (status === 'loading' || !stats) return <Spinner full />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's how your habits are going.</p>
        </div>
        {stats.badge && <StreakBadge badge={stats.badge} />}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={ListChecks} label="Total habits" value={stats.totalHabits} />
        <StatCard icon={CheckCircle2} label="Done today" value={`${stats.completedToday}/${stats.totalHabits}`} />
        <StatCard icon={Flame} label="Current streak" value={stats.currentStreak} sub="days in a row" accent="text-orange-500" />
        <StatCard icon={Trophy} label="Longest streak" value={stats.longestStreak} sub="personal best" accent="text-amber-500" />
        <StatCard icon={Percent} label="Completion" value={`${stats.completionPercentage}%`} sub="last 30 days" />
      </div>

      {/* Heatmap - the centerpiece */}
      <section className="card animate-fade-up p-5 sm:p-6" aria-label="Activity heatmap">
        <h2 className="mb-4 font-display text-lg font-semibold">Your year at a glance</h2>
        <Heatmap data={heatmap} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card animate-fade-up p-5 sm:p-6" aria-label="Weekly progress">
          <h2 className="mb-4 font-display text-lg font-semibold">This week</h2>
          <WeeklyChart data={weeklyProgress} />
        </section>
        <section className="card animate-fade-up p-5 sm:p-6" aria-label="Monthly progress">
          <h2 className="mb-4 font-display text-lg font-semibold">Last 6 months</h2>
          <MonthlyChart data={monthlyProgress} />
        </section>
      </div>

      <section aria-label="Today's habits">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Today's habits</h2>
          <Link to="/habits" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Manage habits
          </Link>
        </div>
        {habits.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No habits yet"
            body="Create your first habit and start filling in that heatmap."
            action={<Link to="/habits" className="btn-primary"><Plus size={16} /> New habit</Link>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((h) => (
              <button
                key={h._id}
                type="button"
                onClick={() => handleToggle(h)}
                disabled={togglingId === h._id}
                aria-pressed={h.completedToday}
                className={`card flex items-center gap-3 p-4 text-left transition active:scale-[0.98] ${
                  h.completedToday ? 'ring-1 ring-emerald-500/40' : 'hover:shadow-md'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                    h.completedToday ? 'border-transparent text-white' : 'border-slate-300 text-transparent dark:border-slate-600'
                  }`}
                  style={h.completedToday ? { backgroundColor: h.color } : undefined}
                >
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${h.completedToday ? 'text-slate-400 line-through dark:text-slate-500' : ''}`}>
                    {h.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{h.category}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
