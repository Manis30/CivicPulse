import { AgentId } from '@civicpulse/shared';
import { ToolPermission } from './permissions.js';
import { AGENT_PERMISSION_MAP, VALID_AGENT_IDS } from './agentPermissions.js';
import { ToolExecutionContext } from '../registry/ToolExecutionContext.js';

export interface PermissionCheckResult {
  allowed: boolean;
  agentId: AgentId;
  permission: ToolPermission;
  reason: 'PERMISSION_GRANTED' | 'PERMISSION_DENIED' | 'UNKNOWN_AGENT_IDENTITY' | 'AGENT_IDENTITY_MISMATCH';
}

/**
 * AgentPermissionGuard
 * Evaluates whether an agent has authorization to execute a requested tool.
 * Enforces strict identity protection: agents cannot claim another agent's role or invoke unauthorized tools.
 */
export class AgentPermissionGuard {
  static check(
    agentId: AgentId,
    requiredPermission: ToolPermission,
    context?: ToolExecutionContext
  ): PermissionCheckResult {
    // 1. Verify that agentId is one of the authoritative 10 agents
    if (!VALID_AGENT_IDS.includes(agentId)) {
      return {
        allowed: false,
        agentId,
        permission: requiredPermission,
        reason: 'UNKNOWN_AGENT_IDENTITY',
      };
    }

    // 2. Prevent identity spoofing: context agentId must match the target agentId
    if (context && context.agentId !== agentId) {
      return {
        allowed: false,
        agentId,
        permission: requiredPermission,
        reason: 'AGENT_IDENTITY_MISMATCH',
      };
    }

    // 3. Check permission against the immutable least-privilege matrix
    const grantedPermissions = AGENT_PERMISSION_MAP[agentId] || [];
    const isGranted = grantedPermissions.includes(requiredPermission);

    return {
      allowed: isGranted,
      agentId,
      permission: requiredPermission,
      reason: isGranted ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
    };
  }
}
