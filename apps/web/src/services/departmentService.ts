import { apiClient } from './apiClient';

export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  categories: string[];
  wardIds: string[];
  slaPolicies: Record<string, number>;
  isActive: boolean;
}

export const PREVIEW_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'dept-roads',
    code: 'ROADS',
    name: 'Department of Transport & Roads',
    description: 'Responsible for road pavement, potholes, sidewalk repairs, and traffic signals.',
    categories: ['POTHOLE', 'ROAD_DAMAGE'],
    wardIds: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7'],
    slaPolicies: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 },
    isActive: true,
  },
  {
    id: 'dept-water',
    code: 'WATER',
    name: 'Water Supply & Sewerage Board',
    description: 'Potable water pipelines, distribution mains, and hydrant operations.',
    categories: ['WATER_LEAK'],
    wardIds: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7'],
    slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 2 },
    isActive: true,
  },
  {
    id: 'dept-sanitation',
    code: 'SANITATION',
    name: 'Solid Waste Management',
    description: 'Municipal waste collection, hazardous debris, and illegal dumping clearance.',
    categories: ['GARBAGE', 'ILLEGAL_DUMPING'],
    wardIds: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7'],
    slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 6 },
    isActive: true,
  },
];

export const departmentService = {
  async getDepartments(): Promise<DepartmentInfo[]> {
    try {
      const response = await apiClient.get('/departments');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data.map((d: any) => ({
          id: d._id || d.id,
          code: d.code,
          name: d.name,
          description: d.description,
          categories: d.categories || [],
          wardIds: d.wardIds || [],
          slaPolicies: d.slaPolicies || {},
          isActive: d.isActive ?? true,
        }));
      }
    } catch (err) {
      console.info('[departmentService] Live API unavailable. Using preview fallback.', err);
    }
    return PREVIEW_DEPARTMENTS;
  },
};
