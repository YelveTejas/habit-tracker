import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiError } from '../../api/axios';

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/stats');
    return data;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const fetchAnalytics = createAsyncThunk('dashboard/analytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/analytics');
    return data.analytics;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    heatmap: [],
    weeklyProgress: [],
    monthlyProgress: [],
    analytics: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (s) => { if (!s.stats) s.status = 'loading'; })
      .addCase(fetchDashboard.fulfilled, (s, a) => {
        s.stats = a.payload.stats;
        s.heatmap = a.payload.heatmap;
        s.weeklyProgress = a.payload.weeklyProgress;
        s.monthlyProgress = a.payload.monthlyProgress;
        s.status = 'succeeded';
      })
      .addCase(fetchDashboard.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })
      .addCase(fetchAnalytics.fulfilled, (s, a) => { s.analytics = a.payload; });
  },
});

export default dashboardSlice.reducer;
