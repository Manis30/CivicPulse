import { z } from 'zod';
import { ToolPermission } from '../permissions/permissions.js';
import { ToolExecutionContext } from './ToolExecutionContext.js';
import { PolicyEvaluationResult } from '../policies/policyTypes.js';

export interface AuditConfiguration<TInput = any, TOutput = any> {
  resourceType: 'INCIDENT' | 'WORK_ORDER' | 'EVIDENCE' | 'POLICY' | 'USER' | 'NOTIFICATION';
  getResourceId: (input: TInput, output: TOutput) => string;
  action: string;
}

export type ToolCategory = 'READ' | 'WRITE';

/**
 * Authoritative strongly-typed ToolDefinition interface.
 * Defines input/output schemas, permission requirements, policy checks, and execution delegates.
 */
export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  category: ToolCategory;
  requiredPermission: ToolPermission;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  policyCheck?: (
    input: TInput,
    context: ToolExecutionContext
  ) => Promise<PolicyEvaluationResult> | PolicyEvaluationResult;
  execute: (input: TInput, context: ToolExecutionContext) => Promise<TOutput>;
  auditConfig?: AuditConfiguration<TInput, TOutput>;
}

export interface ToolMetadata {
  name: string;
  description: string;
  category: ToolCategory;
  requiredPermission: ToolPermission;
  allowedAgents: string[];
}
