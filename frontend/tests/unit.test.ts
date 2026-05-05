import { TaskFormSchema } from '../../src/validators/task.validator';
import { PRIORITY_LABELS, STATUS_LABELS, formatDate } from '../../src/utils/task.utils';
import taskReducer, {
  setFilters,
  setPage,
  setSelectedTask,
  clearError,
} from '../../src/store/slices/taskSlice';
import { Task } from '../../src/types/task.types';

// ─── Validator Tests ───────────────────────────────────────────────────────────
describe('TaskFormSchema', () => {
  it('accepts valid task', () => {
    const result = TaskFormSchema.safeParse({
      title: 'Fix bug',
      description: 'Details here',
      priority: 'high',
      status: 'todo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = TaskFormSchema.safeParse({ title: '', priority: 'low', status: 'todo' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = TaskFormSchema.safeParse({ title: 'X', priority: 'urgent', status: 'todo' });
    expect(result.success).toBe(false);
  });

  it('defaults description to empty string', () => {
    const result = TaskFormSchema.safeParse({ title: 'X', priority: 'low', status: 'todo' });
    expect(result.success && result.data.description).toBe('');
  });
});

// ─── Utils Tests ───────────────────────────────────────────────────────────────
describe('task.utils', () => {
  it('has labels for all priorities', () => {
    expect(PRIORITY_LABELS.low).toBe('Low');
    expect(PRIORITY_LABELS.critical).toBe('Critical');
  });

  it('has labels for all statuses', () => {
    expect(STATUS_LABELS['in-progress']).toBe('In Progress');
    expect(STATUS_LABELS.done).toBe('Done');
  });

  it('formats date correctly', () => {
    const iso = '2026-01-15T10:30:00.000Z';
    const formatted = formatDate(iso);
    expect(formatted).toContain('2026');
  });
});

// ─── Redux Slice Tests ─────────────────────────────────────────────────────────
const mockTask: Task = {
  id: '1',
  title: 'Test task',
  description: '',
  priority: 'medium',
  status: 'todo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialState = {
  tasks: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: { search: '', priority: '' as const, status: '' as const },
  loading: false,
  error: null,
  selectedTask: null,
};

describe('taskSlice reducers', () => {
  it('sets filters and resets page', () => {
    const state = { ...initialState, page: 3 };
    const next = taskReducer(state, setFilters({ search: 'hello' }));
    expect(next.filters.search).toBe('hello');
    expect(next.page).toBe(1);
  });

  it('sets page', () => {
    const next = taskReducer(initialState, setPage(5));
    expect(next.page).toBe(5);
  });

  it('sets selected task', () => {
    const next = taskReducer(initialState, setSelectedTask(mockTask));
    expect(next.selectedTask).toEqual(mockTask);
  });

  it('clears selected task', () => {
    const state = { ...initialState, selectedTask: mockTask };
    const next = taskReducer(state, setSelectedTask(null));
    expect(next.selectedTask).toBeNull();
  });

  it('clears error', () => {
    const state = { ...initialState, error: 'Something broke' };
    const next = taskReducer(state, clearError());
    expect(next.error).toBeNull();
  });
});
