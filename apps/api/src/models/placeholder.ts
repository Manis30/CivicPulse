/**
 * CivicPulse Model Foundation Placeholder
 * 
 * In Phase 2, this module will export Mongoose models for:
 * - User, Department, Team
 * - Incident (with 2dsphere geospatial index)
 * - Report, Evidence, WorkOrder
 * - IncidentEvent, AgentExecution, Notification, AuditLog, AIPolicy
 * 
 * GUARDRAIL: Agents MUST NEVER directly import or access these models.
 * All agent interactions must flow strictly through the Tool Registry.
 */

export interface DatabaseConnectionStatus {
  connected: boolean;
  uri: string;
  geospatialIndexesReady: boolean;
}

export const dbStatusPlaceholder: DatabaseConnectionStatus = {
  connected: false,
  uri: 'mongodb://127.0.0.1:27017/civicpulse',
  geospatialIndexesReady: false,
};
