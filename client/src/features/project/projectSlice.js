import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk('project/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/projects', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('project/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('project/create', async (projectData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/projects', projectData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('project/update', async ({ id, projectData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const updateMilestone = createAsyncThunk('project/updateMilestone', async ({ projectId, milestoneIndex, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/projects/${projectId}/milestone`, { milestoneIndex, status });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update milestone');
  }
});

export const fetchMyProjects = createAsyncThunk('project/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/projects/my');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch your projects');
  }
});

export const fetchAssignedProjects = createAsyncThunk('project/fetchAssigned', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/projects/assigned');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch assigned projects');
  }
});

export const fetchAIMatches = createAsyncThunk('project/aiMatches', async (projectId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/freelancers/ai-match/${projectId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'AI matching failed');
  }
});

export const deleteProject = createAsyncThunk('project/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    myProjects: [],
    assignedProjects: [],
    currentProject: null,
    aiMatches: [],
    aiMatchesLoading: false,
    isLoading: false,
    error: null,
    pagination: { total: 0, page: 1, pages: 1 },
  },
  reducers: {
    clearCurrentProject: (state) => { state.currentProject = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchProjectById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectById.fulfilled, (state, action) => { state.isLoading = false; state.currentProject = action.payload.data; })
      .addCase(fetchProjectById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(createProject.fulfilled, (state, action) => {
        state.myProjects.unshift(action.payload.data);
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        state.currentProject = action.payload.data;
        const idx = state.myProjects.findIndex(p => p._id === action.payload.data._id);
        if (idx !== -1) state.myProjects[idx] = action.payload.data;
      })

      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.currentProject = action.payload.data;
      })

      .addCase(fetchMyProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyProjects.fulfilled, (state, action) => { state.isLoading = false; state.myProjects = action.payload.data; })
      .addCase(fetchMyProjects.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchAssignedProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAssignedProjects.fulfilled, (state, action) => { state.isLoading = false; state.assignedProjects = action.payload.data; })
      .addCase(fetchAssignedProjects.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchAIMatches.pending, (state) => { state.aiMatchesLoading = true; })
      .addCase(fetchAIMatches.fulfilled, (state, action) => { state.aiMatchesLoading = false; state.aiMatches = action.payload.data; })
      .addCase(fetchAIMatches.rejected, (state, action) => { state.aiMatchesLoading = false; state.error = action.payload; })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.myProjects = state.myProjects.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
