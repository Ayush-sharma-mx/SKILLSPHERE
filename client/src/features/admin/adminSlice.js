import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getAdminStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getPlatformAnalytics = createAsyncThunk('admin/analytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/analytics');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getAdminUsers = createAsyncThunk('admin/users', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/users', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const verifyFreelancer = createAsyncThunk('admin/verifyFreelancer', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/admin/users/${id}/verify`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getAdminProjects = createAsyncThunk('admin/projects', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/projects', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getAdminPayments = createAsyncThunk('admin/payments', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/payments', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const getAdminDisputes = createAsyncThunk('admin/disputes', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/disputes', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    analytics: null,
    users: [],
    projects: [],
    payments: [],
    disputes: [],
    isLoading: false,
    error: null,
  },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminStats.fulfilled, (state, action) => { state.isLoading = false; state.stats = action.payload.data; })
      .addCase(getAdminStats.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(getPlatformAnalytics.fulfilled, (state, action) => { state.analytics = action.payload.data; })

      .addCase(getAdminUsers.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminUsers.fulfilled, (state, action) => { state.isLoading = false; state.users = action.payload.data; })
      .addCase(getAdminUsers.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload.data._id);
        if (idx !== -1) state.users[idx] = action.payload.data;
      })

      .addCase(verifyFreelancer.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u._id === action.payload.data._id);
        if (idx !== -1) state.users[idx] = action.payload.data;
      })

      .addCase(getAdminProjects.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminProjects.fulfilled, (state, action) => { state.isLoading = false; state.projects = action.payload.data; })

      .addCase(getAdminPayments.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminPayments.fulfilled, (state, action) => { state.isLoading = false; state.payments = action.payload.data; })

      .addCase(getAdminDisputes.pending, (state) => { state.isLoading = true; })
      .addCase(getAdminDisputes.fulfilled, (state, action) => { state.isLoading = false; state.disputes = action.payload.data; })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
