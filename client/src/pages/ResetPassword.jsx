import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { apiError } from '../api/axios';
import AuthShell from '../components/AuthShell';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: form.password });
      localStorage.setItem('hf_token', data.token);
      toast.success('Password updated — you are logged in');
      window.location.assign('/');
    } catch (err) {
      toast.error(apiError(err));
      setSaving(false);
    }
  };

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="label">New password</label>
          <input id="password" type="password" autoComplete="new-password" className="input" placeholder="At least 8 characters"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <input id="confirm" type="password" autoComplete="new-password" className="input" placeholder="Repeat your password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
        <p className="text-center text-sm">
          <Link to="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Back to log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
