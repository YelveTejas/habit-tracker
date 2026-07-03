import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { updateProfile } from '../features/auth/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [info, setInfo] = useState({ name: user?.name || '', email: user?.email || '' });
  const [reminders, setReminders] = useState({
    reminderEnabled: user?.reminderEnabled || false,
    reminderTime: user?.reminderTime || '09:00',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(null); // 'info' | 'reminders' | 'password'

  const save = async (section, payload, onSuccess) => {
    setSaving(section);
    const result = await dispatch(updateProfile(payload));
    setSaving(null);
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Saved');
      onSuccess?.();
    } else {
      toast.error(result.payload);
    }
  };

  const saveInfo = (e) => {
    e.preventDefault();
    if (!info.name.trim()) return toast.error('Name is required');
    if (!/^\S+@\S+\.\S+$/.test(info.email)) return toast.error('Enter a valid email');
    save('info', { name: info.name.trim(), email: info.email });
  };

  const saveReminders = (e) => {
    e.preventDefault();
    save('reminders', reminders);
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    save('password',
      { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      () => setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <form onSubmit={saveInfo} className="card space-y-4 p-6" noValidate>
        <h2 className="font-display font-semibold">Account</h2>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" className="input" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} maxLength={60} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving === 'info'}>
            {saving === 'info' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={saveReminders} className="card space-y-4 p-6" noValidate>
        <h2 className="font-display font-semibold">Daily reminder</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get an email listing any habits still incomplete for the day.
        </p>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={reminders.reminderEnabled}
            onChange={(e) => setReminders({ ...reminders, reminderEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium">Send me a daily reminder email</span>
        </label>
        {reminders.reminderEnabled && (
          <div className="max-w-[10rem]">
            <label htmlFor="reminderTime" className="label">Reminder time</label>
            <input
              id="reminderTime"
              type="time"
              className="input"
              value={reminders.reminderTime}
              onChange={(e) => setReminders({ ...reminders, reminderTime: e.target.value })}
            />
          </div>
        )}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving === 'reminders'}>
            {saving === 'reminders' ? 'Saving…' : 'Save reminder'}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-6" noValidate>
        <h2 className="font-display font-semibold">Change password</h2>
        <div>
          <label htmlFor="current" className="label">Current password</label>
          <input id="current" type="password" autoComplete="current-password" className="input"
            value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new" className="label">New password</label>
            <input id="new" type="password" autoComplete="new-password" className="input"
              value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm new password</label>
            <input id="confirm" type="password" autoComplete="new-password" className="input"
              value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving === 'password'}>
            {saving === 'password' ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}
