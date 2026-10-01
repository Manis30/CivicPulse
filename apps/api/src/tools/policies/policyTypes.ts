/**
 * Standardized AI Policy Evaluation Result.
 */
export interface PolicyEvaluationResult {
  allowed: boolean;
  policyVersion: string;
  ruleId?: string;
  reason: string;
}
