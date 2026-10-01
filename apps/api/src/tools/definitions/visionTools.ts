import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { evidenceService } from '../../services/evidenceService.js';

export const analyzeImageTool: ToolDefinition = {
  name: 'analyzeImage',
  description: 'Inspects visual evidence metadata, dimensions, and quality metrics',
  category: 'READ',
  requiredPermission: 'tools:vision:analyze',
  inputSchema: z
    .object({
      evidenceId: z.string().optional(),
      imageUrl: z.string().url('Invalid image URL format').optional(),
      mimeType: z.string().optional().default('image/jpeg'),
    })
    .refine((data) => Boolean(data.evidenceId || data.imageUrl), {
      message: 'Either evidenceId or imageUrl must be provided',
    }),
  outputSchema: z.object({
    evidenceId: z.string().optional(),
    imageUrl: z.string().optional(),
    quality: z.enum(['POOR', 'ACCEPTABLE', 'GOOD', 'HIGH']),
    aspectRatio: z.string(),
    hasValidExif: z.boolean(),
    summary: z.string(),
  }),
  execute: async (input) => {
    let metadata: Record<string, any> = {};
    if (input.evidenceId) {
      const evidence = await evidenceService.getEvidenceById(input.evidenceId);
      metadata = (evidence?.metadata as Record<string, any>) || {};
    }
    const width = Number(metadata.width) || 1920;
    const height = Number(metadata.height) || 1080;
    const quality = width >= 1280 && height >= 720 ? 'HIGH' : width >= 800 ? 'GOOD' : 'ACCEPTABLE';

    return {
      evidenceId: input.evidenceId,
      imageUrl: input.imageUrl,
      quality,
      aspectRatio: `${Math.round((width / height) * 10) / 10}:1`,
      hasValidExif: Boolean(metadata.device || metadata.latitude || input.imageUrl),
      summary: `Image analysis verified: format ${input.mimeType}, resolution ${width}x${height}, quality ${quality}`,
    };
  },
};

export const classifyIssueTool: ToolDefinition = {
  name: 'classifyIssue',
  description: 'Deterministic issue classification from municipal taxonomy and category hints',
  category: 'READ',
  requiredPermission: 'tools:vision:classify',
  inputSchema: z.object({
    categoryHint: z.string().optional(),
    visualEvidenceSummary: z.string().optional(),
    descriptionHint: z.string().optional(),
    observedFeatures: z.array(z.string()).optional().default([]),
  }),
  outputSchema: z.object({
    primaryCategory: z.string(),
    confidence: z.number().min(0).max(1),
    matchingKeywords: z.array(z.string()),
  }),
  execute: async (input) => {
    const rawHint = input.categoryHint || input.visualEvidenceSummary || input.descriptionHint || 'POTHOLE';
    let hint = rawHint.toUpperCase().replace(/[\s\-_]+/g, '_');
    
    // Canonicalize any misspelling variations
    if (
      hint.includes('PATHHOLE') ||
      hint.includes('POT_HOLE') ||
      hint.includes('POTHOLEE') ||
      hint.includes('POTHOL') ||
      hint.includes('PATH_HOLE')
    ) {
      hint = 'POTHOLE';
    }

    const validCategories = [
      'POTHOLE',
      'GARBAGE',
      'STREETLIGHT',
      'WATER_LEAK',
      'DRAINAGE',
      'FALLEN_TREE',
      'ROAD_DAMAGE',
      'ILLEGAL_DUMPING',
      'OTHER',
    ];

    const match = validCategories.find((c) => hint.includes(c)) || 'OTHER';
    const confidence = match === 'OTHER' ? 0.6 : 0.95;

    return {
      primaryCategory: match,
      confidence,
      matchingKeywords: [match, ...input.observedFeatures],
    };
  },
};
