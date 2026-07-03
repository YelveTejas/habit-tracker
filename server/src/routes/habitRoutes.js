import { Router } from 'express';
import {
  getHabits, createHabit, updateHabit, deleteHabit,
  completeHabit, uncompleteHabit, getHabitHistory,
} from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { habitRules, completionRules } from '../validators/habitValidators.js';

const router = Router();
router.use(protect);

router.route('/').get(getHabits).post(habitRules, validate, createHabit);
router.route('/:id').put(habitRules, validate, updateHabit).delete(deleteHabit);
router.route('/:id/complete')
  .post(completionRules, validate, completeHabit)
  .delete(uncompleteHabit);
router.get('/:id/history', getHabitHistory);

export default router;
