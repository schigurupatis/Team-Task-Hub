import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import taskRoutes from './routes/task.routes';
import { notFound, errorHandler, validateIdParam } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow all origins in production since Netlify URL can change
  // Lock this down to your specific domain once stable
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        // Allow any netlify.app subdomain
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.netlify.app') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Allow all for now — tighten after testing
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-delete-token'],
      credentials: true,
    })
  );

  // Handle preflight OPTIONS requests explicitly
  app.options('*', cors());

  // Compression
  app.use(compression());

  // Body parser
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logger
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiting — more generous for free tier
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/tasks', validateIdParam, taskRoutes);

  // 404 & error handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
};