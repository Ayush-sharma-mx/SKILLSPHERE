import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const getUnreadCount = createAsyncThunk('notification/unreadCount', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAsRead = createAsyncThunk('notification/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllAsRead = createAsyncThunk('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/mark-all-read');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteNotification = createAsyncThunk('notification/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { notifications: [], unreadCount: 0, isLoading: false },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.data.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; })

      .addCase(getUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload.count; })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })

      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n && !n.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
