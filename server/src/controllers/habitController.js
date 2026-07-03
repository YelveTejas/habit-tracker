import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { todayKey } from '../utils/dates.js';
import { computeStreaks } from '../utils/streaks.js';

/** Loads a habit and verifies it belongs to the requesting user. */
const findOwnedHabit = async (id, userId) => {
  const habit = await Habit.findById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (!habit.userId.equals(userId)) throw new AppError('You do not have access to this habit', 403);
  return habit;
};

// GET /api/habits - all habits with today's status + per-habit streaks
export const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id }).sort('-createdAt').lean();
  const completions = await HabitCompletion.find({ userId: req.user._id })
    .select('habitId completedDate')
    .lean();

  const byHabit = new Map();
  for (const c of completions) {
    const key = c.habitId.toString();
    if (!byHabit.has(key)) byHabit.set(key, new Set());
    byHabit.get(key).add(c.completedDate);
  }

  const today = todayKey();
  const data = habits.map((h) => {
    const dates = byHabit.get(h._id.toString()) || new Set();
    const { currentStreak, longestStreak } = computeStreaks(dates);
    return {
      ...h,
      completedToday: dates.has(today),
      totalCompletions: dates.size,
      currentStreak,
      longestStreak,
    };
  });

  res.json({ success: true, count: data.length, habits: data });
});

// POST /api/habits
export const createHabit = asyncHandler(async (req, res) => {
  const { name, description, category, frequency, color, startDate } = req.body;
  const habit = await Habit.create({
    userId: req.user._id,
    name,
    description,
    category,
    frequency,
    color,
    startDate: startDate || todayKey(),
  });
  res.status(201).json({ success: true, habit });
});

// PUT /api/habits/:id
export const updateHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const allowed = ['name', 'description', 'category', 'frequency', 'color', 'startDate'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) habit[field] = req.body[field];
  }
  await habit.save();
  res.json({ success: true, habit });
});

// DELETE /api/habits/:id - also removes its completion history
export const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  await HabitCompletion.deleteMany({ habitId: habit._id });
  await habit.deleteOne();
  res.json({ success: true, message: 'Habit deleted' });
});

// POST /api/habits/:id/complete - mark done for a day (default: today)
export const completeHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const date = req.body.date || todayKey();

  if (date > todayKey()) throw new AppError('You cannot complete a habit in the future', 400);
  if (date < habit.startDate) throw new AppError('Date is before this habit started', 400);

  try {
    const completion = await HabitCompletion.create({
      habitId: habit._id,
      userId: req.user._id,
      completedDate: date,
    });
    res.status(201).json({ success: true, completion });
  } catch (err) {
    if (err.code === 11000) throw new AppError('Already marked complete for that day', 409);
    throw err;
  }
});

// DELETE /api/habits/:id/complete - unmark (default: today, or ?date=YYYY-MM-DD)
export const uncompleteHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const date = req.query.date || req.body.date || todayKey();

  const removed = await HabitCompletion.findOneAndDelete({
    habitId: habit._id,
    completedDate: date,
  });
  if (!removed) throw new AppError('No completion found for that day', 404);

  res.json({ success: true, message: 'Completion removed' });
});

// GET /api/habits/:id/history - full completion history + streaks
export const getHabitHistory = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id);
  const completions = await HabitCompletion.find({ habitId: habit._id })
    .sort('completedDate')
    .select('completedDate createdAt')
    .lean();

  const dates = new Set(completions.map((c) => c.completedDate));
  const { currentStreak, longestStreak } = computeStreaks(dates);

  res.json({
    success: true,
    habit,
    history: completions,
    stats: { totalCompletions: completions.length, currentStreak, longestStreak },
  });
});
