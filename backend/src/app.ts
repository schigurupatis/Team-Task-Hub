import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import taskRoutes from './routes/task.routes';
import { notFound, errorHandler, validateIdParam } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Manually set CORS headers on EVERY response — belt and suspenders approach
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS,HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-delete-token,Accept,Origin,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    next();
  });

  // Handle preflight immediately — must be before helmet and other middleware
  app.options('*', (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS,HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-delete-token,Accept,Origin,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  });

  // Security headers — disable helmet's CORS-overriding policies
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // cors() as backup layer
  app.use(cors({ origin: '*' }));

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
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Health check — lightweight, wakes up Render cold start
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Task routes
  app.use('/api/tasks', validateIdParam, taskRoutes);

  // 404 & error handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
};