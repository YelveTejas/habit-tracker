import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import { todayKey } from '../utils/dates';

const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Reading', 'Meditation', 'Productivity'];
const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

const blank = () => ({
  name: '',
  description: '',
  category: 'Productivity',
  customCategory: '',
  frequency: 'daily',
  color: '#10b981',
  startDate: todayKey(),
});

export default function HabitModal({ open, onClose, onSubmit, habit, saving }) {
  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState({});
  const isCustom = form.category === '__custom';

  useEffect(() => {
    if (open) {
      if (habit) {
        const isKnown = CATEGORIES.includes(habit.category);
        setForm({
          name: habit.name,
          description: habit.description || '',
          category: isKnown ? habit.category : '__custom',
          customCategory: isKnown ? '' : habit.category,
          frequency: habit.frequency,
          color: habit.color,
          startDate: habit.startDate,
        });
      } else {
        setForm(blank());
      }
      setErrors({});
    }
  }, [open, habit]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Give this habit a name';
    if (isCustom && !form.customCategory.trim()) errs.customCategory = 'Name your category';
    if (form.startDate > todayKey()) errs.startDate = 'Start date cannot be in the future';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: isCustom ? form.customCategory.trim() : form.category,
      frequency: form.frequency,
      color: form.color,
      startDate: form.startDate,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={habit ? 'Edit habit' : 'New habit'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="habit-name" className="label">Name</label>
          <input id="habit-name" className="input" placeholder="Read 20 pages" value={form.name} onChange={set('name')} maxLength={80} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="habit-desc" className="label">Description <span className="font-normal normal-case text-slate-400">(optional)</span></label>
          <textarea id="habit-desc" className="input resize-none" rows={2} placeholder="Why this habit matters to you" value={form.description} onChange={set('description')} maxLength={500} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="habit-category" className="label">Category</label>
            <select id="habit-category" className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__custom">Custom…</option>
            </select>
          </div>
          <div>
            <label htmlFor="habit-frequency" className="label">Frequency</label>
            <select id="habit-frequency" className="input" value={form.frequency} onChange={set('frequency')}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {isCustom && (
          <div>
            <label htmlFor="habit-custom" className="label">Custom category</label>
            <input id="habit-custom" className="input" placeholder="e.g. Music" value={form.customCategory} onChange={set('customCategory')} maxLength={40} />
            {errors.customCategory && <p className="mt-1 text-xs text-red-500">{errors.customCategory}</p>}
          </div>
        )}

        <div>
          <label htmlFor="habit-start" className="label">Start date</label>
          <input id="habit-start" type="date" className="input" value={form.startDate} max={todayKey()} onChange={set('startDate')} />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </div>

        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Habit color">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={form.color === c}
                aria-label={`Color ${c}`}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`h-8 w-8 rounded-full transition ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-surface-dark-card' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : habit ? 'Save changes' : 'Create habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
