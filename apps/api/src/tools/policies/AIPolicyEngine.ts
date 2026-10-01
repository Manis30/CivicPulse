import { PolicyEvaluationResult } from './policyTypes.js';
import { ToolExecutionContext } from '../registry/ToolExecutionContext.js';
import { aiPolicyService } from '../../services/aiPolicyService.js';
import { ToolDefinition } from '../registry/ToolDefinition.js';

/**
 * AIPolicyEngine
 * Deterministic policy gate enforcing business and regulatory rules before tool execution.
 * Reads persisted AIPolicy configuration from Phase 2 and executes tool-specific checks.
 */
export class AIPolicyEngine {
  /**
   * Evaluates policy compliance for a tool invocation.
   */
  static async evaluate(
    tool: ToolDefinition<any, any>,
    input: any,
    context: ToolExecutionContext
  ): Promise<PolicyEvaluationResult> {
    // 1. Fetch active system policy version
    const activePolicy = await aiPolicyService.getActivePolicy('CORE_OPERATIONAL_POLICY');
    const policyVersion = activePolicy ? `v${activePolicy.version}` : '1.0.0';

    // 2. If tool defines a specific deterministic policy check, execute it
    if (tool.policyCheck) {
      try {
        const checkResult = await tool.policyCheck(input, context);
        return {
          ...checkResult,
          policyVersion: checkResult.policyVersion || policyVersion,
        };
      } catch (err) {
        return {
          allowed: false,
          policyVersion,
          ruleId: 'POLICY_EVALUATION_ERROR',
          reason: `Policy evaluation error: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }

    // 3. Default: if no specific policy check is attached, tool is permitted under default rules
    return {
      allowed: true,
      policyVersion,
      reason: 'Standard policy clearance granted',
    };
  }
}
