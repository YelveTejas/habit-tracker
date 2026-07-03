export default function Spinner({ full = false }) {
  const el = (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent"
    />
  );
  if (!full) return el;
  return <div className="flex min-h-[50vh] items-center justify-center">{el}</div>;
}
