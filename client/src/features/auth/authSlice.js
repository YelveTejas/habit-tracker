import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiError } from '../../api/axios';

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('hf_token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('hf_token', data.token);
    return data.user;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) {
    localStorage.removeItem('hf_token');
    return rejectWithValue(apiError(err));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', payload);
    return data.user;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('hf_token');
  }
});

const initialState = {
  user: null,
  status: localStorage.getItem('hf_token') ? 'loading' : 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const authed = (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    };
    builder
      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, authed)
      .addCase(register.rejected, (s, a) => { s.status = 'unauthenticated'; s.error = a.payload; })
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, authed)
      .addCase(login.rejected, (s, a) => { s.status = 'unauthenticated'; s.error = a.payload; })
      .addCase(loadUser.pending, (s) => { s.status = 'loading'; })
      .addCase(loadUser.fulfilled, authed)
      .addCase(loadUser.rejected, (s) => { s.status = 'unauthenticated'; s.user = null; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(logout.fulfilled, (s) => { s.user = null; s.status = 'unauthenticated'; });
  },
});

export default authSlice.reducer;
