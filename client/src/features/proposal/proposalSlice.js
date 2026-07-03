import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const submitProposal = createAsyncThunk('proposal/submit', async (data, { rejectWithValue }) => {
  try {
    const { data: res } = await api.post('/proposals', data);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit proposal');
  }
});

export const fetchProjectProposals = createAsyncThunk('proposal/fetchForProject', async (projectId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/proposals/project/${projectId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch proposals');
  }
});

export const fetchMyProposals = createAsyncThunk('proposal/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/proposals/mine');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch proposals');
  }
});

export const updateProposalStatus = createAsyncThunk('proposal/updateStatus', async ({ id, status, clientNote }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/proposals/${id}/status`, { status, clientNote });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update proposal');
  }
});

export const withdrawProposal = createAsyncThunk('proposal/withdraw', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/proposals/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to withdraw proposal');
  }
});

const proposalSlice = createSlice({
  name: 'proposal',
  initialState: { proposals: [], myProposals: [], isLoading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(submitProposal.pending, (state) => { state.isLoading = true; })
      .addCase(submitProposal.fulfilled, (state, action) => { state.isLoading = false; state.myProposals.unshift(action.payload.data); })
      .addCase(submitProposal.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchProjectProposals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectProposals.fulfilled, (state, action) => { state.isLoading = false; state.proposals = action.payload.data; })
      .addCase(fetchProjectProposals.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchMyProposals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyProposals.fulfilled, (state, action) => { state.isLoading = false; state.myProposals = action.payload.data; })
      .addCase(fetchMyProposals.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(updateProposalStatus.fulfilled, (state, action) => {
        const idx = state.proposals.findIndex(p => p._id === action.payload.data._id);
        if (idx !== -1) state.proposals[idx] = action.payload.data;
      })
      .addCase(withdrawProposal.fulfilled, (state, action) => {
        state.myProposals = state.myProposals.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearError } = proposalSlice.actions;
export default proposalSlice.reducer;
