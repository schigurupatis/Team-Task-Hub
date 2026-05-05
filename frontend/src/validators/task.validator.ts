import { z } from 'zod';

export const PriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const StatusEnum = z.enum(['todo', 'in-progress', 'done', 'archived']);

export const TaskFormSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description too long').default(''),
  priority: PriorityEnum,
  status: StatusEnum,
});

export type TaskFormData = z.infer<typeof TaskFormSchema>;
