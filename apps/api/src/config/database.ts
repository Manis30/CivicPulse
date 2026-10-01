import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export type DatabaseConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export interface DatabaseStatus {
  state: DatabaseConnectionState;
  databaseName?: string;
  host?: string;
  port?: number;
  latencyMs?: number;
  geospatialIndexesReady?: boolean;
}

let isConnecting = false;

// Mask credentials from URI string for logging
export function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  } catch {
    return 'mongodb://[masked]';
  }
}

/**
 * Connect to MongoDB with timeout, retries, and structured event listeners.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnecting) {
    logger.info('MongoDB connection already in progress, awaiting resolution...');
    return mongoose;
  }

  isConnecting = true;
  const maskedUri = maskMongoUri(env.MONGODB_URI);

  // Setup connection event listeners once
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established successfully', {
      target: maskedUri,
      dbName: mongoose.connection.name,
    });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected', {
      target: maskedUri,
    });
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB connection re-established (reconnected)', {
      target: maskedUri,
    });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection encountered an error', err, {
      target: maskedUri,
    });
  });

  try {
    logger.info('Connecting to MongoDB...', { target: maskedUri });
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      autoIndex: true, // Automatically build indexes for schemas
    });
    isConnecting = false;
    return conn;
  } catch (err) {
    isConnecting = false;
    logger.error('Failed to establish MongoDB connection on startup', err, {
      target: maskedUri,
    });
    // In development or testing, do not crash immediately so offline fallback can be demonstrated if needed
    if (env.NODE_ENV === 'production') {
      throw err;
    }
    return mongoose;
  }
}

/**
 * Disconnect from MongoDB gracefully.
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    logger.info('Disconnecting MongoDB connection...');
    await mongoose.disconnect();
    logger.info('MongoDB connection closed gracefully.');
  }
}

/**
 * Query current database health telemetry, state, and latency.
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const readyState = mongoose.connection.readyState;
  const stateMap: Record<number, DatabaseConnectionState> = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTED', // disconnecting
  };

  const state = stateMap[readyState] || 'ERROR';

  if (state !== 'CONNECTED' || !mongoose.connection.db) {
    return {
      state,
      databaseName: mongoose.connection.name || undefined,
    };
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latencyMs = Date.now() - start;

    return {
      state: 'CONNECTED',
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      latencyMs,
    };
  } catch (err) {
    return {
      state: 'ERROR',
      databaseName: mongoose.connection.name,
    };
  }
}
