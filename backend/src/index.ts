import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`Server running on port ${PORT}\n`);
  process.stdout.write(`Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

export default app;