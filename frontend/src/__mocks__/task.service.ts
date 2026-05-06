// Mock for task.service.ts — replaces import.meta.env with test values
// Jest cannot parse import.meta (Vite-only), so we mock the whole module

export const wakeUpBackend = jest.fn().mockResolvedValue(undefined);

export const taskApi = {
  getAll:  jest.fn().mockResolvedValue({ success: true, data: [], total: 0, page: 1, limit: 20 }),
  getById: jest.fn().mockResolvedValue(null),
  create:  jest.fn().mockResolvedValue({ id: '1', title: 'Mock', description: '', priority: 'low', status: 'todo', createdAt: '', updatedAt: '' }),
  update:  jest.fn().mockResolvedValue(null),
  delete:  jest.fn().mockResolvedValue(undefined),
};