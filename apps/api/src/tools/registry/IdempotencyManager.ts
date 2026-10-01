import { getSharedRedisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';

/**
 * Idempotency Store for WRITE tool executions and asynchronous workflow coordination.
 * Dual-mode:
 * - Redis-backed distributed coordination across worker processes when Redis is connected
 * - In-memory store fallback with TTL for local execution and test environments
 */
export interface CachedToolExecution {
  timestamp: number;
  result: any;
}

export class IdempotencyManager {
  private static cache: Map<string, CachedToolExecution> = new Map();
  private static defaultTtlMs = 1000 * 60 * 15; // 15 minutes TTL
  private static activeWorkflowLocks: Map<string, { orchestrationId: string; expiresAt: number }> = new Map();

  /**
   * Generates a deterministic idempotency key for an execution.
   */
  static generateKey(executionId: string, toolName: string, resourceId?: string): string {
    return `${executionId}:${toolName}:${resourceId || 'global'}`;
  }

  /**
   * Generates a deterministic idempotency key for multi-agent orchestrations.
   * Format: orchestrationId:agentId:toolName:resourceId
   */
  static generateOrchestrationKey(
    orchestrationId: string,
    agentId: string,
    toolName: string,
    resourceId?: string
  ): string {
    return `${orchestrationId}:${agentId}:${toolName}:${resourceId || 'global'}`;
  }

  /**
   * Generates a deterministic workflow coordination key.
   */
  static generateWorkflowKey(incidentId: string): string {
    return `workflow:active:${incidentId}`;
  }

  /**
   * Checks if an execution has already completed for this key (in-memory sync check).
   */
  static get(key: string): CachedToolExecution | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.defaultTtlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry;
  }

  /**
   * Stores the successful execution result (in-memory sync).
   */
  static set(key: string, result: any): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      result,
    });

    // Also attempt distributed Redis cache asynchronously if available
    this.setDistributed(key, result).catch(() => {});
  }

  /**
   * Distributed get from Redis with fallback to in-memory store.
   */
  static async getDistributed(key: string): Promise<CachedToolExecution | undefined> {
    try {
      const redis = getSharedRedisClient();
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        const raw = await redis.get(`idempotency:${key}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            timestamp: parsed.timestamp || Date.now(),
            result: parsed.result,
          };
        }
      }
    } catch {
      // Fallback to local in-memory
    }

    return this.get(key);
  }

  /**
   * Distributed set in Redis with fallback to in-memory store.
   */
  static async setDistributed(key: string, result: any, ttlSeconds: number = 900): Promise<void> {
    try {
      const redis = getSharedRedisClient();
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        const data = JSON.stringify({ timestamp: Date.now(), result });
        await redis.set(`idempotency:${key}`, data, 'EX', ttlSeconds);
      }
    } catch {
      // Silently fall back to in-memory
    }
  }

  /**
   * Acquires a distributed lock for an incident workflow to prevent duplicate active jobs.
   * Returns true if lock was acquired, false if a workflow is already active for this incident.
   */
  static async acquireWorkflowLock(
    incidentId: string,
    orchestrationId: string,
    ttlSeconds: number = 300 // 5 minutes lock
  ): Promise<boolean> {
    const key = this.generateWorkflowKey(incidentId);

    try {
      const redis = getSharedRedisClient();
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        // SET key value EX ttl NX: sets key only if it does not already exist
        const acquired = await redis.set(key, orchestrationId, 'EX', ttlSeconds, 'NX');
        if (acquired === 'OK') {
          return true;
        }
        return false;
      }
    } catch {
      // Redis unavailable: fallback to multi-worker safe in-memory lock
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.activeWorkflowLocks.get(key);
    if (existing && existing.expiresAt > now && existing.orchestrationId !== orchestrationId) {
      return false;
    }

    this.activeWorkflowLocks.set(key, {
      orchestrationId,
      expiresAt: now + ttlSeconds * 1000,
    });
    return true;
  }

  /**
   * Releases the workflow lock once the workflow completes or fails permanently.
   */
  static async releaseWorkflowLock(incidentId: string, orchestrationId: string): Promise<void> {
    const key = this.generateWorkflowKey(incidentId);

    try {
      const redis = getSharedRedisClient();
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        // Only release if the lock still belongs to this orchestrationId
        const currentHolder = await redis.get(key);
        if (currentHolder === orchestrationId) {
          await redis.del(key);
        }
      }
    } catch {
      // Ignore Redis error during release
    }

    const existing = this.activeWorkflowLocks.get(key);
    if (existing && existing.orchestrationId === orchestrationId) {
      this.activeWorkflowLocks.delete(key);
    }
  }

  /**
   * Checks if an incident currently has an active workflow running.
   */
  static async isWorkflowActive(incidentId: string): Promise<boolean> {
    const key = this.generateWorkflowKey(incidentId);

    try {
      const redis = getSharedRedisClient();
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        const val = await redis.get(key);
        return val !== null;
      }
    } catch {
      // Fallback
    }

    const existing = this.activeWorkflowLocks.get(key);
    return !!(existing && existing.expiresAt > Date.now());
  }

  /**
   * Clear cache (useful for testing).
   */
  static clear(): void {
    this.cache.clear();
    this.activeWorkflowLocks.clear();
  }
}
