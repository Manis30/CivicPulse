import { Redis, RedisOptions } from 'ioredis';
import { ConnectionOptions } from 'bullmq';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export type RedisConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export interface RedisStatus {
  state: RedisConnectionState;
  host?: string;
  port?: number;
  latencyMs?: number;
  clientCount?: number;
}

// Track created clients for graceful shutdown
const trackedClients = new Set<Redis>();
let sharedClient: Redis | null = null;
let redisOnline = false;
let redisChecked = false;

/**
 * Returns whether Redis is verified online and ready.
 */
export function isRedisOnline(): boolean {
  return redisOnline;
}

/**
 * Manually update Redis availability status.
 */
export function setRedisOnline(status: boolean): void {
  redisOnline = status;
  redisChecked = true;
}

/**
 * Mask credentials from Redis URI string for safe logging.
 * Never logs raw passwords or authentication tokens.
 */
export function maskRedisUri(uri: string): string {
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  } catch {
    return 'redis://[masked]';
  }
}

/**
 * Builds authoritative Redis connection options from centralized configuration.
 * Configured specifically for BullMQ compatibility (maxRetriesPerRequest: null).
 * Automatically prevents infinite retry loops when Redis is offline.
 */
export function getRedisConnectionOptions(): ConnectionOptions {
  const baseOptions: any = {
    maxRetriesPerRequest: null, // Mandatory for BullMQ worker & queue connections
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 2000,
    enableOfflineQueue: false,
    retryStrategy: (times: number) => {
      // If Redis was tested and found offline, or if attempts exceed 2, halt reconnection immediately
      if (!redisOnline && redisChecked) {
        return null; // Stop retrying
      }
      if (times > 2) {
        return null; // Stop retrying after 2 attempts
      }
      return 200;
    },
    reconnectOnError: () => false,
  };

  // If host and port are explicitly specified, prefer them
  if (env.REDIS_HOST) {
    return {
      ...baseOptions,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT || 6379,
      username: env.REDIS_USERNAME || undefined,
      password: env.REDIS_PASSWORD || undefined,
    };
  }

  // Parse REDIS_URL if provided
  if (env.REDIS_URL) {
    try {
      const url = new URL(env.REDIS_URL);
      return {
        ...baseOptions,
        host: url.hostname || '127.0.0.1',
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined,
        password: url.password || undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
      };
    } catch {
      return {
        ...baseOptions,
        host: '127.0.0.1',
        port: 6379,
      };
    }
  }

  return {
    ...baseOptions,
    host: '127.0.0.1',
    port: 6379,
  };
}

/**
 * Probes Redis connectivity once at startup with a strict timeout and zero retries.
 * Prevents continuous error spam if Redis is unavailable in development.
 */
export async function testRedisConnection(timeoutMs = 1500): Promise<boolean> {
  const options = getRedisConnectionOptions() as RedisOptions;
  const probeOptions: RedisOptions = {
    ...options,
    lazyConnect: true,
    connectTimeout: timeoutMs,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Never retry during probe
    reconnectOnError: () => false,
  };

  const probeClient = new Redis(probeOptions);
  probeClient.on('error', () => {
    // Suppress unhandled error event during probe
  });

  try {
    const connectPromise = probeClient.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis probe timed out')), timeoutMs)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    await probeClient.ping();

    redisOnline = true;
    redisChecked = true;
    await probeClient.quit().catch(() => probeClient.disconnect());
    return true;
  } catch {
    redisOnline = false;
    redisChecked = true;
    try {
      probeClient.disconnect();
    } catch {
      // Ignored
    }
    return false;
  }
}

/**
 * Creates a dedicated, tracked Redis client for internal services.
 */
export function createRedisClient(clientName: string = 'civicpulse-redis'): Redis {
  const options = getRedisConnectionOptions() as RedisOptions;
  const maskedTarget = maskRedisUri(
    options.password ? `redis://***:***@${options.host}:${options.port}` : `redis://${options.host}:${options.port}`
  );

  const client = new Redis(options);
  trackedClients.add(client);

  client.on('connect', () => {
    logger.info(`Redis [${clientName}] connected`, { target: maskedTarget });
  });

  client.on('error', (err) => {
    // Only log if Redis was supposed to be online to prevent continuous connection error spam
    if (redisOnline) {
      logger.warn(`Redis [${clientName}] connection issue: ${err.message}`, { target: maskedTarget });
    }
  });

  client.on('close', () => {
    trackedClients.delete(client);
  });

  return client;
}

/**
 * Returns a shared, singleton Redis client for non-blocking commands (idempotency, caching, health checks).
 */
export function getSharedRedisClient(): Redis | null {
  if (!sharedClient || sharedClient.status === 'end') {
    sharedClient = createRedisClient('civicpulse-shared');
  }
  if (sharedClient.status !== 'ready' && sharedClient.status !== 'connecting' && sharedClient.status !== 'connect') {
    sharedClient.connect().catch(() => {
      // Handled in client error listener
    });
  }
  return sharedClient;
}

/**
 * Checks Redis connectivity and ping latency with dynamic recovery.
 */
export async function getRedisStatus(): Promise<RedisStatus> {
  const options = getRedisConnectionOptions() as RedisOptions;

  // If currently marked offline, attempt non-blocking probe to detect running Redis instance
  if (!redisOnline) {
    const recovered = await testRedisConnection(800);
    if (!recovered) {
      return {
        state: 'DISCONNECTED',
        host: options.host,
        port: options.port,
        clientCount: trackedClients.size,
      };
    }
  }

  const client = getSharedRedisClient();
  if (!client) {
    return {
      state: 'DISCONNECTED',
      host: options.host,
      port: options.port,
      clientCount: trackedClients.size,
    };
  }

  try {
    if (client.status !== 'ready' && client.status !== 'connecting') {
      await client.connect();
    }
    const start = Date.now();
    await client.ping();
    const latencyMs = Date.now() - start;

    redisOnline = true;

    return {
      state: 'CONNECTED',
      host: options.host,
      port: options.port,
      latencyMs,
      clientCount: trackedClients.size,
    };
  } catch {
    redisOnline = false;
    return {
      state: 'DISCONNECTED',
      host: options.host,
      port: options.port,
      clientCount: trackedClients.size,
    };
  }
}

/**
 * Gracefully disconnects all tracked Redis clients.
 */
export async function closeRedisConnections(): Promise<void> {
  if (trackedClients.size === 0) return;
  logger.info(`Closing ${trackedClients.size} Redis connection(s)...`);
  const disconnectPromises = Array.from(trackedClients).map(async (client) => {
    try {
      if (client.status !== 'end') {
        await client.quit();
      }
    } catch {
      client.disconnect();
    }
  });

  await Promise.all(disconnectPromises);
  trackedClients.clear();
  sharedClient = null;
  redisOnline = false;
  logger.info('All Redis connections gracefully closed.');
}
