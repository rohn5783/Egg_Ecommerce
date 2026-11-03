import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 GoodEggs Server running on http://localhost:${ENV.PORT}`);
    console.log(`📚 Swagger Docs available at http://localhost:${ENV.PORT}/api-docs`);
    console.log(`🥚 Environment: ${ENV.NODE_ENV}`);
  });

  const gracefulShutdown = () => {
    console.log('Shutting down GoodEggs server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

