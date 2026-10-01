import { logger } from '../utils/logger.js';
import {
  ReportModel,
  IncidentModel,
  TeamModel,
  UserModel,
  DepartmentModel,
  WorkOrderModel,
  AgentExecutionModel,
} from '../models/index.js';

export interface IndexVerificationResult {
  allValid: boolean;
  checkedCollections: number;
  verifiedIndexes: string[];
  missingIndexes: string[];
}

/**
 * Validates that critical 2dsphere spatial indexes and primary unique indexes exist in MongoDB.
 */
export async function verifyRequiredIndexes(): Promise<IndexVerificationResult> {
  const verifiedIndexes: string[] = [];
  const missingIndexes: string[] = [];

  const checks = [
    {
      model: IncidentModel,
      name: 'Incident',
      requiredIndexName: 'location_2dsphere',
      isSpatial: true,
    },
    {
      model: ReportModel,
      name: 'Report',
      requiredIndexName: 'location_2dsphere',
      isSpatial: true,
    },
    {
      model: TeamModel,
      name: 'Team',
      requiredIndexName: 'currentLocation_2dsphere',
      isSpatial: true,
    },
    {
      model: UserModel,
      name: 'User',
      requiredIndexName: 'email_1',
      isSpatial: false,
    },
    {
      model: DepartmentModel,
      name: 'Department',
      requiredIndexName: 'code_1',
      isSpatial: false,
    },
    {
      model: IncidentModel,
      name: 'Incident',
      requiredIndexName: 'incidentNumber_1',
      isSpatial: false,
    },
    {
      model: WorkOrderModel,
      name: 'WorkOrder',
      requiredIndexName: 'workOrderNumber_1',
      isSpatial: false,
    },
    {
      model: AgentExecutionModel,
      name: 'AgentExecution',
      requiredIndexName: 'executionId_1',
      isSpatial: false,
    },
  ];

  for (const check of checks) {
    try {
      const indexes = await check.model.collection.indexes();
      const exists = indexes.some(
        (idx) =>
          idx.name === check.requiredIndexName ||
          (check.isSpatial && Object.values(idx.key || {}).includes('2dsphere'))
      );

      if (exists) {
        verifiedIndexes.push(`${check.name}.${check.requiredIndexName}`);
      } else {
        missingIndexes.push(`${check.name}.${check.requiredIndexName}`);
      }
    } catch (err) {
      logger.warn(`Could not verify index for ${check.name}:`, {
        error: err instanceof Error ? err.message : String(err),
      });
      missingIndexes.push(`${check.name}.${check.requiredIndexName}`);
    }
  }

  const allValid = missingIndexes.length === 0;

  logger.info('Database index verification completed', {
    allValid,
    verifiedCount: verifiedIndexes.length,
    missingCount: missingIndexes.length,
    missing: missingIndexes,
  });

  return {
    allValid,
    checkedCollections: checks.length,
    verifiedIndexes,
    missingIndexes,
  };
}
