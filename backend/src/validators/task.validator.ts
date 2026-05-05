import { z } from 'zod';

export const PriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const StatusEnum = z.enum(['todo', 'in-progress', 'done', 'archived']);

export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .default(''),
  priority: PriorityEnum,
  status: StatusEnum.default('todo'),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskFiltersSchema = z.object({
  search: z.string().optional(),
  priority: PriorityEnum.optional(),
  status: StatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFiltersInput = z.infer<typeof TaskFiltersSchema>;
