import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    completedDate: {
      type: String, // YYYY-MM-DD - avoids timezone drift entirely
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'completedDate must be YYYY-MM-DD'],
    },
  },
  { timestamps: true }
);

// Prevents duplicate completions for the same habit on the same day at the DB level
completionSchema.index({ habitId: 1, completedDate: 1 }, { unique: true });
completionSchema.index({ userId: 1, completedDate: 1 });

export default mongoose.model('HabitCompletion', completionSchema);
