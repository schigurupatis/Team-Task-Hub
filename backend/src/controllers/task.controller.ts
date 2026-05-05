import { Request, Response } from 'express';
import { taskStore } from '../models/task.model';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFiltersSchema,
} from '../validators/task.validator';
import { ApiResponse, PaginatedResponse, Task } from '../types/task.types';

// Typed route params — tells TypeScript id is always a plain string
interface IdParam {
  id: string;
}

export const getAllTasks = (req: Request, res: Response): void => {
  const parsed = TaskFiltersSchema.safeParse(req.query);
  if (!parsed.success) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid query parameters',
      message: parsed.error.errors.map(e => e.message).join(', '),
    };
    res.status(400).json(response);
    return;
  }

  const { tasks, total } = taskStore.getAll(parsed.data);
  const response: PaginatedResponse<Task> = {
    success: true,
    data: tasks,
    total,
    page: parsed.data.page,
    limit: parsed.data.limit,
  };
  res.status(200).json(response);
};

// Use Request<IdParam> so req.params.id is typed as string (not string | string[])
export const getTaskById = (req: Request<IdParam>, res: Response): void => {
  const task = taskStore.getById(req.params.id);
  if (!task) {
    const response: ApiResponse = { success: false, error: 'Task not found' };
    res.status(404).json(response);
    return;
  }
  res.status(200).json({ success: true, data: task } satisfies ApiResponse<Task>);
};

export const createTask = (req: Request, res: Response): void => {
  const parsed = CreateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
    res.status(422).json(response);
    return;
  }

  const task = taskStore.create(parsed.data);
  res.status(201).json({ success: true, data: task, message: 'Task created' } satisfies ApiResponse<Task>);
};

export const updateTask = (req: Request<IdParam>, res: Response): void => {
  const parsed = UpdateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
    res.status(422).json(response);
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    const response: ApiResponse = { success: false, error: 'No fields to update' };
    res.status(400).json(response);
    return;
  }

  const task = taskStore.update(req.params.id, parsed.data);
  if (!task) {
    const response: ApiResponse = { success: false, error: 'Task not found' };
    res.status(404).json(response);
    return;
  }
  res.status(200).json({ success: true, data: task, message: 'Task updated' } satisfies ApiResponse<Task>);
};

export const deleteTask = (req: Request<IdParam>, res: Response): void => {
  const authHeader = req.headers['x-delete-token'];
  const expectedToken = process.env.DELETE_TOKEN || 'super-secret-delete-token-2026';

  if (!authHeader || authHeader !== expectedToken) {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid x-delete-token header',
    };
    res.status(401).json(response);
    return;
  }

  const existed = taskStore.delete(req.params.id);
  if (!existed) {
    const response: ApiResponse = { success: false, error: 'Task not found' };
    res.status(404).json(response);
    return;
  }
  res.status(200).json({ success: true, message: 'Task deleted' } satisfies ApiResponse);
};