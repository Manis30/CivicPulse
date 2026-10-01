import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { verifyRequiredIndexes } from './config/verifyIndexes.js';
import { startWorkflowWorker, stopWorkflowWorker } from './queues/workers/agentWorkflowWorker.js';
import { closeWorkflowQueue } from './queues/agentWorkflowQueue.js';
import { closeRedisConnections, testRedisConnection } from './config/redis.js';

const app = createApp();

async function startServer() {
  try {
    // 1. Establish MongoDB connection
    await connectDatabase();
    logger.info('MongoDB: CONNECTED');

    // 2. Verify required indexes (including 2dsphere)
    await verifyRequiredIndexes();

    // 3. Probe Redis connectivity & initialize BullMQ worker if available (Part 2 & Part 10)
    const redisOnline = await testRedisConnection();
    if (redisOnline) {
      logger.info('Redis: CONNECTED');
      startWorkflowWorker();
      logger.info('BullMQ Workers: INITIALIZED');
    } else {
      logger.info('Redis: UNAVAILABLE');
      logger.info('BullMQ Workers: DISABLED (Redis offline)');
      logger.warn('Redis unavailable — background workers disabled.');
    }

    // 4. Start HTTP server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info('HTTP Server: running', {
        port: env.PORT,
        host: env.HOST,
        env: env.NODE_ENV,
        url: `http://${env.HOST}:${env.PORT}`,
        healthCheck: `http://localhost:${env.PORT}/api/health`,
        dbHealth: `http://localhost:${env.PORT}/api/db/health`,
      });
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);

      // Stop receiving incoming HTTP connections
      server.close(async () => {
        logger.info('HTTP server closed successfully.');

        try {
          // Gracefully stop BullMQ worker, wait for active jobs
          await stopWorkflowWorker();

          // Close BullMQ queue resources
          await closeWorkflowQueue();

          // Close Redis connections
          await closeRedisConnections();

          // Gracefully disconnect from database
          await disconnectDatabase();

          logger.info('All background workers and connections closed cleanly.');
          process.exit(0);
        } catch (shutdownErr) {
          logger.error('Error during graceful shutdown:', shutdownErr);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (err) {
    logger.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

const serverPromise = startServer();
export default serverPromise;
