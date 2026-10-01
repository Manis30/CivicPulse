import { getWorkflowQueue } from './agentWorkflowQueue.js';
import { getRedisStatus } from '../config/redis.js';

export interface QueueStatus {
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  isRedisConnected: boolean;
}

export const queueStatusPlaceholder: QueueStatus = {
  activeJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
  isRedisConnected: false,
};

/**
 * Live queue health and job counts from BullMQ and Redis.
 */
export async function getLiveQueueStatus(): Promise<QueueStatus> {
  try {
    const redisStatus = await getRedisStatus();
    const isRedisConnected = redisStatus.state === 'CONNECTED';

    if (!isRedisConnected) {
      return {
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        isRedisConnected: false,
      };
    }

    const queue = getWorkflowQueue();
    if (!queue) {
      return {
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        isRedisConnected: false,
      };
    }
    const counts = await queue.getJobCounts('active', 'completed', 'failed');

    return {
      activeJobs: counts.active || 0,
      completedJobs: counts.completed || 0,
      failedJobs: counts.failed || 0,
      isRedisConnected: true,
    };
  } catch {
    return {
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      isRedisConnected: false,
    };
  }
}
