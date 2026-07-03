import { Link } from 'react-router-dom';
import { Check, Flame, Pencil, Trash2 } from 'lucide-react';

export default function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  return (
    <div className="card animate-fade-up p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={() => onToggle(habit)}
            aria-pressed={habit.completedToday}
            aria-label={habit.completedToday ? `Unmark ${habit.name} for today` : `Mark ${habit.name} done for today`}
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition active:scale-90 ${
              habit.completedToday
                ? 'border-transparent text-white'
                : 'border-slate-300 text-transparent hover:border-emerald-500 dark:border-slate-600'
            }`}
            style={habit.completedToday ? { backgroundColor: habit.color } : undefined}
          >
            <Check size={18} strokeWidth={3} />
          </button>
          <div className="min-w-0">
            <Link to={`/habits/${habit._id}`} className="block truncate font-semibold hover:underline">
              {habit.name}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span
                className="rounded-full px-2 py-0.5 font-medium"
                style={{ backgroundColor: `${habit.color}22`, color: habit.color }}
              >
                {habit.category}
              </span>
              <span className="capitalize">{habit.frequency}</span>
              {habit.currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 font-semibold text-orange-500">
                  <Flame size={12} aria-hidden /> {habit.currentStreak}d
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => onEdit(habit)} aria-label={`Edit ${habit.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <Pencil size={15} />
          </button>
          <button type="button" onClick={() => onDelete(habit)} aria-label={`Delete ${habit.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {habit.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{habit.description}</p>
      )}
    </div>
  );
}
