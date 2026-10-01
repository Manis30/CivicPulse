import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { incidentService } from '../../services/incidentService.js';
import { IncidentCategory, IncidentStatus, SeverityLevel } from '@civicpulse/shared';

export const searchNearbyIncidentsTool: ToolDefinition = {
  name: 'searchNearbyIncidents',
  description: 'Searches for existing incidents within a geographic radius using 2dsphere indexing',
  category: 'READ',
  requiredPermission: 'tools:duplicate:search',
  inputSchema: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    radiusMeters: z.number().min(1).max(50000).default(500),
    category: z
      .enum([
        'POTHOLE',
        'GARBAGE',
        'STREETLIGHT',
        'WATER_LEAK',
        'DRAINAGE',
        'FALLEN_TREE',
        'ROAD_DAMAGE',
        'ILLEGAL_DUMPING',
        'OTHER',
      ])
      .optional(),
    excludeId: z.string().optional(),
  }),
  outputSchema: z.object({
    count: z.number(),
    radiusMeters: z.number(),
    incidents: z.array(
      z.object({
        id: z.string(),
        incidentNumber: z.string(),
        category: z.string(),
        status: z.string(),
        severity: z.string(),
        distanceHint: z.string().optional(),
      })
    ),
  }),
  execute: async (input) => {
    const results = await incidentService.findNearbyIncidents(
      [input.longitude, input.latitude],
      input.radiusMeters,
      {
        category: input.category as IncidentCategory,
        excludeId: input.excludeId,
      }
    );

    return {
      count: results.length,
      radiusMeters: input.radiusMeters,
      incidents: results.map((inc) => ({
        id: inc._id.toString(),
        incidentNumber: inc.incidentNumber,
        category: inc.category,
        status: inc.status,
        severity: inc.severity,
        distanceHint: `Within ${input.radiusMeters}m radius`,
      })),
    };
  },
};

export const compareDescriptionsTool: ToolDefinition = {
  name: 'compareDescriptions',
  description: 'Performs deterministic lexical similarity comparison between two incident descriptions',
  category: 'READ',
  requiredPermission: 'tools:duplicate:text',
  inputSchema: z.object({
    descriptionA: z.string().min(1),
    descriptionB: z.string().min(1),
  }),
  outputSchema: z.object({
    similarityScore: z.number().min(0).max(1),
    sharedTerms: z.array(z.string()),
    isLikelyDuplicate: z.boolean(),
  }),
  execute: async (input) => {
    const tokenize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const wordsA = new Set(tokenize(input.descriptionA));
    const wordsB = new Set(tokenize(input.descriptionB));

    const intersection = [...wordsA].filter((w) => wordsB.has(w));
    const union = new Set([...wordsA, ...wordsB]);

    const similarityScore = union.size > 0 ? Math.round((intersection.length / union.size) * 100) / 100 : 0;
    const isLikelyDuplicate = similarityScore >= 0.4;

    return {
      similarityScore,
      sharedTerms: intersection,
      isLikelyDuplicate,
    };
  },
};
