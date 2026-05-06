import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import taskRoutes from './routes/task.routes';
import { notFound, errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // ── CORS — set headers manually on EVERY response, first middleware ──────
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-delete-token, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Respond to preflight immediately
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Compression
  app.use(compression());

  // Body parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logger
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests' },
  });
  app.use('/api', limiter);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Task routes (no validateIdParam on list routes)
  app.use('/api/tasks', taskRoutes);

  // 404 & error handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
};