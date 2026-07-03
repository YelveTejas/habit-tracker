export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && <Icon size={36} className="mb-4 text-slate-300 dark:text-slate-600" aria-hidden />}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
