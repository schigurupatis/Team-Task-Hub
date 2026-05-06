import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();

const server = app.listen(PORT, () => {
  process.stdout.write(`🚀 Team Task Hub API running on http://localhost:${PORT}\n`);
  process.stdout.write(`   Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

process.on('SIGTERM', () => {
  process.stdout.write('SIGTERM received, shutting down gracefully...\n');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  process.stdout.write('SIGINT received, shutting down gracefully...\n');
  server.close(() => process.exit(0));
});

export default app;