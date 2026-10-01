import { getSharedRedisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const KEY_PREFIX = 'civicpulse:cache:';

export class CacheService {
  private enabled: boolean;
  private defaultTTL: number;

  constructor() {
    this.enabled = env.REDIS_CACHE_ENABLED ?? true;
    this.defaultTTL = env.REDIS_CACHE_DEFAULT_TTL ?? 60;
  }

  private formatKey(key: string): string {
    return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`;
  }

  /**
   * Retrieves an item from Redis cache.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    const redis = getSharedRedisClient();
    if (!redis) return null;

    try {
      const fullKey = this.formatKey(key);
      const data = await redis.get(fullKey);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      logger.debug(`Cache read error for key "${key}": ${err.message}`);
      return null;
    }
  }

  /**
   * Stores an item in Redis cache with a Time-To-Live (TTL in seconds).
   */
  async set(key: string, value: any, ttlSeconds: number = this.defaultTTL): Promise<void> {
    if (!this.enabled || value === undefined) return;

    const redis = getSharedRedisClient();
    if (!redis) return;

    try {
      const fullKey = this.formatKey(key);
      const serialized = JSON.stringify(value);
      await redis.set(fullKey, serialized, 'EX', Math.max(1, ttlSeconds));
    } catch (err: any) {
      logger.debug(`Cache write error for key "${key}": ${err.message}`);
    }
  }

  /**
   * Deletes a specific cached key.
   */
  async del(key: string): Promise<void> {
    const redis = getSharedRedisClient();
    if (!redis) return;

    try {
      const fullKey = this.formatKey(key);
      await redis.del(fullKey);
    } catch (err: any) {
      logger.debug(`Cache delete error for key "${key}": ${err.message}`);
    }
  }

  /**
   * Deletes all cached keys matching a glob pattern using non-blocking SCAN.
   */
  async delPattern(pattern: string): Promise<void> {
    const redis = getSharedRedisClient();
    if (!redis) return;

    try {
      const matchPattern = this.formatKey(pattern);
      const stream = redis.scanStream({
        match: matchPattern,
        count: 50,
      });

      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          const pipeline = redis.pipeline();
          keys.forEach((k) => pipeline.del(k));
          await pipeline.exec();
        }
      });
    } catch (err: any) {
      logger.debug(`Cache delPattern error for pattern "${pattern}": ${err.message}`);
    }
  }

  /**
   * Cache-Aside Wrapper: Checks cache first. On miss, calls fetchFn, caches result with TTL, and returns.
   */
  async wrap<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return fetchFn();
    }

    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  // ==========================================
  // Domain Specific Cache Invalidation Helpers
  // ==========================================

  /**
   * Invalidate caches related to an incident (dossier, details, incident lists).
   */
  async invalidateIncident(incidentId: string, incidentNumber?: string): Promise<void> {
    const keys = [
      `incident:${incidentId}:dossier`,
      `incident:${incidentId}:detail`,
      'system:telemetry',
    ];
    if (incidentNumber) {
      keys.push(`incident:${incidentNumber}:dossier`);
      keys.push(`incident:${incidentNumber}:detail`);
    }

    await Promise.all([
      ...keys.map((k) => this.del(k)),
      this.delPattern(`incident:${incidentId}*`),
      ...(incidentNumber ? [this.delPattern(`incident:${incidentNumber}*`)] : []),
      this.delPattern('incidents:list:*'),
    ]);
  }

  /**
   * Invalidate department caches.
   */
  async invalidateDepartments(): Promise<void> {
    await this.delPattern('departments:*');
  }

  /**
   * Invalidate policy caches.
   */
  async invalidatePolicies(): Promise<void> {
    await this.delPattern('policies:*');
  }
}

export const cacheService = new CacheService();
