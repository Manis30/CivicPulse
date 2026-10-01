import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { incidentService } from '../../services/incidentService.js';

export const getIncidentHistoryTool: ToolDefinition = {
  name: 'getIncidentHistory',
  description: 'Retrieves chronological event timeline, previous state transitions, and audit records for an incident',
  category: 'READ',
  requiredPermission: 'tools:investigation:read',
  inputSchema: z.object({
    incidentId: z.string().min(1),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    eventCount: z.number(),
    events: z.array(
      z.object({
        type: z.string(),
        actorType: z.string(),
        actorId: z.string().optional(),
        fromStatus: z.string().optional(),
        toStatus: z.string().optional(),
        description: z.string(),
        timestamp: z.string(),
      })
    ),
  }),
  execute: async (input) => {
    const timeline = await incidentService.getIncidentTimeline(input.incidentId);

    return {
      incidentId: input.incidentId,
      eventCount: timeline.length,
      events: timeline.map((evt) => ({
        type: evt.type,
        actorType: evt.actorType,
        actorId: evt.actorId,
        fromStatus: evt.fromStatus,
        toStatus: evt.toStatus,
        description: evt.description,
        timestamp: new Date(evt.timestamp).toISOString(),
      })),
    };
  },
};
