import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { IAuditLog, AuditActorType } from '../models/AuditLog.js';

export class AuditLogService {
  /**
   * Append-only ledger logger.
   */
  async recordAction(params: {
    actorType: AuditActorType;
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    requestId?: string;
  }): Promise<IAuditLog> {
    return auditLogRepository.append(params);
  }

  async getResourceAuditTrail(resourceType: string, resourceId: string): Promise<IAuditLog[]> {
    return auditLogRepository.findByResource(resourceType, resourceId);
  }

  async getRecentAuditLogs(limit = 100): Promise<IAuditLog[]> {
    return auditLogRepository.findRecent(limit);
  }
}

export const auditLogService = new AuditLogService();
