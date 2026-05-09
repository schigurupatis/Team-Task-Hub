import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';          // ← NEW
import { notFound, errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // ── CORS — set headers manually on EVERY response ──────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin',  '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-delete-token, Accept, Origin'
    );
    res.header('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // ── Compression ────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Body parsers ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Logger ─────────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      500,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, error: 'Too many requests' },
  });
  app.use('/api', limiter);

  // ── Stricter rate limit for auth routes (prevent brute force) ─────────────
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max:      20,               // only 20 login/register attempts per 15 min
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, error: 'Too many auth attempts. Try again later.' },
  });
  app.use('/api/auth', authLimiter);

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Root route ─────────────────────────────────────────────────────────────
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Team Task Hub API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth:   '/api/auth',
        tasks:  '/api/tasks',
      },
    });
  });

  // ── Auth routes (register, login, me) ─────────────────────────────────────
  app.use('/api/auth', authRoutes);             // ← NEW

  // ── Task routes ────────────────────────────────────────────────────────────
  app.use('/api/tasks', taskRoutes);

  // ── 404 & error handlers ───────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};