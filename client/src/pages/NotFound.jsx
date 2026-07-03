import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl font-bold text-emerald-600">404</p>
      <p className="text-slate-500 dark:text-slate-400">That page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
