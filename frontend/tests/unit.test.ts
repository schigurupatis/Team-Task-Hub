import { TaskFormSchema } from '../src/validators/task.validator';
import { PRIORITY_LABELS, STATUS_LABELS, formatDate } from '../src/utils/task.utils';
import taskReducer, {
  setFilters,
  setPage,
  setSelectedTask,
  clearError,
} from '../src/store/slices/taskSlice';
import { Task, TaskFilters } from '../src/types/task.types';

// ─── Validator Tests ───────────────────────────────────────────────────────────
describe('TaskFormSchema — Zod client-side validation', () => {
  it('accepts a fully valid task', () => {
    const result = TaskFormSchema.safeParse({
      title: 'Fix login bug',
      description: 'Details here',
      priority: 'high',
      status: 'todo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = TaskFormSchema.safeParse({
      title: '',
      priority: 'low',
      status: 'todo',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing title', () => {
    const result = TaskFormSchema.safeParse({
      priority: 'low',
      status: 'todo',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid priority value', () => {
    const result = TaskFormSchema.safeParse({
      title: 'X',
      priority: 'urgent',
      status: 'todo',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status value', () => {
    const result = TaskFormSchema.safeParse({
      title: 'X',
      priority: 'low',
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });

  it('defaults description to empty string when not provided', () => {
    const result = TaskFormSchema.safeParse({
      title: 'X',
      priority: 'low',
      status: 'todo',
    });
    expect(result.success && result.data.description).toBe('');
  });

  it('rejects title over 200 characters', () => {
    const result = TaskFormSchema.safeParse({
      title: 'A'.repeat(201),
      priority: 'low',
      status: 'todo',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid priority values', () => {
    ['low', 'medium', 'high', 'critical'].forEach(priority => {
      const result = TaskFormSchema.safeParse({ title: 'T', priority, status: 'todo' });
      expect(result.success).toBe(true);
    });
  });

  it('accepts all valid status values', () => {
    ['todo', 'in-progress', 'done', 'archived'].forEach(status => {
      const result = TaskFormSchema.safeParse({ title: 'T', priority: 'low', status });
      expect(result.success).toBe(true);
    });
  });
});

// ─── Utils Tests ───────────────────────────────────────────────────────────────
describe('task.utils — label maps and formatDate', () => {
  it('has correct labels for all 4 priorities', () => {
    expect(PRIORITY_LABELS.low).toBe('Low');
    expect(PRIORITY_LABELS.medium).toBe('Medium');
    expect(PRIORITY_LABELS.high).toBe('High');
    expect(PRIORITY_LABELS.critical).toBe('Critical');
  });

  it('has correct labels for all 4 statuses', () => {
    expect(STATUS_LABELS['todo']).toBe('To Do');
    expect(STATUS_LABELS['in-progress']).toBe('In Progress');
    expect(STATUS_LABELS['done']).toBe('Done');
    expect(STATUS_LABELS['archived']).toBe('Archived');
  });

  it('formatDate includes the correct year', () => {
    const formatted = formatDate('2026-01-15T10:30:00.000Z');
    expect(formatted).toContain('2026');
  });

  it('formatDate returns a non-empty string', () => {
    const formatted = formatDate(new Date().toISOString());
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});

// ─── Redux Slice Tests ─────────────────────────────────────────────────────────
const mockTask: Task = {
  id: 'abc-123',
  title: 'Test task',
  description: 'Test description',
  priority: 'medium',
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const emptyFilters: TaskFilters = {
  search: '',
  priority: '' as TaskFilters['priority'],
  status: '' as TaskFilters['status'],
};

const initialState = {
  tasks: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: emptyFilters,
  loading: false,
  error: null,
  selectedTask: null,
};

describe('taskSlice — sync reducers', () => {
  it('initial state has correct defaults', () => {
    const state = taskReducer(undefined, { type: '@@INIT' });
    expect(state.tasks).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.page).toBe(1);
    expect(state.limit).toBe(20);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.selectedTask).toBeNull();
  });

  it('setFilters updates filters and resets page to 1', () => {
    const state = { ...initialState, page: 5 };
    const next = taskReducer(state, setFilters({ search: 'deploy' }));
    expect(next.filters.search).toBe('deploy');
    expect(next.page).toBe(1);
  });

  it('setFilters merges with existing filters', () => {
    const state = {
      ...initialState,
      filters: { search: 'existing', priority: 'high' as const, status: '' as const },
    };
    const next = taskReducer(state, setFilters({ priority: 'low' }));
    expect(next.filters.priority).toBe('low');
    expect(next.filters.search).toBe('existing');
  });

  it('setPage updates the current page', () => {
    const next = taskReducer(initialState, setPage(3));
    expect(next.page).toBe(3);
  });

  it('setPage to 1 resets to first page', () => {
    const state = { ...initialState, page: 7 };
    const next = taskReducer(state, setPage(1));
    expect(next.page).toBe(1);
  });

  it('setSelectedTask sets a task', () => {
    const next = taskReducer(initialState, setSelectedTask(mockTask));
    expect(next.selectedTask).toEqual(mockTask);
    expect(next.selectedTask?.id).toBe('abc-123');
  });

  it('setSelectedTask with null clears the selection', () => {
    const state = { ...initialState, selectedTask: mockTask };
    const next = taskReducer(state, setSelectedTask(null));
    expect(next.selectedTask).toBeNull();
  });

  it('clearError sets error to null', () => {
    const state = { ...initialState, error: 'Something went wrong' };
    const next = taskReducer(state, clearError());
    expect(next.error).toBeNull();
  });

  it('clearError on already-null error stays null', () => {
    const next = taskReducer(initialState, clearError());
    expect(next.error).toBeNull();
  });
});