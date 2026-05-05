import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilters } from '@/types/task.types';
import { taskApi } from '@/services/task.service';

interface TaskState {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

const initialState: TaskState = {
  tasks: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: { search: '', priority: '', status: '' },
  loading: false,
  error: null,
  selectedTask: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (filters: TaskFilters, { rejectWithValue }) => {
    try {
      return await taskApi.getAll(filters);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (dto: CreateTaskDto, { rejectWithValue }) => {
    try {
      return await taskApi.create(dto);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, dto }: { id: string; dto: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      return await taskApi.update(id, dto);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<TaskFilters>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data ?? [];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
        if (state.selectedTask?.id === action.payload.id) state.selectedTask = action.payload;
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.total -= 1;
        if (state.selectedTask?.id === action.payload) state.selectedTask = null;
      });
  },
});

export const { setFilters, setPage, setSelectedTask, clearError } = taskSlice.actions;
export default taskSlice.reducer;
