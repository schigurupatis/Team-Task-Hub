import request from 'supertest';
import { createApp } from '../src/app';
import { taskStore } from '../src/models/task.model';

const app = createApp();
const DELETE_TOKEN = 'super-secret-delete-token-2026';

beforeEach(() => {
  process.env.DELETE_TOKEN = DELETE_TOKEN;
  taskStore._reset();
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Task API', () => {
  describe('GET /api/tasks', () => {
    it('returns empty list initially', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('returns tasks with pagination', async () => {
      // create 3 tasks
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/tasks')
          .send({ title: `Task ${i}`, priority: 'low', status: 'todo' });
      }
      const res = await request(app).get('/api/tasks?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(3);
    });

    it('filters by search', async () => {
      await request(app).post('/api/tasks').send({ title: 'Alpha task', priority: 'low' });
      await request(app).post('/api/tasks').send({ title: 'Beta task', priority: 'low' });
      const res = await request(app).get('/api/tasks?search=alpha');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Alpha task');
    });

    it('filters by priority', async () => {
      await request(app).post('/api/tasks').send({ title: 'High prio', priority: 'high' });
      await request(app).post('/api/tasks').send({ title: 'Low prio', priority: 'low' });
      const res = await request(app).get('/api/tasks?priority=high');
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/tasks', () => {
    it('creates a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task', description: 'Desc', priority: 'medium' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('New Task');
    });

    it('rejects empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '', priority: 'low' });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ priority: 'high' });
      expect(res.status).toBe(422);
    });

    it('rejects invalid priority', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', priority: 'urgent' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('returns task by id', async () => {
      const create = await request(app)
        .post('/api/tasks')
        .send({ title: 'Find me', priority: 'low' });
      const { id } = create.body.data;
      const res = await request(app).get(`/api/tasks/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Find me');
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/tasks/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid UUID format', async () => {
      const res = await request(app).get('/api/tasks/not-a-uuid');
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('updates a task', async () => {
      const create = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original', priority: 'low' });
      const { id } = create.body.data;
      const res = await request(app)
        .patch(`/api/tasks/${id}`)
        .send({ title: 'Updated', status: 'done' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('done');
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app)
        .patch('/api/tasks/00000000-0000-0000-0000-000000000000')
        .send({ title: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes with valid token', async () => {
      const create = await request(app)
        .post('/api/tasks')
        .send({ title: 'Delete me', priority: 'low' });
      const { id } = create.body.data;
      const res = await request(app)
        .delete(`/api/tasks/${id}`)
        .set('x-delete-token', DELETE_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects delete without token', async () => {
      const create = await request(app)
        .post('/api/tasks')
        .send({ title: 'Keep me', priority: 'low' });
      const { id } = create.body.data;
      const res = await request(app).delete(`/api/tasks/${id}`);
      expect(res.status).toBe(401);
    });

    it('rejects delete with wrong token', async () => {
      const create = await request(app)
        .post('/api/tasks')
        .send({ title: 'Keep me 2', priority: 'low' });
      const { id } = create.body.data;
      const res = await request(app)
        .delete(`/api/tasks/${id}`)
        .set('x-delete-token', 'wrong-token');
      expect(res.status).toBe(401);
    });
  });

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
