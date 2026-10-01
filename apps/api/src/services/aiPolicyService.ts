import { aiPolicyRepository } from '../repositories/aiPolicyRepository.js';
import { IAIPolicy, PolicyCategory, IPolicyRuleItem } from '../models/AIPolicy.js';
import { cacheService } from './cacheService.js';

export class AIPolicyService {
  async getActivePolicyByCategory(category: PolicyCategory): Promise<IAIPolicy | null> {
    return cacheService.wrap(`policies:category:${category}`, 120, async () => {
      return aiPolicyRepository.findActiveByCategory(category);
    });
  }

  async getActivePolicy(name?: string): Promise<IAIPolicy | null> {
    const key = name ? `policies:name:${name}` : 'policies:default';
    return cacheService.wrap(key, 120, async () => {
      if (name) {
        return aiPolicyRepository.findByName(name);
      }
      const all = await aiPolicyRepository.findActivePolicies();
      return all[0] || null;
    });
  }

  async getAllActivePolicies(): Promise<IAIPolicy[]> {
    return cacheService.wrap('policies:active:all', 120, async () => {
      return aiPolicyRepository.findActivePolicies();
    });
  }

  async updatePolicy(
    name: string,
    updates: {
      newRules: Record<string, IPolicyRuleItem>;
      changedBy: string;
      reason: string;
    }
  ): Promise<IAIPolicy | null> {
    const updated = await aiPolicyRepository.updatePolicy(name, updates);
    if (updated) {
      await cacheService.invalidatePolicies();
    }
    return updated;
  }
}

export const aiPolicyService = new AIPolicyService();
