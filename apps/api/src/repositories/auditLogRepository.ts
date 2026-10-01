import { IAuditLog, AuditLogModel } from '../models/AuditLog.js';

export class AuditLogRepository {
  /**
   * Append-only ledger recording.
   * Note: Update or delete operations are explicitly forbidden by design.
   */
  async append(data: {
    actorType: 'USER' | 'AI_AGENT' | 'SYSTEM';
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    requestId?: string;
  }): Promise<IAuditLog> {
    return AuditLogModel.create(data);
  }

  async findByResource(resourceType: string, resourceId: string): Promise<IAuditLog[]> {
    return AuditLogModel.find({ resourceType, resourceId }).sort({ timestamp: -1 });
  }

  async findByActor(actorType: 'USER' | 'AI_AGENT' | 'SYSTEM', actorId: string): Promise<IAuditLog[]> {
    return AuditLogModel.find({ actorType, actorId }).sort({ timestamp: -1 }).limit(100);
  }

  async findRecent(limit = 100): Promise<IAuditLog[]> {
    return AuditLogModel.find().sort({ timestamp: -1 }).limit(limit);
  }
}

export const auditLogRepository = new AuditLogRepository();
