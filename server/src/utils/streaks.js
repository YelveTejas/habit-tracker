import { addDays, todayKey } from './dates.js';

/**
 * Compute current and longest streak from a Set of YYYY-MM-DD keys.
 * A streak is a run of consecutive days with at least one completion.
 * The current streak survives if today hasn't been completed yet
 * (it counts the run ending yesterday) but resets once a full day is missed.
 */
export function computeStreaks(dateSet) {
  if (!dateSet || dateSet.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = todayKey();

  // Current streak: walk backwards from today (or yesterday if today not done yet)
  let cursor = dateSet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (dateSet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // Longest streak: scan sorted dates for consecutive runs
  const sorted = [...dateSet].sort();
  let longestStreak = 0;
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1;
    if (run > longestStreak) longestStreak = run;
    prev = d;
  }

  return { currentStreak, longestStreak };
}

/** Badge tiers displayed by the client. */
export function streakBadge(streak) {
  if (streak >= 365) return { id: 'legend', label: 'Legend', threshold: 365 };
  if (streak >= 100) return { id: 'centurion', label: 'Centurion', threshold: 100 };
  if (streak >= 30) return { id: 'monthly-master', label: 'Monthly Master', threshold: 30 };
  if (streak >= 7) return { id: 'week-warrior', label: 'Week Warrior', threshold: 7 };
  if (streak >= 3) return { id: 'spark', label: 'Spark', threshold: 3 };
  return null;
}
