import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('payment/createOrder', async ({ projectId, milestoneIndex, amount }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/create-order', { projectId, milestoneIndex, amount });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create payment order');
  }
});

export const verifyPayment = createAsyncThunk('payment/verify', async (paymentData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/verify', paymentData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Payment verification failed');
  }
});

export const getPaymentHistory = createAsyncThunk('payment/history', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/payments/history');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments');
  }
});

export const releaseMilestonePayment = createAsyncThunk('payment/release', async (paymentId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/payments/release/${paymentId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to release payment');
  }
});

export const requestRefund = createAsyncThunk('payment/refund', async (paymentId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/payments/refund/${paymentId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to request refund');
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: { payments: [], currentOrder: null, isLoading: false, error: null },
  reducers: { clearOrder: (state) => { state.currentOrder = null; }, clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => { state.isLoading = false; state.currentOrder = action.payload.data; })
      .addCase(createOrder.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(verifyPayment.pending, (state) => { state.isLoading = true; })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false; state.currentOrder = null;
        const idx = state.payments.findIndex(p => p._id === action.payload.data._id);
        if (idx !== -1) state.payments[idx] = action.payload.data;
        else state.payments.unshift(action.payload.data);
      })
      .addCase(verifyPayment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(getPaymentHistory.pending, (state) => { state.isLoading = true; })
      .addCase(getPaymentHistory.fulfilled, (state, action) => { state.isLoading = false; state.payments = action.payload.data; })
      .addCase(getPaymentHistory.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(releaseMilestonePayment.fulfilled, (state, action) => {
        const idx = state.payments.findIndex(p => p._id === action.payload.data._id);
        if (idx !== -1) state.payments[idx] = action.payload.data;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        const idx = state.payments.findIndex(p => p._id === action.payload.data._id);
        if (idx !== -1) state.payments[idx] = action.payload.data;
      });
  },
});

export const { clearOrder, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
