import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisStatus, isRedisOnline } from '../../config/redis.js';
import { getWorkflowQueue } from '../../queues/agentWorkflowQueue.js';
import { SystemConfigurationModel } from '../../models/SystemConfiguration.js';

export class SystemController {
  async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const redisStatus = await getRedisStatus();

      let mongoStatus = 'DISCONNECTED';
      let mongoLatencyMs: number | undefined;

      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        mongoStatus = 'CONNECTED';
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        mongoLatencyMs = Date.now() - start;
      }

      const queue = getWorkflowQueue();
      const bullMqStatus = queue ? 'INITIALIZED' : 'OFFLINE';

      const overallHealth =
        mongoStatus === 'CONNECTED' && (redisStatus.state === 'CONNECTED' || !isRedisOnline())
          ? 'HEALTHY'
          : 'DEGRADED';

      const mem = process.memoryUsage();
      const memoryMetrics = {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      };

      const healthPayload = {
        status: overallHealth.toLowerCase() as 'healthy' | 'degraded' | 'unhealthy',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {
          mongodb: {
            status: (mongoStatus === 'CONNECTED' ? 'healthy' : 'unhealthy') as 'healthy' | 'unhealthy',
            state: mongoStatus,
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            pingMs: mongoLatencyMs ?? 0,
            latencyMs: mongoLatencyMs,
          },
          redis: {
            status: (redisStatus.state === 'CONNECTED' ? 'healthy' : 'unhealthy') as 'healthy' | 'unhealthy',
            state: redisStatus.state,
            host: redisStatus.host,
            port: redisStatus.port,
            pingMs: redisStatus.latencyMs ?? 0,
            latencyMs: redisStatus.latencyMs,
            clientCount: redisStatus.clientCount,
          },
          bullmq: {
            status: (bullMqStatus === 'INITIALIZED' ? 'healthy' : 'unhealthy') as 'healthy' | 'unhealthy',
            state: bullMqStatus,
            activeWorkers: queue ? 1 : 0,
            workersReady: Boolean(queue),
          },
          memory: memoryMetrics,
        },
      };

      res.json({
        success: true,
        data: healthPayload,
        ...healthPayload,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getQueues(_req: Request, res: Response): Promise<void> {
    try {
      const queue = getWorkflowQueue();

      if (!queue) {
        const fallbackQueues = {
          status: 'unhealthy' as const,
          queues: {
            orchestration: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0 },
            deadLetter: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0 },
          },
          message: 'BullMQ queue is offline (Redis unavailable).',
        };

        res.json({
          success: true,
          data: fallbackQueues,
          ...fallbackQueues,
        });
        return;
      }

      const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      const queuePayload = {
        status: 'healthy' as const,
        queues: {
          orchestration: { ...counts, total },
          deadLetter: { waiting: counts.failed || 0, active: 0, completed: 0, failed: 0, delayed: 0, total: counts.failed || 0 },
        },
      };

      res.json({
        success: true,
        data: queuePayload,
        ...queuePayload,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getConfig(_req: Request, res: Response): Promise<void> {
    try {
      let config = await SystemConfigurationModel.findOne();
      if (!config) {
        config = await SystemConfigurationModel.create({});
      }

      // Check real environment variable presence safely (never expose secret tokens)
      const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
      const hasRedis = isRedisOnline();
      const hasMapbox = Boolean(process.env.MAPBOX_ACCESS_TOKEN || process.env.VITE_MAPBOX_TOKEN);
      const hasWebhookSecret = Boolean(process.env.WEBHOOK_SECRET);

      const sanitized = {
        _id: config._id,
        clusterName: config.clusterName,
        timezone: config.timezone,
        autoDispatchThreshold: config.autoDispatchThreshold,
        slaGraceMinutes: config.slaGraceMinutes,
        featureFlags: config.featureFlags,
        integrations: {
          gemini: {
            configured: hasGeminiKey,
            model: config.integrations?.gemini?.model || 'gemini-1.5-flash',
          },
          redis: {
            configured: hasRedis,
          },
          mapbox: {
            configured: hasMapbox,
          },
          webhooks: {
            configured: hasWebhookSecret,
          },
        },
        updatedAt: config.updatedAt,
      };

      res.json({ success: true, data: sanitized });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const {
        clusterName,
        timezone,
        autoDispatchThreshold,
        slaGraceMinutes,
        featureFlags,
      } = req.body;

      let config = await SystemConfigurationModel.findOne();
      if (!config) {
        config = new SystemConfigurationModel();
      }

      if (clusterName) config.clusterName = clusterName;
      if (timezone) config.timezone = timezone;
      if (autoDispatchThreshold !== undefined) config.autoDispatchThreshold = Number(autoDispatchThreshold);
      if (slaGraceMinutes !== undefined) config.slaGraceMinutes = Number(slaGraceMinutes);
      if (featureFlags) config.featureFlags = { ...config.featureFlags, ...featureFlags };
      config.updatedAt = new Date();

      await config.save();

      res.json({
        success: true,
        data: config,
        message: 'System cluster configuration updated and persisted',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}

export const systemController = new SystemController();
