import { IAIPolicy, AIPolicyModel, PolicyCategory, IPolicyRuleItem } from '../models/AIPolicy.js';

export class AIPolicyRepository {
  async create(data: Partial<IAIPolicy>): Promise<IAIPolicy> {
    return AIPolicyModel.create(data);
  }

  async findActiveByCategory(category: PolicyCategory): Promise<IAIPolicy | null> {
    return AIPolicyModel.findOne({ category, isActive: true }).sort({ version: -1 });
  }

  async findByNameAndVersion(name: string, version: number): Promise<IAIPolicy | null> {
    return AIPolicyModel.findOne({ name, version });
  }

  async findByName(name: string): Promise<IAIPolicy | null> {
    return AIPolicyModel.findOne({ name, isActive: true }).sort({ version: -1 });
  }

  async findActivePolicies(): Promise<IAIPolicy[]> {
    return AIPolicyModel.find({ isActive: true }).sort({ category: 1 });
  }

  /**
   * Version-safe Policy Update:
   * Appends to history and bumps version rather than overwriting historical rules.
   */
  async updatePolicy(
    name: string,
    updates: {
      newRules: Record<string, IPolicyRuleItem>;
      changedBy: string;
      reason: string;
    }
  ): Promise<IAIPolicy | null> {
    const existing = await AIPolicyModel.findOne({ name, isActive: true }).sort({ version: -1 });
    if (!existing) return null;

    const newVersion = existing.version + 1;
    const historyItem = {
      version: existing.version,
      changedBy: updates.changedBy,
      changedAt: new Date(),
      previousValue: Object.fromEntries(existing.rules || new Map()),
      newValue: updates.newRules,
      reason: updates.reason,
    };

    // Deactivate current version
    await AIPolicyModel.updateOne({ _id: existing._id }, { isActive: false });

    // Create new version with history
    const newPolicy = await AIPolicyModel.create({
      name: existing.name,
      version: newVersion,
      category: existing.category,
      agentId: existing.agentId,
      description: existing.description,
      rules: updates.newRules,
      isActive: true,
      history: [...(existing.history || []), historyItem],
      changedBy: updates.changedBy,
      changedAt: new Date(),
      reason: updates.reason,
    });

    return newPolicy;
  }
}

export const aiPolicyRepository = new AIPolicyRepository();
