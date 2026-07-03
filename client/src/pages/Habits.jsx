import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Plus, ListChecks } from 'lucide-react';
import {
  fetchHabits, createHabit, updateHabit, deleteHabit, toggleToday,
} from '../features/habits/habitsSlice';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Habits() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.habits);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => { dispatch(fetchHabits()); }, [dispatch]);

  const categories = useMemo(
    () => ['All', ...new Set(items.map((h) => h.category))],
    [items]
  );
  const visible = filter === 'All' ? items : items.filter((h) => h.category === filter);

  const handleSubmit = async (payload) => {
    setSaving(true);
    const action = editing
      ? updateHabit({ id: editing._id, ...payload })
      : createHabit(payload);
    const result = await dispatch(action);
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editing ? 'Habit updated' : 'Habit created');
      setModalOpen(false);
      setEditing(null);
    } else {
      toast.error(result.payload);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const result = await dispatch(deleteHabit(deleting._id));
    setSaving(false);
    if (deleteHabit.fulfilled.match(result)) {
      toast.success('Habit deleted');
      setDeleting(null);
    } else {
      toast.error(result.payload);
    }
  };

  const handleToggle = async (habit) => {
    const result = await dispatch(toggleToday({ id: habit._id, completedToday: habit.completedToday }));
    if (toggleToday.fulfilled.match(result)) {
      toast.success(result.payload.completedToday ? 'Marked done for today' : 'Completion removed');
    } else {
      toast.error(result.payload?.message || 'Could not update');
    }
  };

  if (status === 'loading') return <Spinner full />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Habits</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {items.length} habit{items.length === 1 ? '' : 's'} · tap the check to mark today
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16} /> New habit
        </button>
      </div>

      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={filter === 'All' ? 'No habits yet' : `Nothing in ${filter}`}
          body={filter === 'All' ? 'Every streak starts with a single habit. Create one to begin.' : 'Try a different category or create a new habit.'}
          action={
            <button type="button" className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus size={16} /> New habit
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((h) => (
            <HabitCard
              key={h._id}
              habit={h}
              onToggle={handleToggle}
              onEdit={(habit) => { setEditing(habit); setModalOpen(true); }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <HabitModal
        open={modalOpen}
        habit={editing}
        saving={saving}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        loading={saving}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleting?.name}"?`}
        body="This permanently removes the habit and its entire completion history. This can't be undone."
      />
    </div>
  );
}
