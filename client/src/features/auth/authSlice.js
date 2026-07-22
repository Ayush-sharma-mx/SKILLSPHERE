import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Load user from localStorage
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    localStorage.removeItem('token');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    if (!data.token) {
      return rejectWithValue('Login failed: No authentication token received');
    }
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    if (!err.response) {
      return rejectWithValue('Cannot connect to server. Please check your internet connection.');
    }
    return rejectWithValue(err.response?.data?.message || `Login failed (${err.response?.status})`);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    if (!data.token) {
      return rejectWithValue('Registration failed: No authentication token received');
    }
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    if (!err.response) {
      return rejectWithValue('Cannot connect to server. Please check your internet connection.');
    }
    return rejectWithValue(err.response?.data?.message || `Registration failed (${err.response?.status})`);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (_) {}
  localStorage.removeItem('token');
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send reset email');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/me', formData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Email verification failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },
    setUser: (state, action) => { state.user = action.payload; state.isAuthenticated = true; },
    setToken: (state, action) => { 
      state.token = action.payload.token; 
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    // loadUser
    builder.addCase(loadUser.pending, (state) => { state.isLoading = true; });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.isLoading = false;
      // Backend returns { data: { user, profile } }
      state.user = action.payload.data?.user || action.payload.data || action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });
    // loginUser
    builder.addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    // registerUser
    builder.addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
    // updateProfile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = { ...state.user, ...action.payload.data };
    });
    // verifyEmail
    builder.addCase(verifyEmail.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.message = action.payload.message || 'Email verified successfully!';
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearError, clearMessage, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;
