import { CreateTaskSchema, UpdateTaskSchema, TaskFiltersSchema } from '../src/validators/task.validator';

describe('CreateTaskSchema', () => {
  it('accepts valid task', () => {
    const r = CreateTaskSchema.safeParse({ title: 'Fix bug', priority: 'high' });
    expect(r.success).toBe(true);
  });

  it('rejects empty title', () => {
    const r = CreateTaskSchema.safeParse({ title: '', priority: 'low' });
    expect(r.success).toBe(false);
  });

  it('defaults status to todo', () => {
    const r = CreateTaskSchema.safeParse({ title: 'X', priority: 'medium' });
    expect(r.success && r.data.status).toBe('todo');
  });

  it('rejects invalid priority', () => {
    const r = CreateTaskSchema.safeParse({ title: 'X', priority: 'urgent' });
    expect(r.success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    const r = CreateTaskSchema.safeParse({ title: 'A'.repeat(201), priority: 'low' });
    expect(r.success).toBe(false);
  });
});

describe('UpdateTaskSchema', () => {
  it('accepts partial update', () => {
    const r = UpdateTaskSchema.safeParse({ status: 'done' });
    expect(r.success).toBe(true);
  });

  it('accepts empty object', () => {
    const r = UpdateTaskSchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe('TaskFiltersSchema', () => {
  it('defaults page and limit', () => {
    const r = TaskFiltersSchema.safeParse({});
    expect(r.success && r.data.page).toBe(1);
    expect(r.success && r.data.limit).toBe(20);
  });

  it('coerces string numbers', () => {
    const r = TaskFiltersSchema.safeParse({ page: '3', limit: '10' });
    expect(r.success && r.data.page).toBe(3);
  });

  it('rejects limit over 100', () => {
    const r = TaskFiltersSchema.safeParse({ limit: '200' });
    expect(r.success).toBe(false);
  });
});
