import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';

export const resolveCoordinatesTool: ToolDefinition = {
  name: 'resolveCoordinates',
  description: 'Reverse geocodes coordinates to street address, municipal ward, and sensitive landmarks',
  category: 'READ',
  requiredPermission: 'tools:location:geocode',
  inputSchema: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
  }),
  outputSchema: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string(),
    ward: z.string(),
    zone: z.string(),
    nearbyLandmarks: z.array(z.string()),
  }),
  execute: async (input) => {
    // Deterministic municipal coordinate grid mapping for NYC Metro simulation
    const { longitude, latitude } = input;
    let ward = 'Ward 4 - Midtown';
    let zone = 'Zone Alpha';

    if (latitude > 40.76) {
      ward = 'Ward 7 - Uptown';
      zone = 'Zone Gamma';
    } else if (latitude < 40.74) {
      ward = 'Ward 2 - Downtown';
      zone = 'Zone Beta';
    }

    return {
      coordinates: [longitude, latitude],
      address: `Municipal Sector at [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`,
      ward,
      zone,
      nearbyLandmarks: ['Arterial Corridor', 'Transit Hub'],
    };
  },
};

export const getWardTool: ToolDefinition = {
  name: 'getWard',
  description: 'Retrieves municipal ward information and operational zone details',
  category: 'READ',
  requiredPermission: 'tools:location:read',
  inputSchema: z.object({
    wardName: z.string().min(1),
  }),
  outputSchema: z.object({
    wardName: z.string(),
    zone: z.string(),
    activeSupervisorRole: z.string(),
    priorityCoverage: z.boolean(),
  }),
  execute: async (input) => {
    const isPriority = input.wardName.toLowerCase().includes('midtown') || input.wardName.toLowerCase().includes('downtown');
    return {
      wardName: input.wardName,
      zone: input.wardName.includes('Uptown') ? 'Zone Gamma' : input.wardName.includes('Downtown') ? 'Zone Beta' : 'Zone Alpha',
      activeSupervisorRole: 'DEPARTMENT_MANAGER',
      priorityCoverage: isPriority,
    };
  },
};
