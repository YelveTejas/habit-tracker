export default function StatCard({ icon: Icon, label, value, sub, accent = 'text-emerald-600 dark:text-emerald-400' }) {
  return (
    <div className="card animate-fade-up p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && <Icon size={18} className={accent} aria-hidden />}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}
