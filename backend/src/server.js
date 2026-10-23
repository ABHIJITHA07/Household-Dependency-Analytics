import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const PORT = env.port;

const server = app.listen(PORT, () => {
  logger.info(`[Backend Foundation] Express server running on port ${PORT} (${env.nodeEnv})`);
});

// Graceful Shutdown Handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

export default server;
