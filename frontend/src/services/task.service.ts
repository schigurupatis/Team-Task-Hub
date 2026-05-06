import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, PaginatedResponse, ApiResponse, TaskFilters } from '@/types/task.types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DELETE_TOKEN = import.meta.env.VITE_DELETE_TOKEN || 'super-secret-delete-token-2026';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90_000, // 90s — Render free tier cold start can take up to 60s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(config => {
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Response interceptor — normalize all errors to one format
api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Network error';
    return Promise.reject(new Error(message));
  }
);

// Wake up Render backend before the user interacts
// Called once on app load — sends a lightweight /health ping
export const wakeUpBackend = async (): Promise<void> => {
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/health`, { timeout: 90_000 });
  } catch {
    // Silently ignore — wake-up is best-effort
  }
};

export const taskApi = {
  getAll: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Task> => {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data!;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const res = await api.post<ApiResponse<Task>>('/tasks', dto);
    return res.data.data!;
  },

  update: async (id: string, dto: UpdateTaskDto): Promise<Task> => {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, dto);
    return res.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`, {
      headers: { 'x-delete-token': DELETE_TOKEN },
    });
  },
};