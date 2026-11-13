import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { taskService } from '../services/taskService';
import type { Task, TaskInput, TaskStatus, WeekGroup } from '../types/task';
import { getUserTimeZone } from '../utils/date';
import { toApiFailure, type ApiFailure } from '../utils/errors';

export interface TasksState {
  weeks: WeekGroup[];
  loading: boolean;
  error: string | null;
  /** Id of the latest weekly request; older responses are ignored. */
  latestRequestId: string | null;
  /** Increments after every successful change so other views (e.g. search) can refetch. */
  version: number;
  /** Tasks whose status change is in flight (drives the checkbox spinner). */
  pendingStatusIds: string[];
}

const initialState: TasksState = {
  weeks: [],
  loading: true,
  error: null,
  latestRequestId: null,
  version: 0,
  pendingStatusIds: [],
};

type ThunkConfig = { rejectValue: ApiFailure };

/** Weeks are grouped by the API in the user's own timezone. */
export const fetchWeeks = createAsyncThunk<WeekGroup[], void, ThunkConfig>('tasks/fetchWeeks', async (_, { rejectWithValue }) => {
  try {
    return await taskService.getWeekly({ tz: getUserTimeZone() });
  } catch (err) {
    return rejectWithValue(toApiFailure(err));
  }
});

// Every change re-fetches the weeks so counts and grouping always come from the server.

export const createTask = createAsyncThunk<Task, TaskInput, ThunkConfig>('tasks/create', async (input, { dispatch, rejectWithValue }) => {
  try {
    const task = await taskService.create(input);
    await dispatch(fetchWeeks());
    return task;
  } catch (err) {
    return rejectWithValue(toApiFailure(err));
  }
});

export const updateTask = createAsyncThunk<Task, { id: string; input: Partial<TaskInput> }, ThunkConfig>(
  'tasks/update',
  async ({ id, input }, { dispatch, rejectWithValue }) => {
    try {
      const task = await taskService.update(id, input);
      await dispatch(fetchWeeks());
      return task;
    } catch (err) {
      return rejectWithValue(toApiFailure(err));
    }
  }
);

export const setTaskStatus = createAsyncThunk<Task, { id: string; status: TaskStatus }, ThunkConfig>(
  'tasks/setStatus',
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const task = await taskService.updateStatus(id, status);
      await dispatch(fetchWeeks());
      return task;
    } catch (err) {
      return rejectWithValue(toApiFailure(err));
    }
  }
);

export const deleteTask = createAsyncThunk<string, string, ThunkConfig>('tasks/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    await taskService.remove(id);
    await dispatch(fetchWeeks());
    return id;
  } catch (err) {
    return rejectWithValue(toApiFailure(err));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeks.pending, (state, action) => {
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchWeeks.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.weeks = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchWeeks.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.error = action.payload?.message ?? 'Something went wrong. Please try again.';
        state.loading = false;
      })
      .addCase(setTaskStatus.pending, (state, action) => {
        state.pendingStatusIds.push(action.meta.arg.id);
      })
      .addCase(setTaskStatus.rejected, (state, action) => {
        state.pendingStatusIds = state.pendingStatusIds.filter((id) => id !== action.meta.arg.id);
      })
      .addCase(setTaskStatus.fulfilled, (state, action) => {
        state.pendingStatusIds = state.pendingStatusIds.filter((id) => id !== action.meta.arg.id);
        state.version += 1;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.version += 1;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.version += 1;
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.version += 1;
      });
  },
});

export default tasksSlice.reducer;
