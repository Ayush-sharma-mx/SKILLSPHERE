import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFreelancers = createAsyncThunk('freelancer/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/freelancers', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch freelancers');
  }
});

export const fetchFreelancerById = createAsyncThunk('freelancer/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/freelancers/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch freelancer');
  }
});

export const fetchMyFreelancerProfile = createAsyncThunk('freelancer/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/freelancers/me');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateMyFreelancerProfile = createAsyncThunk('freelancer/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/freelancers/me', profileData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const getFreelancerStats = createAsyncThunk('freelancer/getStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/freelancers/stats');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

export const uploadPortfolio = createAsyncThunk('freelancer/uploadPortfolio', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/freelancers/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const uploadResume = createAsyncThunk('freelancer/uploadResume', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/freelancers/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

const freelancerSlice = createSlice({
  name: 'freelancer',
  initialState: { freelancers: [], currentFreelancer: null, myProfile: null, stats: null, isLoading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFreelancers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFreelancers.fulfilled, (state, action) => { state.isLoading = false; state.freelancers = action.payload.data; })
      .addCase(fetchFreelancers.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchFreelancerById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFreelancerById.fulfilled, (state, action) => { state.isLoading = false; state.currentFreelancer = action.payload.data; })
      .addCase(fetchFreelancerById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchMyFreelancerProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyFreelancerProfile.fulfilled, (state, action) => { state.isLoading = false; state.myProfile = action.payload.data; })
      .addCase(fetchMyFreelancerProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(updateMyFreelancerProfile.pending, (state) => { state.isLoading = true; })
      .addCase(updateMyFreelancerProfile.fulfilled, (state, action) => { state.isLoading = false; state.myProfile = action.payload.data; })
      .addCase(updateMyFreelancerProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(getFreelancerStats.fulfilled, (state, action) => { state.stats = action.payload.data; })

      .addCase(uploadPortfolio.fulfilled, (state, action) => {
        if (state.myProfile) state.myProfile = action.payload.data;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        if (state.myProfile) state.myProfile.resumeUrl = action.payload.resumeUrl;
      });
  },
});

export const { clearError } = freelancerSlice.actions;
export default freelancerSlice.reducer;
