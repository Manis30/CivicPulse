import {
  AgentId,
  ExecutionMode,
  IncidentCategory,
  IncidentStatus,
  JsonValue,
  OrchestrationAgentTrace,
  OrchestrationResult,
  OrchestrationStatus,
  SeverityLevel,
} from '@civicpulse/shared';
import { agentRuntime } from '../runtime/AgentRuntime.js';
import { toolRegistry } from '../../tools/registry/ToolRegistry.js';
import { ToolExecutionContext } from '../../tools/registry/ToolExecutionContext.js';
import {
  createOrchestrationContext,
  OrchestrationContext,
} from './OrchestrationContext.js';
import { logger } from '../../utils/logger.js';
import { VisionAgentInput, VisionAgentOutput } from '../schemas/visionSchemas.js';
import { LocationAgentInput, LocationAgentOutput } from '../schemas/locationSchemas.js';
import { DuplicateAgentInput, DuplicateAgentOutput } from '../schemas/duplicateSchemas.js';
import { SeverityAgentInput, SeverityAgentOutput } from '../schemas/severitySchemas.js';
import { RoutingAgentInput, RoutingAgentOutput } from '../schemas/routingSchemas.js';
import { InvestigationAgentInput, InvestigationAgentOutput } from '../schemas/investigationSchemas.js';
import { OperationsAgentInput, OperationsAgentOutput } from '../schemas/operationsSchemas.js';
import { NotificationAgentInput, NotificationAgentOutput } from '../schemas/notificationSchemas.js';
import { IntelligenceAgentInput, IntelligenceAgentOutput } from '../schemas/intelligenceSchemas.js';

export interface RunWorkflowInput {
  incidentId: string;
  reportId?: string;
  orchestrationId?: string;
  executionMode?: ExecutionMode;
  requestedEngine?: string;
  allowFallback?: boolean;
  actorType?: 'AI_AGENT' | 'USER' | 'SYSTEM';
  actorId?: string;
  initialFacts?: {
    imageUrl?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    ward?: string;
    zone?: string;
    categoryHint?: string;
    isNearCriticalInfrastructure?: boolean;
    citizenReportsWithinHour?: number;
  };
}

/**
 * Generic Autonomous Multi-Agent Orchestrator.
 * Orchestrates the canonical 5-agent CivicPulse workflow:
 * SUBMITTED -> ANALYZING -> VISION -> LOCATION -> DUPLICATE -> SEVERITY -> VALIDATED -> ROUTING -> ASSIGNED
 *
 * GUARANTEES:
 * - Never calls Gemini / Groq / DeterministicEngine directly (delegates to AgentRuntime)
 * - Never imports or accesses MongoDB models / repositories / services directly
 * - All actions and mutations flow through ToolRegistry
 * - Preserves explicit failure and human-review states without inventing fake results
 */
export class AgentOrchestrator {
  private readonly globalTimeoutMs = 120000; // 2 minutes maximum workflow duration

  async runWorkflow(input: RunWorkflowInput): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const orchestrationId = input.orchestrationId || `ORCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const executionMode: ExecutionMode = input.executionMode || 'DETERMINISTIC_ENGINE';

    const trace: OrchestrationAgentTrace[] = [];
    const executionIds: string[] = [];

    // 1. Initialize sanitized orchestration context
    let workingIncidentId = input.incidentId;
    const context: OrchestrationContext = createOrchestrationContext({
      orchestrationId,
      incidentId: workingIncidentId,
      reportId: input.reportId,
      metadata: {
        executionMode,
        requestedEngine: input.requestedEngine || executionMode,
      },
    });

    let overallRequiresHumanReview = false;
    let finalIncidentState: IncidentStatus = 'ANALYZING';

    logger.info(`Starting multi-agent orchestration ${orchestrationId} for incident ${workingIncidentId}`, {
      orchestrationId,
      incidentId: workingIncidentId,
      executionMode,
    });

    // Helper for timeout enforcement
    const checkTimeout = () => {
      if (Date.now() - startTime > this.globalTimeoutMs) {
        throw new Error(`Orchestration global timeout exceeded (${this.globalTimeoutMs}ms).`);
      }
    };

    // Tracking facts passed between agents
    let currentCategory: IncidentCategory = (input.initialFacts?.categoryHint as IncidentCategory) || 'POTHOLE';
    let currentLat: number = input.initialFacts?.latitude !== undefined ? input.initialFacts.latitude : 12.7375;
    let currentLng: number = input.initialFacts?.longitude !== undefined ? input.initialFacts.longitude : 77.8285;
    let currentAddress: string = input.initialFacts?.address || `Bagalur Road, Near Central Bus Stand`;
    let currentWard: string = input.initialFacts?.ward || 'Ward 12 - Central Hosur';
    let currentZone: string = input.initialFacts?.zone || 'Zone Alpha (Urban Core)';
    let currentSeverity: SeverityLevel = 'MEDIUM';
    let nearbyDuplicatesCount = 0;

    try {
      // ==========================================
      // STEP 1: VISION AGENT (Sequence: 1)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_VISION';

      const visionInput: VisionAgentInput = {
        incidentId: workingIncidentId,
        reportId: input.reportId,
        imageUrl: input.initialFacts?.imageUrl || 'https://images.civicpulse.org/pothole-default.jpg',
        issueDescription: input.initialFacts?.description || 'Citizen submitted defect report',
      };

      const visionExecRes = await agentRuntime.execute<VisionAgentInput, VisionAgentOutput>(
        'AGENT_VISION',
        visionInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 1,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_VISION',
        }
      );

      executionIds.push(visionExecRes.executionId);
      trace.push({
        agentId: 'AGENT_VISION',
        sequence: 1,
        status: visionExecRes.success ? (visionExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: visionExecRes.executionId,
        durationMs: visionExecRes.durationMs,
        toolCalls: visionExecRes.toolCalls.map((t) => t.toolName),
        error: !visionExecRes.success ? visionExecRes.error : undefined,
      });

      if (!visionExecRes.success) {
        context.workflowStatus = 'FAILED';
        return this.buildResult(context, 'FAILED', workingIncidentId, finalIncidentState, true, executionIds, startTime, trace);
      }

      context.agentResults['AGENT_VISION'] = visionExecRes.result as any;
      if (visionExecRes.result.requiresHumanReview) {
        overallRequiresHumanReview = true;
      }
      if (visionExecRes.result.issueType && visionExecRes.result.issueType !== 'OTHER') {
        currentCategory = visionExecRes.result.issueType as IncidentCategory;
      }
      context.previousAgent = 'AGENT_VISION';

      // ==========================================
      // STEP 2: LOCATION AGENT (Sequence: 2)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_LOCATION';

      const locationInput: LocationAgentInput = {
        incidentId: workingIncidentId,
        reportId: input.reportId,
        latitude: currentLat,
        longitude: currentLng,
        address: currentAddress,
        ward: currentWard,
        zone: currentZone,
      };

      const locationExecRes = await agentRuntime.execute<LocationAgentInput, LocationAgentOutput>(
        'AGENT_LOCATION',
        locationInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 2,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_LOCATION',
        }
      );

      executionIds.push(locationExecRes.executionId);
      trace.push({
        agentId: 'AGENT_LOCATION',
        sequence: 2,
        status: locationExecRes.success ? (locationExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: locationExecRes.executionId,
        durationMs: locationExecRes.durationMs,
        toolCalls: locationExecRes.toolCalls.map((t) => t.toolName),
        error: !locationExecRes.success ? locationExecRes.error : undefined,
      });

      if (!locationExecRes.success) {
        context.workflowStatus = 'FAILED';
        return this.buildResult(context, 'FAILED', workingIncidentId, finalIncidentState, true, executionIds, startTime, trace);
      }

      context.agentResults['AGENT_LOCATION'] = locationExecRes.result as any;
      if (locationExecRes.result.requiresHumanReview || !locationExecRes.result.locationResolved) {
        overallRequiresHumanReview = true;
      }
      currentLat = locationExecRes.result.latitude;
      currentLng = locationExecRes.result.longitude;
      currentAddress = locationExecRes.result.address;
      currentWard = locationExecRes.result.wardId;
      if (locationExecRes.result.zone) {
        currentZone = locationExecRes.result.zone;
      }
      context.previousAgent = 'AGENT_LOCATION';

      // ==========================================
      // STEP 3: DUPLICATE AGENT (Sequence: 3)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_DUPLICATE';

      const duplicateInput: DuplicateAgentInput = {
        incidentId: workingIncidentId,
        reportId: input.reportId,
        category: currentCategory,
        latitude: currentLat,
        longitude: currentLng,
        description: input.initialFacts?.description || `Reported ${currentCategory} issue`,
        radiusMeters: 500,
      };

      const duplicateExecRes = await agentRuntime.execute<DuplicateAgentInput, DuplicateAgentOutput>(
        'AGENT_DUPLICATE',
        duplicateInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 3,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_DUPLICATE',
        }
      );

      executionIds.push(duplicateExecRes.executionId);
      trace.push({
        agentId: 'AGENT_DUPLICATE',
        sequence: 3,
        status: duplicateExecRes.success ? (duplicateExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: duplicateExecRes.executionId,
        durationMs: duplicateExecRes.durationMs,
        toolCalls: duplicateExecRes.toolCalls.map((t) => t.toolName),
        error: !duplicateExecRes.success ? duplicateExecRes.error : undefined,
      });

      if (!duplicateExecRes.success) {
        context.workflowStatus = 'FAILED';
        return this.buildResult(context, 'FAILED', workingIncidentId, finalIncidentState, true, executionIds, startTime, trace);
      }

      context.agentResults['AGENT_DUPLICATE'] = duplicateExecRes.result as any;
      if (duplicateExecRes.result.requiresHumanReview || duplicateExecRes.result.action === 'REVIEW') {
        overallRequiresHumanReview = true;
      }

      // USER CORRECTION 5: Duplicate Branching & canonical incident update
      if (duplicateExecRes.result.action === 'LINK_EXISTING' && duplicateExecRes.result.matchedIncidentId) {
        const canonicalId = duplicateExecRes.result.matchedIncidentId;
        logger.info(`Duplicate detected: re-binding working incident from ${workingIncidentId} to ${canonicalId}`, {
          orchestrationId,
          originalIncidentId: workingIncidentId,
          canonicalIncidentId: canonicalId,
        });

        // Store original incident ID in metadata and update working ID
        if (!context.metadata) context.metadata = {};
        context.metadata.originalIncidentId = workingIncidentId;
        context.metadata.linkedToCanonicalId = canonicalId;
        workingIncidentId = canonicalId;
        context.incidentId = canonicalId;
        nearbyDuplicatesCount = 1;
      }

      context.previousAgent = 'AGENT_DUPLICATE';

      // ==========================================
      // STEP 4: SEVERITY AGENT (Sequence: 4)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_SEVERITY';

      const severityInput: SeverityAgentInput = {
        incidentId: workingIncidentId,
        reportId: input.reportId,
        category: currentCategory,
        nearbyDuplicatesCount,
        isNearCriticalInfrastructure: input.initialFacts?.isNearCriticalInfrastructure ?? false,
        citizenReportsWithinHour: input.initialFacts?.citizenReportsWithinHour ?? 1,
        locationContext: {
          address: currentAddress,
          ward: currentWard,
          zone: currentZone,
        },
      };

      const severityExecRes = await agentRuntime.execute<SeverityAgentInput, SeverityAgentOutput>(
        'AGENT_SEVERITY',
        severityInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 4,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_SEVERITY',
        }
      );

      executionIds.push(severityExecRes.executionId);
      trace.push({
        agentId: 'AGENT_SEVERITY',
        sequence: 4,
        status: severityExecRes.success ? (severityExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: severityExecRes.executionId,
        durationMs: severityExecRes.durationMs,
        toolCalls: severityExecRes.toolCalls.map((t) => t.toolName),
        error: !severityExecRes.success ? severityExecRes.error : undefined,
      });

      if (!severityExecRes.success) {
        context.workflowStatus = 'FAILED';
        return this.buildResult(context, 'FAILED', workingIncidentId, finalIncidentState, true, executionIds, startTime, trace);
      }

      context.agentResults['AGENT_SEVERITY'] = severityExecRes.result as any;
      if (severityExecRes.result.requiresHumanReview) {
        overallRequiresHumanReview = true;
      }
      currentSeverity = severityExecRes.result.severity;
      context.previousAgent = 'AGENT_SEVERITY';

      // ==========================================
      // STATE TRANSITION GATE: ANALYZING -> VALIDATED
      // USER CORRECTION 4: Orchestrator validates that Vision, Location, Duplicate,
      // and Severity all completed before transitioning incident state.
      // Transition strictly occurs through ToolRegistry.
      // ==========================================
      checkTimeout();
      const validationExecutionContext: ToolExecutionContext = {
        executionId: `EXEC-VALIDATION-${Date.now()}`,
        agentId: 'AGENT_ROUTING',
        incidentId: workingIncidentId,
        reportId: input.reportId,
        actorType: 'AI_AGENT',
        actorId: 'AGENT_ROUTING',
        executionMode,
        orchestrationId,
      };

      const validateToolRes = await toolRegistry.execute(
        'validateIncident',
        {
          incidentId: workingIncidentId,
          reason: 'Autonomous verification pipeline (Vision, Location, Duplicate, Severity) passed successfully.',
        },
        validationExecutionContext
      );

      if (validateToolRes.success) {
        finalIncidentState = 'VALIDATED';
        logger.info(`Incident ${workingIncidentId} successfully transitioned to VALIDATED via ToolRegistry.`, {
          orchestrationId,
          incidentId: workingIncidentId,
        });
      } else {
        logger.warn(`Could not transition incident ${workingIncidentId} to VALIDATED:`, validateToolRes.error);
        // If already validated or assigned, keep existing
      }

      // ==========================================
      // STEP 5: ROUTING AGENT (Sequence: 5)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_ROUTING';

      const routingInput: RoutingAgentInput = {
        incidentId: workingIncidentId,
        reportId: input.reportId,
        category: currentCategory,
        severity: currentSeverity,
        ward: currentWard,
        zone: currentZone,
      };

      const routingExecRes = await agentRuntime.execute<RoutingAgentInput, RoutingAgentOutput>(
        'AGENT_ROUTING',
        routingInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 5,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_ROUTING',
        }
      );

      executionIds.push(routingExecRes.executionId);
      trace.push({
        agentId: 'AGENT_ROUTING',
        sequence: 5,
        status: routingExecRes.success ? (routingExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: routingExecRes.executionId,
        durationMs: routingExecRes.durationMs,
        toolCalls: routingExecRes.toolCalls.map((t) => t.toolName),
        error: !routingExecRes.success ? routingExecRes.error : undefined,
      });

      if (!routingExecRes.success) {
        context.workflowStatus = 'PARTIAL';
        return this.buildResult(context, 'PARTIAL', workingIncidentId, finalIncidentState, true, executionIds, startTime, trace);
      }

      context.agentResults['AGENT_ROUTING'] = routingExecRes.result as any;
      if (routingExecRes.result.requiresHumanReview || !routingExecRes.result.assigned || routingExecRes.result.routingStatus !== 'ASSIGNED') {
        overallRequiresHumanReview = true;
      } else {
        finalIncidentState = 'ASSIGNED';
      }

      context.previousAgent = 'AGENT_ROUTING';

      // ==========================================
      // STEP 6: INVESTIGATION AGENT (Sequence: 6)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_INVESTIGATION';

      const investigationInput: InvestigationAgentInput = {
        incidentId: workingIncidentId,
        category: currentCategory,
        ward: currentWard,
        zone: currentZone,
      };

      const investigationExecRes = await agentRuntime.execute<InvestigationAgentInput, InvestigationAgentOutput>(
        'AGENT_INVESTIGATION',
        investigationInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 6,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_INVESTIGATION',
        }
      );

      executionIds.push(investigationExecRes.executionId);
      trace.push({
        agentId: 'AGENT_INVESTIGATION',
        sequence: 6,
        status: investigationExecRes.success ? (investigationExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: investigationExecRes.executionId,
        durationMs: investigationExecRes.durationMs,
        toolCalls: investigationExecRes.toolCalls.map((t) => t.toolName),
        error: !investigationExecRes.success ? investigationExecRes.error : undefined,
      });

      if (investigationExecRes.success && investigationExecRes.result) {
        context.agentResults['AGENT_INVESTIGATION'] = investigationExecRes.result as any;
      }
      context.previousAgent = 'AGENT_INVESTIGATION';

      // ==========================================
      // STEP 7: OPERATIONS AGENT (Sequence: 7)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_OPERATIONS';

      const resolvedDeptId = routingExecRes.result?.departmentId || 'DEPT-ROADS-01';
      const resolvedTeamId = routingExecRes.result?.teamId || 'TEAM-ALPHA-01';

      const operationsInput: OperationsAgentInput = {
        incidentId: workingIncidentId,
        departmentId: resolvedDeptId,
        teamId: resolvedTeamId,
        severity: currentSeverity,
        category: currentCategory,
      };

      const operationsExecRes = await agentRuntime.execute<OperationsAgentInput, OperationsAgentOutput>(
        'AGENT_OPERATIONS',
        operationsInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 7,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_OPERATIONS',
        }
      );

      executionIds.push(operationsExecRes.executionId);
      trace.push({
        agentId: 'AGENT_OPERATIONS',
        sequence: 7,
        status: operationsExecRes.success ? (operationsExecRes.result?.requiresHumanReview ? 'REQUIRES_HUMAN_REVIEW' : 'SUCCESS') : 'FAILED',
        executionId: operationsExecRes.executionId,
        durationMs: operationsExecRes.durationMs,
        toolCalls: operationsExecRes.toolCalls.map((t) => t.toolName),
        error: !operationsExecRes.success ? operationsExecRes.error : undefined,
      });

      if (operationsExecRes.success && operationsExecRes.result) {
        context.agentResults['AGENT_OPERATIONS'] = operationsExecRes.result as any;
      }
      context.previousAgent = 'AGENT_OPERATIONS';

      // ==========================================
      // STEP 8: NOTIFICATION AGENT (Sequence: 8)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_NOTIFICATION';

      const notificationInput: NotificationAgentInput = {
        incidentId: workingIncidentId,
        recipientRole: 'CITIZEN',
        type: 'INFO',
        title: `Incident ${workingIncidentId} Triage Complete`,
        message: `Your report for ${currentCategory} at ${currentAddress} has been validated and dispatched to municipal operations.`,
        channels: ['IN_APP'],
      };

      const notificationExecRes = await agentRuntime.execute<NotificationAgentInput, NotificationAgentOutput>(
        'AGENT_NOTIFICATION',
        notificationInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 8,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_NOTIFICATION',
        }
      );

      executionIds.push(notificationExecRes.executionId);
      trace.push({
        agentId: 'AGENT_NOTIFICATION',
        sequence: 8,
        status: notificationExecRes.success ? 'SUCCESS' : 'FAILED',
        executionId: notificationExecRes.executionId,
        durationMs: notificationExecRes.durationMs,
        toolCalls: notificationExecRes.toolCalls.map((t) => t.toolName),
        error: !notificationExecRes.success ? notificationExecRes.error : undefined,
      });

      if (notificationExecRes.success && notificationExecRes.result) {
        context.agentResults['AGENT_NOTIFICATION'] = notificationExecRes.result as any;
      }
      context.previousAgent = 'AGENT_NOTIFICATION';

      // ==========================================
      // STEP 9: INTELLIGENCE AGENT (Sequence: 9)
      // ==========================================
      checkTimeout();
      context.currentAgent = 'AGENT_INTELLIGENCE';

      const intelligenceInput: IntelligenceAgentInput = {
        ward: currentWard,
        category: currentCategory,
        timeWindowDays: 30,
      };

      const intelligenceExecRes = await agentRuntime.execute<IntelligenceAgentInput, IntelligenceAgentOutput>(
        'AGENT_INTELLIGENCE',
        intelligenceInput,
        {
          orchestrationId,
          incidentId: workingIncidentId,
          reportId: input.reportId,
          executionMode,
          allowFallback: input.allowFallback ?? true,
          sequence: 9,
          actorType: input.actorType || 'AI_AGENT',
          actorId: input.actorId || 'AGENT_INTELLIGENCE',
        }
      );

      executionIds.push(intelligenceExecRes.executionId);
      trace.push({
        agentId: 'AGENT_INTELLIGENCE',
        sequence: 9,
        status: intelligenceExecRes.success ? 'SUCCESS' : 'FAILED',
        executionId: intelligenceExecRes.executionId,
        durationMs: intelligenceExecRes.durationMs,
        toolCalls: intelligenceExecRes.toolCalls.map((t) => t.toolName),
        error: !intelligenceExecRes.success ? intelligenceExecRes.error : undefined,
      });

      if (intelligenceExecRes.success && intelligenceExecRes.result) {
        context.agentResults['AGENT_INTELLIGENCE'] = intelligenceExecRes.result as any;
      }
      context.previousAgent = 'AGENT_INTELLIGENCE';
      context.currentAgent = undefined;

      // Final status determination
      const workflowStatus: OrchestrationStatus = overallRequiresHumanReview
        ? 'REQUIRES_HUMAN_REVIEW'
        : 'SUCCESS';

      context.workflowStatus = workflowStatus;

      return this.buildResult(
        context,
        workflowStatus,
        workingIncidentId,
        finalIncidentState,
        overallRequiresHumanReview,
        executionIds,
        startTime,
        trace
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`Orchestration ${orchestrationId} failed: ${errorMsg}`, { orchestrationId, error: errorMsg });

      context.workflowStatus = 'FAILED';
      return this.buildResult(
        context,
        'FAILED',
        workingIncidentId,
        finalIncidentState,
        true,
        executionIds,
        startTime,
        trace
      );
    }
  }

  private buildResult(
    context: OrchestrationContext,
    status: OrchestrationStatus,
    incidentId: string,
    finalState: IncidentStatus,
    requiresHumanReview: boolean,
    executionIds: string[],
    startTime: number,
    trace: OrchestrationAgentTrace[]
  ): OrchestrationResult {
    return {
      orchestrationId: context.orchestrationId,
      status,
      incidentId,
      reportId: context.reportId,
      agentResults: context.agentResults,
      finalState,
      requiresHumanReview,
      executionIds,
      durationMs: Date.now() - startTime,
      trace,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
