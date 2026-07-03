import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
