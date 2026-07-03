import { useMemo, useState } from 'react';
import { prettyDate } from '../utils/dates';

const LEVELS = [
  'bg-slate-200 dark:bg-slate-800',                 // 0 - no completion
  'bg-emerald-200 dark:bg-emerald-900',             // low
  'bg-emerald-400 dark:bg-emerald-600',             // medium
  'bg-emerald-600 dark:bg-emerald-400',             // high
];

const levelFor = (count) => {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  return 3;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * GitHub-style contribution graph.
 * @param {Array<{date: string, count: number}>} data - last 365 days, ascending.
 */
export default function Heatmap({ data }) {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, monthLabels, total } = useMemo(() => {
    if (!data?.length) return { weeks: [], monthLabels: [], total: 0 };

    // Pad the first week so columns start on Sunday, like GitHub
    const firstDow = new Date(data[0].date + 'T00:00:00').getDay();
    const padded = [...Array(firstDow).fill(null), ...data];

    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

    const monthLabels = weeks.map((week, i) => {
      const first = week.find(Boolean);
      if (!first) return '';
      const d = new Date(first.date + 'T00:00:00');
      // Label a column when the month changes at that column
      if (i === 0 || d.getDate() <= 7) {
        const prev = weeks[i - 1]?.find(Boolean);
        const prevMonth = prev ? new Date(prev.date + 'T00:00:00').getMonth() : -1;
        if (d.getMonth() !== prevMonth) return MONTHS[d.getMonth()];
      }
      return '';
    });

    const total = data.reduce((sum, d) => sum + d.count, 0);
    return { weeks, monthLabels, total };
  }, [data]);

  const showTip = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = e.currentTarget.closest('[data-heatmap]').getBoundingClientRect();
    setTooltip({
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top,
      text: `Completed ${day.count} habit${day.count === 1 ? '' : 's'} on ${prettyDate(day.date)}`,
    });
  };

  return (
    <div data-heatmap className="relative">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{total}</span>{' '}
          completions in the last year
        </p>
        <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
          Less
          {LEVELS.map((c) => (
            <span key={c} className={`h-3 w-3 rounded-[3px] ${c}`} />
          ))}
          More
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
          <div className="mb-1 flex gap-[3px] pl-8 text-[10px] text-slate-400">
            {monthLabels.map((label, i) => (
              <span key={i} className="w-3 shrink-0 overflow-visible whitespace-nowrap">{label}</span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 flex w-7 flex-col justify-between py-0.5 text-[10px] text-slate-400">
              <span>Mon</span><span>Wed</span><span>Fri</span>
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di];
                  if (!day) return <span key={di} className="h-3 w-3" />;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      aria-label={`${day.count} completions on ${prettyDate(day.date)}`}
                      onMouseEnter={(e) => showTip(e, day)}
                      onFocus={(e) => showTip(e, day)}
                      onMouseLeave={() => setTooltip(null)}
                      onBlur={() => setTooltip(null)}
                      className={`h-3 w-3 rounded-[3px] transition-transform hover:scale-125 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${LEVELS[levelFor(day.count)]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-700"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
