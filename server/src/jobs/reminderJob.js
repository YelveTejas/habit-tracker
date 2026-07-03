import cron from 'node-cron';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import sendEmail, { emailConfigured } from '../utils/sendEmail.js';
import { todayKey } from '../utils/dates.js';

/**
 * Runs every minute; emails users whose reminderTime matches the current
 * server time, listing habits still incomplete today.
 * Note: reminder times are interpreted in the server's timezone. For
 * multi-timezone deployments, store a timezone per user and convert here.
 */
const startReminderJob = () => {
  if (!emailConfigured()) {
    console.warn('[reminders] SMTP not configured - reminder emails disabled');
    return;
  }

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const users = await User.find({ reminderEnabled: true, reminderTime: hhmm }).lean();
      if (users.length === 0) return;

      const today = todayKey();
      for (const user of users) {
        const habits = await Habit.find({ userId: user._id, startDate: { $lte: today } }).lean();
        if (habits.length === 0) continue;

        const doneToday = await HabitCompletion.find({ userId: user._id, completedDate: today })
          .select('habitId')
          .lean();
        const doneSet = new Set(doneToday.map((c) => c.habitId.toString()));
        const pending = habits.filter((h) => !doneSet.has(h._id.toString()));
        if (pending.length === 0) continue;

        await sendEmail({
          to: user.email,
          subject: `HabitFlow: ${pending.length} habit${pending.length > 1 ? 's' : ''} waiting for you today`,
          text: `Still to do today: ${pending.map((h) => h.name).join(', ')}`,
          html: `
            <p>Hi ${user.name},</p>
            <p>You still have ${pending.length} habit${pending.length > 1 ? 's' : ''} to complete today:</p>
            <ul>${pending.map((h) => `<li>${h.name}</li>`).join('')}</ul>
            <p>Keep the streak alive!</p>`,
        });
      }
    } catch (err) {
      console.error('[reminders] job failed:', err.message);
    }
  });

  console.log('[reminders] daily reminder job scheduled');
};

export default startReminderJob;
