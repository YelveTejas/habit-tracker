import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { login } from '../features/auth/authSlice';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Enter your email and password');
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name.split(' ')[0]}!`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streaks alive">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Forgot password?
            </Link>
          </div>
          <input id="password" type="password" autoComplete="current-password" className="input" placeholder="••••••••"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link to="/register" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
