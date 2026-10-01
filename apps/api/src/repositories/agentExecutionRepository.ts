import mongoose from 'mongoose';
import { IAgentExecution, AgentExecutionModel } from '../models/AgentExecution.js';
import { AgentId } from '@civicpulse/shared';

export class AgentExecutionRepository {
  async create(data: Partial<IAgentExecution>): Promise<IAgentExecution> {
    return AgentExecutionModel.create(data);
  }

  async findByExecutionId(executionId: string): Promise<IAgentExecution | null> {
    return AgentExecutionModel.findOne({ executionId });
  }

  async findByIncidentId(incidentId: string): Promise<IAgentExecution[]> {
    if (!mongoose.Types.ObjectId.isValid(incidentId)) return [];
    return AgentExecutionModel.find({ incidentId: new mongoose.Types.ObjectId(incidentId) }).sort({
      timestamp: 1,
    });
  }

  async findRecent(limit = 20, agentId?: AgentId): Promise<IAgentExecution[]> {
    const query = agentId ? { agentId } : {};
    return AgentExecutionModel.find(query).sort({ timestamp: -1 }).limit(limit);
  }

  async findByOrchestrationId(orchestrationId: string): Promise<IAgentExecution[]> {
    return AgentExecutionModel.find({ orchestrationId }).sort({ sequence: 1, timestamp: 1 });
  }
}

export const agentExecutionRepository = new AgentExecutionRepository();
