import mongoose from 'mongoose';

export const DEFAULT_CATEGORIES = [
  'Health',
  'Fitness',
  'Learning',
  'Reading',
  'Meditation',
  'Productivity',
];

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Habit name is required'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    category: { type: String, trim: true, maxlength: 40, default: 'Productivity' },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    color: {
      type: String,
      default: '#10b981',
      match: [/^#([0-9a-fA-F]{6})$/, 'Color must be a hex value like #10b981'],
    },
    startDate: { type: String, required: true }, // YYYY-MM-DD (timezone-safe)
  },
  { timestamps: true }
);

export default mongoose.model('Habit', habitSchema);
