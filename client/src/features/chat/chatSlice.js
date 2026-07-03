import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/chat/conversations');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversations');
  }
});

export const getOrCreateConversation = createAsyncThunk('chat/getOrCreate', async ({ participantId, projectId }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/chat/conversations', { participantId, projectId });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to start conversation');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (conversationId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/chat/${conversationId}/messages`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ conversationId, text, fileUrl }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/chat/send', { conversationId, text, fileUrl });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send message');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setActiveConversation: (state, action) => { state.activeConversation = action.payload; state.messages = []; },
    addMessage: (state, action) => {
      const exists = state.messages.find(m => m._id === action.payload._id);
      if (!exists) state.messages.push(action.payload);
      const conv = state.conversations.find(c => c._id === action.payload.conversation);
      if (conv) { conv.lastMessage = action.payload; conv.lastMessageAt = action.payload.createdAt; }
    },
    updateTyping: (state, action) => { state.typingUser = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.isLoading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => { state.isLoading = false; state.conversations = action.payload.data; })
      .addCase(fetchConversations.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.activeConversation = action.payload.data;
        const exists = state.conversations.find(c => c._id === action.payload.data._id);
        if (!exists) state.conversations.unshift(action.payload.data);
      })

      .addCase(fetchMessages.pending, (state) => { state.isLoading = true; state.messages = []; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.isLoading = false; state.messages = action.payload.data; })
      .addCase(fetchMessages.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const exists = state.messages.find(m => m._id === action.payload.data._id);
        if (!exists) state.messages.push(action.payload.data);
      });
  },
});

export const { setActiveConversation, addMessage, updateTyping } = chatSlice.actions;
export default chatSlice.reducer;
