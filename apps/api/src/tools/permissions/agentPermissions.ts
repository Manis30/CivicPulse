import { AgentId } from '@civicpulse/shared';
import { ToolPermission } from './permissions.js';

/**
 * Exact Agent Permission Matrix for the 10 CivicPulse Autonomous Agents.
 * Strict principle of least privilege: agents only receive permissions required for their specific domain.
 */
export const AGENT_PERMISSION_MAP: Readonly<Record<AgentId, readonly ToolPermission[]>> = Object.freeze({
  AGENT_VISION: Object.freeze<ToolPermission[]>([
    'tools:vision:analyze',
    'tools:vision:classify',
    'tools:incident:classify',
  ]),

  AGENT_LOCATION: Object.freeze<ToolPermission[]>([
    'tools:location:geocode',
    'tools:location:read',
    'tools:location:update',
  ]),

  AGENT_DUPLICATE: Object.freeze<ToolPermission[]>([
    'tools:duplicate:search',
    'tools:duplicate:text',
    'tools:location:read',
    'tools:duplicate:link',
  ]),

  AGENT_SEVERITY: Object.freeze<ToolPermission[]>([
    'tools:severity:calculate',
    'tools:location:read',
    'tools:severity:set',
    'tools:incident:validate',
  ]),

  AGENT_ROUTING: Object.freeze<ToolPermission[]>([
    'tools:routing:read',
    'tools:routing:assign',
    'tools:incident:validate',
  ]),

  AGENT_INVESTIGATION: Object.freeze<ToolPermission[]>([
    'tools:investigation:read',
    'tools:location:read',
  ]),

  AGENT_OPERATIONS: Object.freeze<ToolPermission[]>([
    'tools:operations:workorder',
    'tools:operations:update',
    'tools:routing:read',
  ]),

  AGENT_VERIFICATION: Object.freeze<ToolPermission[]>([
    'tools:verification:evaluate',
    'tools:incident:reopen',
    'tools:incident:close',
    'tools:vision:analyze',
  ]),

  AGENT_NOTIFICATION: Object.freeze<ToolPermission[]>([
    'tools:notification:send',
  ]),

  AGENT_INTELLIGENCE: Object.freeze<ToolPermission[]>([
    'tools:intelligence:read',
    'tools:routing:read',
  ]),
});

export const VALID_AGENT_IDS = Object.freeze(Object.keys(AGENT_PERMISSION_MAP) as AgentId[]);
