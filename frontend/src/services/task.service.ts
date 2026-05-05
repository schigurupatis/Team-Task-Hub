import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, PaginatedResponse, ApiResponse, TaskFilters } from '@/types/task.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Use || (not ??) so empty string also falls back to the hardcoded value
const DELETE_TOKEN =
  import.meta.env.VITE_DELETE_TOKEN ||
  'super-secret-delete-token-2026';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for logging
api.interceptors.request.use(config => {
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Response interceptor for error normalization
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