import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { SeverityLevel } from '@civicpulse/shared';

export const calculateSeverityRiskTool: ToolDefinition = {
  name: 'calculateSeverityRisk',
  description: 'Deterministic multi-factor risk assessment calculating severity score and priority SLA',
  category: 'READ',
  requiredPermission: 'tools:severity:calculate',
  inputSchema: z.object({
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
    nearbyDuplicatesCount: z.number().min(0).default(0),
    isNearCriticalInfrastructure: z.boolean().default(false),
    citizenReportsWithinHour: z.number().min(0).default(1),
  }),
  outputSchema: z.object({
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    riskScore: z.number().min(0).max(100),
    targetHours: z.number().positive(),
    factors: z.array(z.string()),
    explanation: z.string(),
  }),
  execute: async (input) => {
    let score = 20; // Base score
    const factors: string[] = [];

    // Category base weight
    if (input.category === 'WATER_LEAK' || input.category === 'ROAD_DAMAGE') {
      score += 35;
      factors.push(`High base hazard risk for ${input.category}`);
    } else if (input.category === 'POTHOLE' || input.category === 'DRAINAGE') {
      score += 25;
      factors.push(`Moderate structural impact for ${input.category}`);
    } else {
      score += 15;
      factors.push(`Standard baseline hazard for ${input.category}`);
    }

    // Critical infrastructure multiplier
    if (input.isNearCriticalInfrastructure) {
      score += 30;
      factors.push('Proximity to critical infrastructure (hospital/transit/school)');
    }

    // Citizen report volume surge
    if (input.citizenReportsWithinHour >= 3) {
      score += 20;
      factors.push(`Rapid citizen surge detected: ${input.citizenReportsWithinHour} reports in 1h`);
    }

    score = Math.min(100, score);

    let severity: SeverityLevel = 'LOW';
    let targetHours = 72;

    if (score >= 80) {
      severity = 'CRITICAL';
      targetHours = 4;
    } else if (score >= 60) {
      severity = 'HIGH';
      targetHours = 24;
    } else if (score >= 40) {
      severity = 'MEDIUM';
      targetHours = 48;
    }

    return {
      severity,
      riskScore: score,
      targetHours,
      factors,
      explanation: `Multi-factor risk index computed at ${score}/100. Recommended severity is ${severity} with ${targetHours}h SLA target.`,
    };
  },
};
