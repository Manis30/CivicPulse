import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { workOrderService } from '../../services/workOrderService.js';
import { PolicyRules } from '../policies/policyRules.js';
import { SeverityLevel } from '@civicpulse/shared';

export const createWorkOrderTool: ToolDefinition = {
  name: 'createWorkOrder',
  description: 'Dispatches an official field work order for an assigned incident',
  category: 'WRITE',
  requiredPermission: 'tools:operations:workorder',
  inputSchema: z.object({
    incidentId: z.string().min(1),
    departmentId: z.string().min(1),
    teamId: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    targetHours: z.number().positive().default(24),
    checklist: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    workOrderId: z.string(),
    workOrderNumber: z.string(),
    status: z.string(),
    deadlineAt: z.string(),
  }),
  policyCheck: PolicyRules.checkCreateWorkOrder,
  auditConfig: {
    resourceType: 'WORK_ORDER',
    getResourceId: (_input, output) => output.workOrderId,
    action: 'WORK_ORDER_CREATED',
  },
  execute: async (input, context) => {
    const checklistItems = input.checklist?.map((item: string) => ({ item, completed: false })) || [
      { item: 'Inspect site condition and secure perimeter', completed: false },
      { item: 'Execute standard repair protocol', completed: false },
      { item: 'Capture post-repair verification evidence', completed: false },
    ];

    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const workOrder = await workOrderService.createWorkOrder(
      {
        incidentId: input.incidentId,
        departmentId: input.departmentId,
        teamId: input.teamId,
        priority: input.priority as SeverityLevel,
        targetHours: input.targetHours,
        checklist: checklistItems,
      },
      {
        actorType,
        actorId: context.agentId,
      }
    );

    return {
      workOrderId: workOrder._id.toString(),
      workOrderNumber: workOrder.workOrderNumber,
      status: workOrder.status,
      deadlineAt: new Date(workOrder.sla.deadlineAt).toISOString(),
    };
  },
};

export const updateWorkOrderTool: ToolDefinition = {
  name: 'updateWorkOrder',
  description: 'Updates work order execution status and completion notes',
  category: 'WRITE',
  requiredPermission: 'tools:operations:update',
  inputSchema: z.object({
    workOrderId: z.string().min(1),
    status: z.enum(['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    inspectionNotes: z.string().optional(),
    completionNotes: z.string().optional(),
  }),
  outputSchema: z.object({
    workOrderId: z.string(),
    status: z.string(),
    updatedAt: z.string(),
  }),
  auditConfig: {
    resourceType: 'WORK_ORDER',
    getResourceId: (input) => input.workOrderId,
    action: 'WORK_ORDER_STATUS_UPDATED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const updated = await workOrderService.updateWorkOrderStatus(
      input.workOrderId,
      input.status,
      {
        actorType,
        actorId: context.agentId,
      },
      {
        inspectionNotes: input.inspectionNotes,
        completionNotes: input.completionNotes,
      }
    );

    if (!updated) throw new Error(`Work order not found: ${input.workOrderId}`);

    return {
      workOrderId: input.workOrderId,
      status: updated.status,
      updatedAt: new Date().toISOString(),
    };
  },
};
