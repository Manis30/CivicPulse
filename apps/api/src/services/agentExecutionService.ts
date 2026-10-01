import mongoose from 'mongoose';
import { agentExecutionRepository } from '../repositories/agentExecutionRepository.js';
import { IAgentExecution } from '../models/AgentExecution.js';
import { AgentId, ExecutionMode, AgentExecutionStatus, JsonValue } from '@civicpulse/shared';

export interface RecordExecutionInput {
  executionId?: string;
  agentId: AgentId;
  agentName: string;
  executionMode: ExecutionMode;
  requestedEngine?: ExecutionMode;
  actualEngine?: ExecutionMode;
  fallbackReason?: string;
  orchestrationId?: string;
  parentExecutionId?: string;
  sequence?: number;
  incidentId?: string;
  reportId?: string;
  toolsCalled?: Array<{
    toolName: string;
    input: JsonValue;
    output: JsonValue;
    durationMs: number;
    success: boolean;
    error?: string;
  }>;
  reasoning?: string;
  iterations?: number;
  durationMs: number;
  status: AgentExecutionStatus;
  error?: { code: string; message: string };
  retryCount?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class AgentExecutionService {
  async recordExecution(input: RecordExecutionInput): Promise<IAgentExecution> {
    const executionId = input.executionId || `EXEC-2026-${Date.now().toString().slice(-6)}`;

    return agentExecutionRepository.create({
      executionId,
      agentId: input.agentId,
      agentName: input.agentName,
      executionMode: input.executionMode,
      requestedEngine: input.requestedEngine,
      actualEngine: input.actualEngine,
      fallbackReason: input.fallbackReason,
      orchestrationId: input.orchestrationId,
      parentExecutionId: input.parentExecutionId,
      sequence: input.sequence,
      incidentId:
        input.incidentId && mongoose.Types.ObjectId.isValid(input.incidentId)
          ? new mongoose.Types.ObjectId(input.incidentId)
          : undefined,
      reportId:
        input.reportId && mongoose.Types.ObjectId.isValid(input.reportId)
          ? new mongoose.Types.ObjectId(input.reportId)
          : undefined,
      toolsCalled: (input.toolsCalled as any) || [],
      reasoning: input.reasoning,
      iterations: input.iterations,
      durationMs: input.durationMs,
      status: input.status,
      error: input.error,
      retryCount: input.retryCount || 0,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      timestamp: new Date(),
    });
  }

  async getRecentExecutions(limit = 20, agentId?: AgentId): Promise<IAgentExecution[]> {
    return agentExecutionRepository.findRecent(limit, agentId);
  }

  async getExecutionsForIncident(incidentId: string): Promise<IAgentExecution[]> {
    return agentExecutionRepository.findByIncidentId(incidentId);
  }

  async getExecutionsForOrchestration(orchestrationId: string): Promise<IAgentExecution[]> {
    return agentExecutionRepository.findByOrchestrationId(orchestrationId);
  }
}

export const agentExecutionService = new AgentExecutionService();
