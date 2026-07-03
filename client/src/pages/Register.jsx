import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { register } from '../features/auth/authSlice';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((s) => s.auth.status);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await dispatch(register({ name: form.name.trim(), email: form.email, password: form.password }));
    if (register.fulfilled.match(result)) {
      toast.success('Account created — welcome to HabitFlow!');
      navigate('/');
    } else {
      toast.error(result.payload);
    }
  };

  const field = (id, label, type, placeholder, autoComplete) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} type={type} autoComplete={autoComplete} className="input" placeholder={placeholder}
        value={form[id]} onChange={set(id)} />
      {errors[id] && <p className="mt-1 text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="Start tracking habits in under a minute">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {field('name', 'Name', 'text', 'Ada Lovelace', 'name')}
        {field('email', 'Email', 'email', 'you@example.com', 'email')}
        {field('password', 'Password', 'password', 'At least 8 characters', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'Repeat your password', 'new-password')}
        <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">Log in</Link>
      </p>
    </AuthShell>
  );
}
