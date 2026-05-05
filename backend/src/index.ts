import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 Team Task Hub API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

export default app;
