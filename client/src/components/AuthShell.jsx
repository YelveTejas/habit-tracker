import { Activity } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
            <Activity size={24} aria-hidden />
          </span>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
