import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { apiError } from '../api/axios';
import AuthShell from '../components/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email');
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to set a new one">
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            If <span className="font-semibold">{email}</span> is registered, a reset link is on its way.
            The link is valid for 15 minutes.
          </p>
          <Link to="/login" className="btn-primary mt-6 w-full">Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={sending}>
            {sending ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Back to log in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
