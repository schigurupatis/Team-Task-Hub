export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'done' | 'archived';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface TaskFilters {
  search?: string;
  priority?: Priority | '';
  status?: Status | '';
  page?: number;
  limit?: number;
}
