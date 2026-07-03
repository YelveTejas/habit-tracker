import { Flame, Award, Trophy, Crown, Sparkles } from 'lucide-react';

const BADGES = {
  spark: { icon: Sparkles, classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  'week-warrior': { icon: Flame, classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  'monthly-master': { icon: Award, classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  centurion: { icon: Trophy, classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  legend: { icon: Crown, classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
};

export default function StreakBadge({ badge }) {
  if (!badge) return null;
  const cfg = BADGES[badge.id];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.classes}`}>
      <Icon size={13} aria-hidden />
      {badge.label}
    </span>
  );
}
