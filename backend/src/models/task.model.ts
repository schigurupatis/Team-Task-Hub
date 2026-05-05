import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilters } from '../types/task.types';

class TaskStore {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    // Seed with sample data
    const samples: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', priority: 'high', status: 'in-progress' },
      { title: 'Write API documentation', description: 'Document all REST endpoints with examples', priority: 'medium', status: 'todo' },
      { title: 'Database schema design', description: 'Design the initial schema for production database migration', priority: 'critical', status: 'todo' },
      { title: 'Unit test coverage', description: 'Achieve 80% coverage across all modules', priority: 'high', status: 'todo' },
      { title: 'Performance audit', description: 'Run Lighthouse audit and fix Core Web Vitals issues', priority: 'medium', status: 'done' },
    ];
    samples.forEach(s => this.create(s));
  }

  getAll(filters: TaskFilters = {}): { tasks: Task[]; total: number } {
    let tasks = Array.from(this.tasks.values());

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (filters.priority) {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }

    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    // Sort: newest first
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = tasks.length;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = tasks.slice(start, start + limit);

    return { tasks: paginated, total };
  }

  getById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(dto: CreateTaskDto): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated: Task = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  // For testing — reset store
  _reset(): void {
    this.tasks.clear();
  }
}

export const taskStore = new TaskStore();
