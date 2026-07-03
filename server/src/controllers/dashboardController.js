import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import asyncHandler from '../utils/asyncHandler.js';
import { addDays, lastNDays, todayKey } from '../utils/dates.js';
import { computeStreaks, streakBadge } from '../utils/streaks.js';

const monthLabel = (key) => {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' });
};

// GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = todayKey();

  const [habits, completions] = await Promise.all([
    Habit.find({ userId }).lean(),
    HabitCompletion.find({ userId }).select('habitId completedDate').lean(),
  ]);

  // Index completions
  const countByDate = new Map(); // date -> number of habits completed
  const datesByHabit = new Map(); // habitId -> Set of dates
  const anyDay = new Set(); // days with >= 1 completion (overall streak)
  for (const c of completions) {
    countByDate.set(c.completedDate, (countByDate.get(c.completedDate) || 0) + 1);
    const hid = c.habitId.toString();
    if (!datesByHabit.has(hid)) datesByHabit.set(hid, new Set());
    datesByHabit.get(hid).add(c.completedDate);
    anyDay.add(c.completedDate);
  }

  const { currentStreak, longestStreak } = computeStreaks(anyDay);

  // Completion percentage over the last 30 days:
  // completed slots / possible slots (habit counts only from its start date)
  const window30 = lastNDays(30);
  let possible = 0;
  let done = 0;
  for (const day of window30) {
    for (const h of habits) {
      if (h.startDate <= day) {
        possible += 1;
        if (datesByHabit.get(h._id.toString())?.has(day)) done += 1;
      }
    }
  }
  const completionPercentage = possible === 0 ? 0 : Math.round((done / possible) * 100);

  // Heatmap: last 365 days
  const heatmap = lastNDays(365).map((date) => ({ date, count: countByDate.get(date) || 0 }));

  // Weekly progress: last 7 days
  const weeklyProgress = lastNDays(7).map((date) => {
    const [y, m, d] = date.split('-').map(Number);
    return {
      date,
      label: new Date(y, m - 1, d).toLocaleString('en-US', { weekday: 'short' }),
      completed: countByDate.get(date) || 0,
    };
  });

  // Monthly progress: completions per month, last 6 months
  const monthlyMap = new Map();
  const cutoff = addDays(today, -183);
  for (const [date, count] of countByDate) {
    if (date >= cutoff) {
      const key = date.slice(0, 7);
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + count);
    }
  }
  const monthlyProgress = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyProgress.push({ month: key, label: monthLabel(key), completed: monthlyMap.get(key) || 0 });
  }

  res.json({
    success: true,
    stats: {
      totalHabits: habits.length,
      completedToday: countByDate.get(today) || 0,
      currentStreak,
      longestStreak,
      completionPercentage,
      badge: streakBadge(currentStreak),
    },
    heatmap,
    weeklyProgress,
    monthlyProgress,
  });
});

// GET /api/dashboard/analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [habits, completions] = await Promise.all([
    Habit.find({ userId }).lean(),
    HabitCompletion.find({ userId }).select('habitId completedDate').lean(),
  ]);

  const datesByHabit = new Map();
  for (const c of completions) {
    const hid = c.habitId.toString();
    if (!datesByHabit.has(hid)) datesByHabit.set(hid, new Set());
    datesByHabit.get(hid).add(c.completedDate);
  }

  const today = todayKey();
  const window30 = lastNDays(30);
  const window7 = lastNDays(7);
  const prev7 = lastNDays(14).slice(0, 7);

  // Per-habit success rate over the last 30 days (bounded by each habit's start date)
  const perHabit = habits.map((h) => {
    const dates = datesByHabit.get(h._id.toString()) || new Set();
    const eligibleDays = window30.filter((d) => d >= h.startDate);
    const doneDays = eligibleDays.filter((d) => dates.has(d)).length;
    const successRate =
      eligibleDays.length === 0 ? 0 : Math.round((doneDays / eligibleDays.length) * 100);
    const { currentStreak, longestStreak } = computeStreaks(dates);
    return {
      habitId: h._id,
      name: h.name,
      color: h.color,
      category: h.category,
      successRate,
      totalCompletions: dates.size,
      currentStreak,
      longestStreak,
    };
  });

  const mostConsistent =
    perHabit.length > 0
      ? [...perHabit].sort((a, b) => b.successRate - a.successRate || b.totalCompletions - a.totalCompletions)[0]
      : null;

  // Trend: this week vs last week
  const countOn = (days) =>
    completions.filter((c) => days[0] <= c.completedDate && c.completedDate <= days[days.length - 1]).length;
  const thisWeek = countOn(window7);
  const lastWeek = countOn(prev7);

  // 12-week trend line
  const weeklyTrend = [];
  for (let w = 11; w >= 0; w--) {
    const end = addDays(today, -(w * 7));
    const start = addDays(end, -6);
    const count = completions.filter((c) => start <= c.completedDate && c.completedDate <= end).length;
    weeklyTrend.push({ weekEnding: end, completed: count });
  }

  // Category breakdown (all-time completions per category)
  const categoryMap = new Map();
  for (const h of habits) {
    const dates = datesByHabit.get(h._id.toString()) || new Set();
    categoryMap.set(h.category, (categoryMap.get(h.category) || 0) + dates.size);
  }
  const categories = [...categoryMap.entries()].map(([category, completed]) => ({ category, completed }));

  const overallRate =
    perHabit.length === 0
      ? 0
      : Math.round(perHabit.reduce((sum, h) => sum + h.successRate, 0) / perHabit.length);

  res.json({
    success: true,
    analytics: {
      habits: perHabit,
      mostConsistent,
      overallSuccessRate: overallRate,
      weekComparison: {
        thisWeek,
        lastWeek,
        change: lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100),
      },
      weeklyTrend,
      categories,
    },
  });
});
