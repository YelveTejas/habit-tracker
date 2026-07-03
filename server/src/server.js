import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import startReminderJob from './jobs/reminderJob.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  startReminderJob();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
