import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { incidentService } from '../../services/incidentService.js';
import { PolicyRules } from '../policies/policyRules.js';
import { IncidentCategory, SeverityLevel } from '@civicpulse/shared';

export const updateIncidentClassificationTool: ToolDefinition = {
  name: 'updateIncidentClassification',
  description: 'Updates the taxonomy classification and category of an incident',
  category: 'WRITE',
  requiredPermission: 'tools:incident:classify',
  inputSchema: z.object({
    incidentId: z.string().min(1, 'incidentId is required'),
    category: z.enum([
      'POTHOLE',
      'GARBAGE',
      'STREETLIGHT',
      'WATER_LEAK',
      'DRAINAGE',
      'FALLEN_TREE',
      'ROAD_DAMAGE',
      'ILLEGAL_DUMPING',
      'OTHER',
    ]),
    reason: z.string().optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    category: z.string(),
    updatedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkUpdateIncidentClassification,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_CLASSIFICATION_UPDATED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const updated = await incidentService.updateIncidentClassification(
      input.incidentId,
      input.category as IncidentCategory,
      { actorType, actorId: context.agentId },
      input.reason
    );

    return {
      incidentId: input.incidentId,
      category: updated.category,
      updatedAt: new Date(updated.updatedAt || Date.now()).toISOString(),
    };
  },
};

export const updateIncidentLocationTool: ToolDefinition = {
  name: 'updateIncidentLocation',
  description: 'Updates incident geographic coordinates, municipal ward, and zone',
  category: 'WRITE',
  requiredPermission: 'tools:location:update',
  inputSchema: z.object({
    incidentId: z.string().min(1, 'incidentId is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1, 'address is required'),
    ward: z.string().min(1, 'ward is required'),
    zone: z.string().optional().default('Zone Alpha'),
    nearbyLandmarks: z.array(z.string()).optional(),
    sourceConfidence: z.number().min(0).max(1).optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string(),
    ward: z.string(),
    zone: z.string(),
    updatedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkUpdateIncidentLocation,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_LOCATION_UPDATED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const updated = await incidentService.updateIncidentLocation(
      input.incidentId,
      {
        coordinates: [input.longitude, input.latitude],
        address: input.address,
        ward: input.ward,
        zone: input.zone || 'Zone Alpha',
        nearbyLandmarks: input.nearbyLandmarks,
      },
      { actorType, actorId: context.agentId }
    );

    return {
      incidentId: input.incidentId,
      coordinates: updated.location.coordinates,
      address: updated.location.address,
      ward: updated.ward,
      zone: updated.zone,
      updatedAt: new Date(updated.updatedAt || Date.now()).toISOString(),
    };
  },
};

export const linkReportToIncidentTool: ToolDefinition = {
  name: 'linkReportToIncident',
  description: 'Links a duplicate citizen report to an existing canonical incident',
  category: 'WRITE',
  requiredPermission: 'tools:duplicate:link',
  inputSchema: z.object({
    reportId: z.string().min(1, 'reportId is required'),
    targetIncidentId: z.string().min(1, 'targetIncidentId is required'),
    reason: z.string().optional(),
  }),
  outputSchema: z.object({
    reportId: z.string(),
    targetIncidentId: z.string(),
    linkedAt: z.string(),
    totalReportCount: z.number(),
  }),
  policyCheck: PolicyRules.checkLinkReportToIncident,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.targetIncidentId,
    action: 'REPORT_LINKED_TO_INCIDENT',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const { incident } = await incidentService.linkReportToIncident(
      input.reportId,
      input.targetIncidentId,
      { actorType, actorId: context.agentId },
      input.reason
    );

    return {
      reportId: input.reportId,
      targetIncidentId: input.targetIncidentId,
      linkedAt: new Date().toISOString(),
      totalReportCount: incident.reportIds?.length || 1,
    };
  },
};

export const setSeverityTool: ToolDefinition = {
  name: 'setSeverity',
  description: 'Sets incident severity level and SLA target without changing incident state',
  category: 'WRITE',
  requiredPermission: 'tools:severity:set',
  inputSchema: z.object({
    incidentId: z.string().min(1, 'incidentId is required'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    rationaleSummary: z.string().optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    severity: z.string(),
    targetHours: z.number(),
    deadline: z.string(),
    updatedAt: z.string(),
  }),
  policyCheck: PolicyRules.checkSetSeverity,
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_SEVERITY_SET',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const updated = await incidentService.setIncidentSeverity(
      input.incidentId,
      input.severity as SeverityLevel,
      { actorType, actorId: context.agentId },
      input.rationaleSummary
    );

    return {
      incidentId: input.incidentId,
      severity: updated.severity,
      targetHours: updated.sla.targetHours,
      deadline: new Date(updated.sla.deadline).toISOString(),
      updatedAt: new Date(updated.updatedAt || Date.now()).toISOString(),
    };
  },
};

export const validateIncidentTool: ToolDefinition = {
  name: 'validateIncident',
  description: 'Transitions incident from ANALYZING to VALIDATED after all automated pre-routing verifications pass',
  category: 'WRITE',
  requiredPermission: 'tools:incident:validate',
  inputSchema: z.object({
    incidentId: z.string().min(1, 'incidentId is required'),
    reason: z.string().optional(),
  }),
  outputSchema: z.object({
    incidentId: z.string(),
    status: z.literal('VALIDATED'),
    validatedAt: z.string(),
  }),
  policyCheck: async (input) => {
    const incident = await incidentService.getIncidentById(input.incidentId);
    if (!incident) {
      return { allowed: false, policyVersion: '1.0.0', ruleId: 'RULE_VALIDATE_NOT_FOUND', reason: 'Incident not found' };
    }
    if (incident.status !== 'ANALYZING' && incident.status !== 'SUBMITTED') {
      return { allowed: false, policyVersion: '1.0.0', ruleId: 'RULE_VALIDATE_INVALID_STATUS', reason: `Incident must be in ANALYZING or SUBMITTED state to be validated. Current: ${incident.status}` };
    }
    return { allowed: true, policyVersion: '1.0.0', reason: 'Validation policy satisfied' };
  },
  auditConfig: {
    resourceType: 'INCIDENT',
    getResourceId: (input) => input.incidentId,
    action: 'INCIDENT_VALIDATED',
  },
  execute: async (input, context) => {
    const actorType =
      context.actorType === 'AI_AGENT'
        ? 'AI_AGENT'
        : context.actorType === 'SYSTEM'
        ? 'SYSTEM'
        : 'PLATFORM_ADMIN';

    const incident = await incidentService.getIncidentById(input.incidentId);
    if (incident && incident.status === 'SUBMITTED') {
      await incidentService.updateIncidentStatus(
        input.incidentId,
        'ANALYZING',
        { actorType, actorId: context.agentId },
        'Automated pipeline verification in progress'
      );
    }

    const updated = await incidentService.updateIncidentStatus(
      input.incidentId,
      'VALIDATED',
      { actorType, actorId: context.agentId },
      input.reason || 'All pre-routing agent verifications completed successfully'
    );

    return {
      incidentId: input.incidentId,
      status: 'VALIDATED' as const,
      validatedAt: new Date().toISOString(),
    };
  },
};

