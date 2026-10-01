import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { incidentService } from '../../services/incidentService.js';
import { PolicyRules } from '../policies/policyRules.js';

export const closeIncidentTool: ToolDefinition = {
  name: 'closeIncident',
  description: 'Closes a verified incident after resolution verification has succeeded',
  category: 'WRITE',
  requiredPermission: 'tools:incident:close',
  inputSchema: z.object({
    incidentId: z.string().min(1),
    verificationOutcome: z.enum(['LIKELY_RESOLVED', 'POSSIBLY_UNRESOLVED']).optional().default('LIKELY_RESOLVED'),
    resolutionNotes: z.string().optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    status: z.literal('CLOSED'),
    closedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkCloseIncident,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_CLOSED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const closed = await incidentService.closeIncident(
      input.incidentId,
      {
        actorType,
        actorId: context.agentId,
      },
      input.resolutionNotes
    );

    if (!closed) throw new Error(`Failed to close incident: ${input.incidentId}`);

    return {
      incidentId: input.incidentId,
      status: 'CLOSED' as const,
      closedAt: new Date(closed.closedAt || Date.now()).toISOString(),
    };
  },
};

export const reopenIncidentTool: ToolDefinition = {
  name: 'reopenIncident',
  description: 'Reopens an incident when post-repair verification fails or citizen disputes resolution',
  category: 'WRITE',
  requiredPermission: 'tools:incident:reopen',
  inputSchema: z.object({
    incidentId: z.string().min(1),
    verificationOutcome: z.enum(['LIKELY_RESOLVED', 'POSSIBLY_UNRESOLVED']).optional().default('POSSIBLY_UNRESOLVED'),
    reason: z.string().min(3),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    status: z.literal('REOPENED'),
    reopenCount: z.number(),
    reopenedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkReopenIncident,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_REOPENED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const reopened = await incidentService.reopenIncident(
      input.incidentId,
      input.reason,
      {
        actorType,
        actorId: context.agentId,
      }
    );

    if (!reopened) throw new Error(`Failed to reopen incident: ${input.incidentId}`);

    return {
      incidentId: input.incidentId,
      status: 'REOPENED' as const,
      reopenCount: reopened.reopenCount,
      reopenedAt: new Date(reopened.reopenedAt || Date.now()).toISOString(),
    };
  },
};
