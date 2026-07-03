import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiError } from '../../api/axios';

export const fetchHabits = createAsyncThunk('habits/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/habits');
    return data.habits;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const createHabit = createAsyncThunk('habits/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/habits', payload);
    return data.habit;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const updateHabit = createAsyncThunk('habits/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/habits/${id}`, payload);
    return data.habit;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const deleteHabit = createAsyncThunk('habits/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/habits/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

/** Optimistically toggles today's completion for a habit. */
export const toggleToday = createAsyncThunk(
  'habits/toggleToday',
  async ({ id, completedToday }, { rejectWithValue }) => {
    try {
      if (completedToday) await api.delete(`/habits/${id}/complete`);
      else await api.post(`/habits/${id}/complete`, {});
      return { id, completedToday: !completedToday };
    } catch (err) {
      return rejectWithValue({ id, message: apiError(err) });
    }
  }
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (s) => { if (s.status === 'idle') s.status = 'loading'; })
      .addCase(fetchHabits.fulfilled, (s, a) => { s.items = a.payload; s.status = 'succeeded'; })
      .addCase(fetchHabits.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
      .addCase(createHabit.fulfilled, (s, a) => {
        s.items.unshift({ ...a.payload, completedToday: false, totalCompletions: 0, currentStreak: 0, longestStreak: 0 });
      })
      .addCase(updateHabit.fulfilled, (s, a) => {
        const i = s.items.findIndex((h) => h._id === a.payload._id);
        if (i !== -1) s.items[i] = { ...s.items[i], ...a.payload };
      })
      .addCase(deleteHabit.fulfilled, (s, a) => {
        s.items = s.items.filter((h) => h._id !== a.payload);
      })
      // Optimistic toggle
      .addCase(toggleToday.pending, (s, a) => {
        const h = s.items.find((x) => x._id === a.meta.arg.id);
        if (h) {
          h.completedToday = !h.completedToday;
          h.totalCompletions += h.completedToday ? 1 : -1;
          h.currentStreak = Math.max(0, h.currentStreak + (h.completedToday ? 1 : -1));
        }
      })
      .addCase(toggleToday.rejected, (s, a) => {
        const h = s.items.find((x) => x._id === a.payload?.id);
        if (h) {
          h.completedToday = !h.completedToday; // roll back
          h.totalCompletions += h.completedToday ? 1 : -1;
          h.currentStreak = Math.max(0, h.currentStreak + (h.completedToday ? 1 : -1));
        }
      });
  },
});

export default habitsSlice.reducer;
