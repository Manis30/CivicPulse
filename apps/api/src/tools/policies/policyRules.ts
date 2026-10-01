import { PolicyEvaluationResult } from './policyTypes.js';
import { incidentService } from '../../services/incidentService.js';
import { teamService } from '../../services/teamService.js';
import { ToolExecutionContext } from '../registry/ToolExecutionContext.js';

/**
 * Deterministic business safety policies.
 * Evaluated before tool execution to prevent invalid state mutations.
 */
export class PolicyRules {
  /**
   * Rule: closeIncident
   * Allowed ONLY if incident is in 'VERIFYING' status AND verification outcome is 'LIKELY_RESOLVED'.
   */
  static async checkCloseIncident(
    input: { incidentId: string; verificationOutcome?: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_CLOSE_NOT_FOUND',
        reason: 'Target incident not found',
      };
    }

    if (incident.status !== 'VERIFYING') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_CLOSE_INVALID_STATUS',
        reason: `Cannot close incident in '${incident.status}' state. Must be in 'VERIFYING' state.`,
      };
    }

    const outcome = input.verificationOutcome || incident.verificationResult?.outcome;
    if (outcome !== 'LIKELY_RESOLVED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_CLOSE_UNVERIFIED',
        reason: `Incident cannot be closed without verification outcome 'LIKELY_RESOLVED'. Current outcome: '${outcome || 'NONE'}'.`,
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Incident closure safety policy satisfied',
    };
  }

  /**
   * Rule: reopenIncident
   * Allowed ONLY if incident is in 'VERIFYING' status AND verification outcome is 'POSSIBLY_UNRESOLVED'.
   */
  static async checkReopenIncident(
    input: { incidentId: string; verificationOutcome?: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_REOPEN_NOT_FOUND',
        reason: 'Target incident not found',
      };
    }

    if (incident.status !== 'VERIFYING') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_REOPEN_INVALID_STATUS',
        reason: `Cannot reopen incident in '${incident.status}' state. Must be in 'VERIFYING' state.`,
      };
    }

    const outcome = input.verificationOutcome || incident.verificationResult?.outcome;
    if (outcome !== 'POSSIBLY_UNRESOLVED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_REOPEN_RESOLUTION_PASSED',
        reason: `Cannot reopen incident when verification outcome is not 'POSSIBLY_UNRESOLVED'. Outcome: '${outcome || 'NONE'}'.`,
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Incident reopening policy satisfied',
    };
  }

  /**
   * Rule: assignTeam
   * Allowed ONLY if incident status is 'VALIDATED' or 'ASSIGNED', and team matches incident department.
   */
  static async checkAssignTeam(
    input: { incidentId: string; teamId: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_ASSIGN_NOT_FOUND',
        reason: 'Target incident not found',
      };
    }

    if (incident.status !== 'VALIDATED' && incident.status !== 'ASSIGNED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_ASSIGN_INVALID_STATUS',
        reason: `Cannot assign team to incident in '${incident.status}' state. Allowed states: VALIDATED, ASSIGNED.`,
      };
    }

    const team = await teamService.getTeamById(input.teamId);
    if (!team) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_ASSIGN_TEAM_NOT_FOUND',
        reason: 'Assigned team not found',
      };
    }

    // Check departmental alignment if incident has a department assigned
    if (incident.departmentId && team.departmentId) {
      const incidentDept = incident.departmentId._id?.toString() || incident.departmentId.toString();
      const teamDept = team.departmentId._id?.toString() || team.departmentId.toString();
      if (incidentDept !== teamDept) {
        return {
          allowed: false,
          policyVersion: '1.0.0',
          ruleId: 'RULE_ASSIGN_DEPARTMENT_MISMATCH',
          reason: `Team department (${teamDept}) does not match incident department (${incidentDept}).`,
        };
      }
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Team assignment policy satisfied',
    };
  }

  /**
   * Rule: createWorkOrder
   * Allowed ONLY if incident is in 'ASSIGNED' or 'IN_PROGRESS' status.
   */
  static async checkCreateWorkOrder(
    input: { incidentId: string; departmentId: string; teamId: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_WO_INCIDENT_NOT_FOUND',
        reason: 'Target incident for work order not found',
      };
    }

    if (incident.status !== 'ASSIGNED' && incident.status !== 'IN_PROGRESS') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_WO_INVALID_STATUS',
        reason: `Cannot create work order for incident in '${incident.status}' state. Allowed states: ASSIGNED, IN_PROGRESS.`,
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Work order creation policy satisfied',
    };
  }

  /**
   * Rule: updateIncidentClassification
   * Allowed ONLY if target incident exists and is not in terminal CLOSED state.
   */
  static async checkUpdateIncidentClassification(
    input: { incidentId: string; category?: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_CLASSIFY_INCIDENT_NOT_FOUND',
        reason: 'Target incident for classification update not found',
      };
    }

    if (incident.status === 'CLOSED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_CLASSIFY_INCIDENT_CLOSED',
        reason: 'Cannot update classification for a closed incident',
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Incident classification policy satisfied',
    };
  }

  /**
   * Rule: updateIncidentLocation
   * Allowed ONLY if incident exists, is not CLOSED, and coordinates are within valid geographic bounds.
   */
  static async checkUpdateIncidentLocation(
    input: { incidentId: string; latitude: number; longitude: number },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_LOCATION_INCIDENT_NOT_FOUND',
        reason: 'Target incident for location update not found',
      };
    }

    if (incident.status === 'CLOSED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_LOCATION_INCIDENT_CLOSED',
        reason: 'Cannot update location for a closed incident',
      };
    }

    if (
      typeof input.latitude !== 'number' ||
      typeof input.longitude !== 'number' ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_LOCATION_COORDINATES_INVALID',
        reason: 'Invalid latitude/longitude coordinates range',
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Incident location update policy satisfied',
    };
  }

  /**
   * Rule: linkReportToIncident
   * Allowed ONLY if target incident exists and is not CLOSED.
   */
  static async checkLinkReportToIncident(
    input: { targetIncidentId: string; reportId: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.targetIncidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_LINK_TARGET_NOT_FOUND',
        reason: 'Target incident for duplicate linking not found',
      };
    }

    if (incident.status === 'CLOSED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_LINK_TARGET_CLOSED',
        reason: 'Cannot link report to a closed incident',
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Duplicate report linking policy satisfied',
    };
  }

  /**
   * Rule: setSeverity
   * Allowed ONLY if incident exists and is not in terminal CLOSED state.
   */
  static async checkSetSeverity(
    input: { incidentId: string; severity: string },
    _context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_SEVERITY_INCIDENT_NOT_FOUND',
        reason: 'Target incident for severity assignment not found',
      };
    }

    if (incident.status === 'CLOSED') {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_SEVERITY_INCIDENT_CLOSED',
        reason: 'Cannot set severity for a closed incident',
      };
    }

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(input.severity)) {
      return {
        allowed: false,
        policyVersion: '1.0.0',
        ruleId: 'RULE_SEVERITY_INVALID_LEVEL',
        reason: `Invalid severity level: '${input.severity}'. Allowed levels: LOW, MEDIUM, HIGH, CRITICAL.`,
      };
    }

    return {
      allowed: true,
      policyVersion: '1.0.0',
      reason: 'Severity setting policy satisfied',
    };
  }
}
