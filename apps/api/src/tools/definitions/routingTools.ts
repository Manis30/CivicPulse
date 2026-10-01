import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { departmentService } from '../../services/departmentService.js';
import { teamService } from '../../services/teamService.js';
import { incidentService } from '../../services/incidentService.js';
import { analyticsService } from '../../services/analyticsService.js';
import { PolicyRules } from '../policies/policyRules.js';

export const getDepartmentTool: ToolDefinition = {
  name: 'getDepartment',
  description: 'Retrieves department profile, covered categories, and SLA configuration',
  category: 'READ',
  requiredPermission: 'tools:routing:read',
  inputSchema: z
    .object({
      departmentId: z.string().optional(),
      code: z.string().optional(),
      category: z.string().optional(),
    })
    .refine((data) => Boolean(data.departmentId || data.code || data.category), {
      message: 'Either departmentId, code, or category must be provided',
    }),
  outputSchema: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    categories: z.array(z.string()),
    wardIds: z.array(z.string()),
  }),
  execute: async (input) => {
    let dept = null;
    if (input.departmentId) {
      dept = await departmentService.getDepartmentById(input.departmentId);
    } else if (input.code) {
      dept = await departmentService.getDepartmentByCode(input.code);
    } else if (input.category) {
      const depts = await departmentService.getDepartmentsForCategory(input.category as any);
      dept = depts[0] || null;
    }

    if (!dept) {
      throw new Error(`Department not found for query: ${JSON.stringify(input)}`);
    }

    return {
      id: dept._id.toString(),
      code: dept.code,
      name: dept.name,
      categories: dept.categories,
      wardIds: dept.wardIds,
    };
  },
};

export const getDepartmentWorkloadTool: ToolDefinition = {
  name: 'getDepartmentWorkload',
  description: 'Analyzes active incident distribution and operational capacity across departments',
  category: 'READ',
  requiredPermission: 'tools:routing:read',
  inputSchema: z.object({
    departmentId: z.string().optional(),
  }),
  outputSchema: z.object({
    workloads: z.array(
      z.object({
        departmentId: z.string(),
        departmentName: z.string().optional(),
        activeCount: z.number(),
      })
    ),
  }),
  execute: async (_input) => {
    const overview = await analyticsService.getOperationalOverview();
    return {
      workloads: overview.departmentWorkload.map((w) => ({
        departmentId: String(w.departmentId),
        departmentName: w.departmentName,
        activeCount: w.activeCount,
      })),
    };
  },
};

export const getAvailableTeamsTool: ToolDefinition = {
  name: 'getAvailableTeams',
  description: 'Lists operational field teams by department and availability status',
  category: 'READ',
  requiredPermission: 'tools:routing:read',
  inputSchema: z.object({
    departmentId: z.string().optional(),
    ward: z.string().optional(),
  }),
  outputSchema: z.object({
    teams: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        departmentId: z.string().optional(),
        availabilityStatus: z.string(),
        activeWorkload: z.number(),
        capacity: z.number(),
        specializations: z.array(z.string()),
      })
    ),
  }),
  execute: async (input) => {
    let teams = await teamService.getTeams({ departmentId: input.departmentId, wardId: input.ward });
    if (teams.length === 0 && input.ward) {
      teams = await teamService.getTeams({ departmentId: input.departmentId });
    }
    if (teams.length === 0) {
      teams = await teamService.getTeams();
    }
    return {
      teams: teams.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        departmentId: t.departmentId?.toString(),
        availabilityStatus: t.availabilityStatus,
        activeWorkload: t.activeWorkload,
        capacity: t.capacity,
        specializations: t.specializations,
      })),
    };
  },
};

export const assignDepartmentTool: ToolDefinition = {
  name: 'assignDepartment',
  description: 'Assigns an incident to a specific municipal department',
  category: 'WRITE',
  requiredPermission: 'tools:routing:assign',
  inputSchema: z.object({
    incidentId: z.string().min(1),
    departmentId: z.string().min(1),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    departmentId: z.string(),
    assignedAt: z.string(),
  }),
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_DEPARTMENT_ASSIGNED',
  },
  execute: async (input) => {
    const updated = await incidentService.updateIncident(input.incidentId, {
      departmentId: input.departmentId as any,
    });
    if (!updated) throw new Error(`Failed to assign department for incident ${input.incidentId}`);

    return {
      incidentId: input.incidentId,
      departmentId: input.departmentId,
      assignedAt: new Date().toISOString(),
    };
  },
};

export const assignTeamTool: ToolDefinition = {
  name: 'assignTeam',
  description: 'Assigns an operational field team to an incident with policy guard enforcement',
  category: 'WRITE',
  requiredPermission: 'tools:routing:assign',
  inputSchema: z.object({
    incidentId: z.string().min(1),
    teamId: z.string().min(1),
    reason: z.string().optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    teamId: z.string(),
    status: z.string(),
    assignedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkAssignTeam,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_TEAM_ASSIGNED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const updated = await incidentService.assignTeam(
      input.incidentId,
      input.teamId,
      {
        actorType,
        actorId: context.agentId,
      }
    );
    if (!updated) throw new Error(`Failed to assign team to incident ${input.incidentId}`);

    return {
      incidentId: input.incidentId,
      teamId: input.teamId,
      status: updated.status,
      assignedAt: new Date().toISOString(),
    };
  },
};
